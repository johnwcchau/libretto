import { BlockTypes } from "./BaseBlock.mjs";

class MethodBrowser {
    static _dragTimer = null;

    #listgroup() {
        let listed = [];
        if (this._cd) {
            let back = this._cd.split(".");
            back.pop();
            back = back.join(".");
            $('<a href="#">').addClass("method-group method-group-back")
                .data("group", back)
                .html("(back)")
                .on("click", {thiz: this}, (e)=>{
                    const thiz = e.data.thiz;
                    thiz._cd = $(e.delegateTarget).data("group");
                    thiz._filter = null;
                    thiz.refresh();
                })
                .appendTo(this._methodlist);
        }
        const prefix = this._cd ? this._cd + "." : "";
        Object.entries(this._blockTypes.groups).forEach(([i, v]) => {
            if (!i.startsWith(prefix)) return;
            const name = i.replace(prefix, "").split(".")[0];
            if (!name) return;
            if (listed.indexOf(name) != -1) return;
            listed.push(name);
            $('<a href="#">').addClass("method-group")
                .data("group", `${prefix}${name}`)
                .html(name)
                .on("click", {thiz: this}, (e)=>{
                    const thiz = e.data.thiz;
                    thiz._cd = $(e.delegateTarget).data("group");
                    thiz._filter = null;
                    thiz.refresh();
                })
                .appendTo(this._methodlist);
        });
    }
    #createMethodObj(i, v) {
        if (v.hidden) return;
        const a = $('<a href="#">').addClass("method-obj").data("type", [i, v]);
        $('<span class="method-name">').html(v.typename ? v.typename : i).appendTo(a);
        $('<span class="method-desc">').html(v.desc ? v.desc : "No description").appendTo(a);
        a.appendTo(this._methodlist);
    }
    #search() {
        this._pwd.html(`Search for ${this._filter}`);
        Object.entries(this._blockTypes.cls).forEach(([i, v]) => {
            if (i.toLowerCase().indexOf(this._filter) == -1) return;
            this.#createMethodObj(i, v);
        });
    }
    #listmethods() {
        const group = this._cd ? this._cd : "";
        const obj = this._blockTypes.groups[group];
        if (!obj) return;
        obj.forEach(i => {
            this.#createMethodObj(i, this._blockTypes.cls[i]);
        });
    }
    refresh() {
        this._methodlist.html("");
        if (this._filter) this.#search();
        else {
            this._pwd.html(this._cd);
            this.#listgroup();
            this.#listmethods();
        }

        this._methodlist.find(".method-obj").on("mousedown", (e) => {
            if (e.originalEvent.button != 0) return;
            e.preventDefault();
            e.stopPropagation();
            MethodBrowser._dragTimer = setTimeout(()=>{
                const $a = $(e.delegateTarget);
                const [name, type] = $a.data("type");
                if (!type) return;
                const layer = new type["cls"]({_jstype: name});
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

    static onSearch(e) {
        const thiz = e.data.thiz;
        const val = $(e.delegateTarget).val();
        if (thiz.searchTimeout) {
            clearTimeout(thiz.searchTimeout);
        }
        thiz.searchTimeout = setTimeout(() => {
            thiz.searchTimeout = null;
            thiz._filter = val.toLowerCase();
            thiz.refresh();
        }, 500);
    }
    constructor() {
        const thiz = this;
        if (MethodBrowser.instance) {
            return MethodBrowser.instance;
        }
        this._blockTypes = new BlockTypes();
        this._cd = "";
        this._filter = "";
        this.searchTimeout = null;
        this._panel = $("<div>").addClass("methodBrowser");
        this._pwd = $("<div>").addClass("file-browser-pwd").appendTo(this._panel);
        $('<input id="method_search" placeholder="search...">')
            //.on("keyup", {thiz: this}, MethodBrowser.onSearchKeyUp)
            .on("keyup", {thiz: this}, MethodBrowser.onSearch)
            .appendTo(this._panel);    
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