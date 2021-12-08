import WsClient from './WsClient.mjs'

class FileBrowser {
    refresh() {
        WsClient.send("ls", {path: this._cd}).then(r => {
            this._filelist.html();
            this._cd = r["cd"];
            r.objs.forEach(v => {
                const a = $('<a href="#">').html(v[0]);
                if (v[0] == "..") a.addClass("fileobj_parentdir");
                else if (v[1]) a.addClass("fileobj_dir");
                else a.addClass("fileobj_file");
                a.appendTo(this._filelist);
            });
        });
    }

    constructor() {
        if (FileBrowser.instance) {
            return FileBrowser.instance;
        }

        this._panel = $("<div>").addClass("fileBrowser");
        this._toolbar = $("<div>").addClass("fileBrowserBar toolbar").appendTo(this._panel);
        this._filelist = $("<div>").addClass("fileList").appendTo(this._panel);
        this._cd = "";
        this._objs = [];
        $('<a href="#">upload</a>').appendTo(this._toolbar);
        $('<a href="#">mkdir</a>').appendTo(this._toolbar);
        $('<a href="#">delete</a>').appendTo(this._toolbar);
        
        this.refresh();

        FileBrowser.instance = this;
    }
    get panel() {
        return this._panel;
    }
}

const instance = new FileBrowser();
Object.seal(instance);
export default instance;