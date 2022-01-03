import WsClient from "./WsClient.mjs";
import { Parent } from "./BaseBlock.mjs";
import { Block } from "./BaseBlock.mjs";
import FileBrowser from "./FileBrowser.mjs";
import pyimport from "./pyjs.mjs";
import TabView from "./TabView.mjs";

class Session {
    warnBeforeLoad() {
        if (this.model && this.model._blocks && this.model._blocks.length) {
            return confirm("Overwrite existing receipe?");
        }
        return true;
    }
    load() {
        if (!this.warnBeforeLoad()) return null; 
        return new Promise((res, rej) => {
            WsClient.send("dump").then(r => {
                const receipe = pyimport(r.receipe);
                if (!receipe || receipe.length == 0) {
                    this.reset();
                    return;
                }
                // const root = new Root({
                //     children: [receipe] //2D array to align with Split Class
                // });
                this.#setReceipe(receipe);
                receipe.model_changed = false;
                res(this);
            }).catch((e)=>{
                rej(e);
            });
        });
    }
    dump() {
        const model = this.model;
        if (!model || !model.export) return;
        const receipe = model.export();
        return WsClient.send("load", {dump: receipe}).then(r=>{
            receipe.model_changed = false;
        });
    }
    loadRemote(name) {
        if (this.model.model_changed && !this.warnBeforeLoad()) return null; 
        return $.ajax({
            dataType: "json",
            url: name,
        }).then(r => {
            const receipe = pyimport(r);
            if (!receipe || receipe.length == 0) return;
            // const root = new Root({
            //     name: name.split(".")[0].split("/").pop(),
            //     children: [receipe] //2D array to align with Split Class
            // });
            this.#setReceipe(receipe);
            this.model.model_changed = true;
            return this;
        });
    }
    #setReceipe(receipe) {
        this.model = receipe;
        receipe._session = this;
        this.render();
    }
    render() {
        if (!this.$receipe) return;
        this.$receipe.html("");
        this.model.render().appendTo(this.$receipe);
    }
    reset() {
        if (!this.warnBeforeLoad()) return null; 
        const parent = new Parent({name: "Untitled", _type: "skll.block.baseblock.Parent"});
        const input = new Block({name: "Input", _type: "skll.block.input.FileInput"});
        parent.append(input, 0);
        this.#setReceipe(parent);
        this.model._model_changed = true;
    }
    /**
     * Cook the receipe
     * @param mode "PREVIEW", "TRAIN", "TEST", "RUN"
     * @param upto Block (or block name)
     * @param usage "table" or "plotly", defines return format
     * @returns Promise
     */
    run(mode, upto, usage) {
        if (typeof(mode)=="string") mode = mode.toUpperCase();
        switch(mode) {
            case "COLUMNS":
            case "PREVIEW":
            case "TRAIN":
            case "TEST":
            case "RUN":
                break;
            default:
                mode = "PREVIEW";
        }
        return new Promise((res, rej) => {
            if (this.model.model_changed) {
                if (!confirm("Receipe not in sync with runtime, sync now?"))
                    rej("Receipe not in sync");
                this.dump().then(r=>{
                    res(r);
                }).catch((ex)=>{
                    rej(ex);
                });
            } else {
                res();
            }
        }).then(r => {
            return WsClient.send("run", {
                mode: mode,
                upto: (upto && upto.name) ? upto.name : null,
            });
        }).then((r) => {
            return WsClient.send("result", {usage: usage});
        }).catch((ex)=> {
            alert("See log for error message");
            return null;
        });
    }
    static encode(s) {
        var out = [];
        for ( var i = 0; i < s.length; i++ ) {
            out[i] = s.charCodeAt(i);
        }
        return new Uint8Array( out );
    }
    saveLocal() {
        const blob = new Blob([Session.encode(JSON.stringify(this.model.export(), null, 4))], {
            type: 'application/octet-stream'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement( 'a' );
        link.setAttribute( 'href', url );
        link.setAttribute( 'download', 'model.json' );
        const event = document.createEvent( 'MouseEvents' );
        event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent( event );
    }
    save() {
        const blob = new Blob([Session.encode(JSON.stringify(this.model.export(), null, 4))], {
            type: 'application/octet-stream'
        });
        WsClient.uploadBlob(blob, `${this.model.name}.json`).then(r=>{
            FileBrowser.refresh();
        });
    }

    constructor() {
        if (Session.instance) {
            return Session.instance;
        }
        this.$dom = $("<div>").addClass("session");
        this.$receipe = $("<div>").addClass("receipe").appendTo(this.$dom);
        this.$table = $("<div>").addClass("data").appendTo(this.$dom);
        this.tabView = new TabView(this.$table);
        this.load();
        Session.instance = this;
    }

    get panel() {
        return this.$dom;
    }
}

const instance = new Session();
export default instance;