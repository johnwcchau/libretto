import MethodRegistry from "./MethodRegistry.mjs";

class MethodBrowser {
    static _dragTimer = null;

    refresh() {
        WsClient.send("ls", {path: this._cd}).then(r => {
            MethodRegistry.forEach(v => {
                const a = $('<a href="#">').html(v[0]);
                if (v[0] == "..") a.addClass("fileobj_parentdir");
                if (v[1]) a.addClass("fileobj_dir");
                else a.addClass("fileobj_file");
                a.appendTo(this._filelist);
            });
            $(".fileobj_file").on("mousedown", (e) => {
                if (e.originalEvent.button != 0) return;
                e.preventDefault();
                e.stopPropagation();
                MethodBrowser._dragTimer = setTimeout(()=>{
                    const layer = new FileBlock({
                        filename: `${this._cd}/${$(e.delegateTarget).html()}`
                    });
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
        });
    }

    constructor() {
        const thiz = this;
        if (MethodBrowser.instance) {
            return MethodBrowser.instance;
        }
        this._cd = "";
        this._panel = $("<div>").addClass("methodBrowser");
        //this._toolbar = $("<div>").addClass("methodBrowserBar toolbar").appendTo(this._panel);
        this._methodlist = $("<div>").addClass("methodList list-view").appendTo(this._panel);

        // $('<a href="#"><img src="/static/img/refresh_black_24dp.svg" alt="Refresh" /></a>').click(() => {
        //     thiz.refresh();
        // }).appendTo(this._toolbar);
        
        this.refresh();

        MethodBrowser.instance = this;
    }
    get panel() {
        return this._panel;
    }
}

const instance = new MethodBrowser();
Object.seal(instance);
export default instance;