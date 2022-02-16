import {Block, File} from './BaseBlock.mjs';
import ContextMenu from './ContextMenu.mjs';
import getCurrentSession from './Session.mjs';

class FileBrowser {
    static _dragTimer = null;
    
    static DirDropTarget = class {
    
        constructor(fileBrowser, dropTarget) {
            this.fileBrowser = fileBrowser;
            this.dropTarget = dropTarget
                .on("mouseenter", {thiz: this}, Block.onmouseover)
                .on("mouseleave", {thiz: this}, Block.onmouseout)
                .on("mouseup", {thiz: this}, Block.onmouseup);
        }
    
        //Drag drop parts for file movement
        becomeDropTarget(src) {
            if ((!src._jstype != File.TYPE) && !src.__filename) return;
            this._droptype = "dropinto";
            this.dropTarget.addClass("droptarget");
        }
        resetDropTarget() {
            this._droptype = null;
            this.dropTarget.removeClass("droptarget");
        }
        onDrop(src, type) {
            this._droptype = null;
            if (type != "dropinto") return;
            const filename = src.filename || src.__filename;
            const name = filename.split("/").pop();
            const target = `${this.fileBrowser._cd}/${this.dropTarget.html()}/${name}`;
            this.checkExist(target).then(r => {
                if (r) {
                    if (!confirm(`File with same name already exists in ${this.dropTarget.html()}, overwrite?`))
                        return;
                }
                getCurrentSession().WsClient.send("ren", {
                    src: filename,
                    dest: target,
                    overwrite: true
                }).then(()=> {
                    this.fileBrowser.refresh();
                });
            })
        }
    }

    checkExist(name) {
        return getCurrentSession().WsClient.send("exist", {
            "path": name,
        }).then(r => {
            return r.exist;
        })
    };

    #makeRenContextMenuOption(name) {
        return {
            title: "Rename",
            icon: "/static/img/delete_forever_black_24dp.svg",
            click: () => {
                const newName = prompt("New file name", name);
                if (newName) {
                    const dest = `${this._cd}/${newName}`;
                    this.checkExist(dest).then(r => {
                        if (r) {
                            alert(`${newName} already exist!`);
                            return;
                        }
                        return getCurrentSession().WsClient.send("ren", {
                            src: `${this._cd}/${name}`,
                            dest: `${this._cd}/${newName}`,
                        });
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
                    getCurrentSession().WsClient.send("rm", {
                        path: `${this._cd}/${name}`,
                    }).then(()=> {
                        this.refresh();
                    });
                }
            }
        };
    }


    refresh() {
        getCurrentSession().WsClient.send("ls", {path: this._cd}).then(r => {
            this._filelist.html("");
            this._cd = r["cd"];
            this._pwd.html(this._cd);
            let dirs = [];
            let files = [];
            r.objs.forEach(v => {
                if (v[0] == "..") dirs.push(v);
                else if (v[1]) dirs.push(v);
                else files.push(v);
            })
            dirs.forEach(v => {
                const a = $('<a href="#">').html(v[0])
                    .appendTo(this._filelist);
                if (v[0] == "..") a.addClass("fileobj_parentdir");
                a.addClass("fileobj_dir");
            })
            files.forEach(v => {
                const obj = $('<a href="#">').html(v[0])
                    .addClass("fileobj_file")
                    .appendTo(this._filelist);
                if (v[0].endsWith(".libretto.json")) {
                    obj.addClass("filetype_ljson");
                }
            })
            // r.objs.forEach(v => {
            //     const a = $('<a href="#">').html(v[0]);
            //     if (v[0] == "..") a.addClass("fileobj_parentdir");
            //     if (v[1]) a.addClass("fileobj_dir");
            //     else a.addClass("fileobj_file");
            //     a.appendTo(this._filelist);
            // });
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
            }).each((i, v) => {
                new FileBrowser.DirDropTarget(this, $(v));
            })

            $(".fileobj_file").on("mousedown", (e) => {
                if (e.originalEvent.button != 0) return;
                e.preventDefault();
                e.stopPropagation();
                FileBrowser._dragTimer = setTimeout(()=>{
                    const filename = `${this._cd}/${$(e.delegateTarget).html()}`;
                    let promise;
                    if (filename.endsWith(".libretto.json")) {
                        promise = getCurrentSession().readRemote(filename);
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
                        layer.__filename = filename;
                        layer.begindrag();
                    }).catch(e => {
                        let msg = "Unknown error";
                        switch (typeof(e)) {
                            case "array":
                            case "object":
                                if (e["message"]) msg = e["message"];
                                break;
                            default:
                                msg = e;
                        }
                        alert(`Cannot load ${filename}: ${msg}`);
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
                if (name.endsWith(".libretto.json")) {
                    contexts.unshift({
                        title: "Load as receipe",
                        icon: "/static/img/open_in_browser_black_24dp.svg",
                        click: () => {
                            getCurrentSession().loadRemote(`${this._cd}/${name}`);
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
                getCurrentSession().WsClient.send("exist", {path: fullname})
                .then((r)=> {
                    const exist = r.exist;
                    if (!exist) {
                        getCurrentSession().WsClient.upload(file, fullname).then((r)=>{
                            resolve(r);
                        });
                    } else {
                        const v = confirm(`Overwrite ${name}?`)
                        if (v) getCurrentSession().WsClient.upload(file, fullname).then((r)=>{
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
        getCurrentSession().WsClient.send("mkdir", {path: fullname})
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
        this._pwd = $("<div>").addClass("file-browser-pwd").appendTo(this._panel);
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