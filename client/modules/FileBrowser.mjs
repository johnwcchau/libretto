import WsClient from './WsClient.mjs';
import {File} from './BaseBlock.mjs';
import ContextMenu from './ContextMenu.mjs';
import Session from './Session.mjs';

class FileBrowser {
    static _dragTimer = null;

    #makeRenContextMenuOption(name) {
        return {
            title: "Rename",
            icon: "/static/img/delete_forever_black_24dp.svg",
            click: () => {
                const newName = prompt("New file name", name);
                if (newName) {
                    WsClient.send("ren", {
                        path: `${this._cd}/${name}`,
                        newname: `${this._cd}/${newName}`,
                    }).then(()=> {
                        this.refresh();
                    });
                }
            }
        };
    }
    #makeDelContextMenuOption(name) {
        return {
            title: "Delete",
            icon: "/static/img/delete_forever_black_24dp.svg",
            click: () => {
                if (confirm(`Delete ${name}?`)) {
                    WsClient.send("rm", {
                        path: `${this._cd}/${name}`,
                    }).then(()=> {
                        this.refresh();
                    });
                }
            }
        };
    }
    refresh() {
        WsClient.send("ls", {path: this._cd}).then(r => {
            this._filelist.html("");
            this._cd = r["cd"];
            r.objs.forEach(v => {
                const a = $('<a href="#">').html(v[0]);
                if (v[0] == "..") a.addClass("fileobj_parentdir");
                if (v[1]) a.addClass("fileobj_dir");
                else a.addClass("fileobj_file");
                a.appendTo(this._filelist);
            });
            $(".fileobj_dir").click((e) => {
                this._cd += "/" + $(e.delegateTarget).html();
                this.refresh();
            }).on("contextmenu", (e) => {
                e.preventDefault();
                const thiz = $(e.delegateTarget);
                ContextMenu.make([
                    this.#makeRenContextMenuOption(thiz.html()),
                    this.#makeDelContextMenuOption(thiz.html()),
                ]).showAt(e);
            });
            $(".fileobj_file").on("mousedown", (e) => {
                if (e.originalEvent.button != 0) return;
                e.preventDefault();
                e.stopPropagation();
                FileBrowser._dragTimer = setTimeout(()=>{
                    const filename = `${this._cd}/${$(e.delegateTarget).html()}`;
                    let promise;
                    if (filename.endsWith(".skll.json")) {
                        promise = window.Session.readRemote(filename);
                    } else {
                        promise = new Promise(res => {
                            res(new File({
                                filename: filename,
                            }));
                        });
                    }
                    promise.then(layer => {
                        layer.render();
                        layer.$div.addClass("newobj").appendTo($("body"));
                        layer.begindrag();
                    });
                }, 150);
            }).on("mouseup", (e) => {
                if (FileBrowser._dragTimer) {
                    clearTimeout(FileBrowser._dragTimer);
                    FileBrowser._dragTimer = null;
                    $(e.delegateTarget).click();
                }
            }).click((e)=> {
                const name = $(e.delegateTarget).html();
                window.open(`/storage${this._cd}/${name}`, "_blank");
            }).on("contextmenu", (e) => {
                e.preventDefault();
                const thiz = $(e.delegateTarget);
                const name = thiz.html();
                let contexts = [
                    {
                        title: "Open in new tab",
                        icon: "/static/img/open_in_new_black_24dp.svg",
                        click: () => {
                            $(e.delegateTarget).click();
                        }
                    },
                    this.#makeRenContextMenuOption(thiz.html()),
                    this.#makeDelContextMenuOption(thiz.html()),
                ];
                if (name.endsWith(".skll.json")) {
                    contexts.unshift({
                        title: "Load as receipe",
                        icon: "/static/img/open_in_browser_black_24dp.svg",
                        click: () => {
                            Session.loadRemote(`${this._cd}/${name}`);
                        }
                    })
                }
                ContextMenu.make(contexts).showAt(e);
            });
        });
    }

    put(files) {
        const thiz = this;
        let promises = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const name = file.name;
            const fullname = `${this._cd}/${name}`;
            promises.push(new Promise((resolve, reject) => {
                WsClient.send("exist", {path: fullname})
                .then((r)=> {
                    const exist = r.exist;
                    if (!exist) {
                        WsClient.upload(file, fullname).then((r)=>{
                            resolve(r);
                        });
                    } else {
                        const v = confirm(`Overwrite ${name}?`)
                        if (v) WsClient.upload(file, fullname).then((r)=>{
                            resolve(r);
                        });
                        else reject({});
                    }
                })
            }));
        };
        Promise.allSettled(promises).then(()=>{
            thiz.refresh();
        });
    }
    mkdir() {
        const thiz = this;
        const dir = prompt("Name of new directory");
        if (!dir) return;
        const fullname = `${this._cd}/${dir}`;
        WsClient.send("mkdir", {path: fullname})
        .then(()=> {
            thiz.refresh();
        });
    }

    #enableFileDrop = () => {
        const thiz = this;
        const panel = this._panel[0];
        ["dragleave", "dragend"].forEach((type) => {
            panel.addEventListener(type, () => {
                panel.classList.remove("file-dragged-into");
            });
        });
        panel.addEventListener("dragover", (e) => {
            e.preventDefault();
            panel.classList.add("file-dragged-into");
        });
        panel.addEventListener("drop", (e) => {
            e.preventDefault();
            panel.classList.remove("file-dragged-into");
            if (e.dataTransfer.files.length) {
                thiz.put(e.dataTransfer.files);
            }
        });
    }

    constructor() {
        const thiz = this;
        if (FileBrowser.instance) {
            return FileBrowser.instance;
        }
        this._cd = "";
        this._panel = $("<div>").addClass("fileBrowser");
        this._toolbar = $("<div>").addClass("fileBrowserBar toolbar").appendTo(this._panel);
        this._filelist = $("<div>").addClass("fileList list-view").appendTo(this._panel);
        this.#enableFileDrop();
        $('<a href="#"><img src="/static/img/create_new_folder_black_24dp.svg" alt="Mkdir" /></a>').click(() => {
            thiz.mkdir();
        }).appendTo(this._toolbar);
        $('<a href="#"><img src="/static/img/refresh_black_24dp.svg" alt="Refresh" /></a>').click(() => {
            thiz.refresh();
        }).appendTo(this._toolbar);
        
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