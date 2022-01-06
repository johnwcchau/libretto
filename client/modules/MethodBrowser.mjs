import { BlockTypes } from "./BaseBlock.mjs";

const blockTypes = new BlockTypes();

class MethodBrowser {
    static _dragTimer = null;

    refresh() {
        this._methodlist.html("");
        Object.entries(blockTypes.cls).forEach(([i, v]) => {
            if (v.hidden) return;
            const a = $('<a href="#">').addClass("methodobj").data("type", [i, v]);
            $('<span class="method_name">').html(v.typename ? v.typename : i).appendTo(a);
            $('<span class="method_desc">').html(v.desc ? v.desc : "No description").appendTo(a);
            a.appendTo(this._methodlist);
        });
        this._methodlist.find(".methodobj").on("mousedown", (e) => {
            if (e.originalEvent.button != 0) return;
            e.preventDefault();
            e.stopPropagation();
            MethodBrowser._dragTimer = setTimeout(()=>{
                const $a = $(e.delegateTarget);
                const [name, type] = $a.data("type");
                if (!type) return;
                const layer = new type["cls"]({_type: name});
                layer.render();
                layer.$div.addClass("newobj").appendTo($("body"));
                layer.begindrag();
            }, 100);
        }).on("mouseup", (e) => {
            if (MethodBrowser._dragTimer) {
                clearTimeout(MethodBrowser._dragTimer);
                MethodBrowser._dragTimer = null;
                $(e.delegateTarget).click();
            }
        });
        return this;
    }

    constructor() {
        const thiz = this;
        if (MethodBrowser.instance) {
            return MethodBrowser.instance;
        }
        this._cd = "";
        this._panel = $("<div>").addClass("methodBrowser");
        this._methodlist = $("<div>").addClass("methodList list-view").appendTo(this._panel);

        MethodBrowser.instance = this;
    }
    get panel() {
        return this._panel;
    }
}

const instance = new MethodBrowser();
Object.seal(instance);
export default instance;