import { WsClient } from "./WsClient.mjs";
import { Parent } from "./BaseBlock.mjs";
import { Block } from "./BaseBlock.mjs";
import { LogPanel } from "./LogPanel.mjs";
import FileBrowser from "./FileBrowser.mjs";
import pyimport from "./pyjs.mjs";
import TabView from "./TabView.mjs";

export class Session {

    warnBeforeLoad() {
        if (this.model && this.model._blocks && this.model._blocks.length) {
            return confirm("Overwrite existing receipe?");
        }
        return true;
    }
    load() {
        if (!this.warnBeforeLoad()) return null; 
        return new Promise((res, rej) => {
            this.WsClient.send("dump").then(r => {
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
        return this.WsClient.send("load", {dump: receipe}).then(r=>{
            this.model.model_changed = false;
        });
    }
    readRemote(name) {
        return $.ajax({
            dataType: "json",
            url: `/storage${name}`,
        }).then(r => {
            const receipe = pyimport(r);
            if (!receipe || receipe.length == 0) throw "No receipe";
            return receipe;
        });
    }
    loadRemote(name) {
        if (this.model.model_changed && !this.warnBeforeLoad()) return null;
        this.readRemote(name).then(receipe => {
            this.#setReceipe(receipe);
            this.model.model_changed = true;
        }).catch(() => {
        });
        return this;
    }
    #setReceipe(receipe) {
        this.model = receipe;
        receipe._session = this;
        this.render();
    }
    render() {
        if (!this.$receipe) return;
        this.$receipe.html("");
        // add model drag and drop part
        $('<div class="receipe-drop-zone">')
            .on("mouseenter", {thiz: this}, Block.onmouseover)
            .on("mouseleave", {thiz: this}, Block.onmouseout)
            .on("mouseup", {thiz: this}, Block.onmouseup)
            .appendTo(this.$receipe);
        this.model.render().addClass("root-block").appendTo(this.$receipe);
    }
    reset() {
        if (!this.warnBeforeLoad()) return null; 
        const parent = new Parent({name: "Untitled", _jstype: "skll.block.baseblock.Parent"});
        const input = new Block({name: "Input", _jstype: "skll.block.input.FileInput"});
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
        this.model.clearMarkups();
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
            $('<div class="blockage">').appendTo(this.$receipe);
            return this.WsClient.send("run", {
                mode: mode,
                upto: (upto && upto.name) ? upto.name : null,
            });
        }).then((r) => {
            return this.WsClient.send("result", {usage: usage});
        }).catch((ex)=> {
            alert("See log for error message");
            return null;
        }).finally(()=>{
            this.$receipe.find(".blockage").remove();
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
        link.setAttribute( 'download', `${this.model.name}.skll.json` );
        const event = document.createEvent( 'MouseEvents' );
        event.initMouseEvent( 'click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent( event );
    }
    save() {
        const blob = new Blob([Session.encode(JSON.stringify(this.model.export(), null, 4))], {
            type: 'application/octet-stream'
        });
        this.WsClient.uploadBlob(blob, `${FileBrowser._cd}/${this.model.name}.skll.json`).then(r=>{
            FileBrowser.refresh();
        });
    }
    publish() {
        //TODO create publish dialog and ask for
        //  1. how should the runtime run (Rest/WebSocket)
        //  2. instance name, port, etc
        //  3. should input block automatically disabled
        //TODO Create dockerfile and package everything for deployment
        //
        if (!confirm('Please make sure the receipe is fully "cooked" and all input blocks are configured for runtime accordingly')) 
            return;
        const name = `${FileBrowser._cd}/${this.model.name}.skll.dump`;
        FileBrowser.checkExist(name).then(exist => {
            if (exist && !confirm(`${name} already exist, overwrite?`)) throw -1;
            return this.WsClient.send("export", {
                path: name,
                dropinput: true,
            });
        }).then(() => {
            alert(`Receipe exported to ${name}`);
        }).catch((e)=> {
            if (e === -1) return;
            alert("Failed to publish, see log for more details");
        })
    }

    becomeDropTarget(src) {
        if (!src._blocks) return;
        this._droptype = "dropreplace";
        this.$receipe.addClass("droptarget");
    }
    resetDropTarget() {
        this._droptype = null;
        this.$receipe.removeClass("droptarget");
    }
    onDrop(src, type) {
        this._droptype = null;
        if (type != "dropreplace") return;
        if (!this.warnBeforeLoad()) return;
        this.#setReceipe(src);
        this.model.model_changed = true;
    }
    remoteMessage(msg, line) {
        if (!this.model) return;
        this.model.clearMarkups();
        if (!msg)
            return;
        if (!line) line = msg["message"] || "Loading";
        let progress = null;
        if (msg["progress"]) {
            progress = {
                progress: msg["progress"],
                ellipsed: msg["ellipsed"] || null,
                remain: msg["remain"] || null,
                speed: msg["speed"] || null,
            };
        }
        if (msg["atblock"]) {
            const block = this.model.findBlockByName(msg["atblock"]);
            if (!block) return;
            const type = (msg["result"] < 0) ? "error" : "working";
            block.markup(type, line, progress);
        }
    }
    constructor(session_name) {
        if (Session.instance) {
            return Session.instance;
        }
        if (!session_name) session_name = "default";
        this.session_name = session_name;
        this.$dom = $("<div>").addClass("session");
        const top = $("<div>").addClass("flex-row").appendTo(this.$dom);
        this.log = new LogPanel(this);
        this.log.panel.appendTo(this.$dom);
        this.$receipe = $("<div>").addClass("receipe").appendTo(top);
        this.$table = $("<div>").addClass("data").appendTo(top);
        this.tabView = new TabView(this.$table);
        this.WsClient = new WsClient(this);
        const thiz = this;
        this.WsClient.messageHandler = (msg, line) => {
            thiz.remoteMessage(msg, line);
        }
        this.load();
        Session.instance = this;
    }

    get panel() {
        return this.$dom;
    }
}

window.Session = new Session("default");

export default function getCurrentSession() {
    return window.Session;
}