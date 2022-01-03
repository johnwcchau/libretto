import EditDialog from './EditDialog.mjs';
import UUID from './UUID.mjs';
import Log from "./Log.mjs";
import ContextMenu from "./ContextMenu.mjs";

/**
 * 
 *  Singleton for python object registries
 */
export class BlockTypes {
    constructor() {
        if (BlockTypes.instance) {
            return BlockTypes.instance;
        }
        this.cls = {};
        BlockTypes.instance = this;
    }
    get(name) {
        return this.cls[name];
    }
    add(types) {
        this.cls = Object.assign(this.cls, types);
    }
}

const blockTypes = new BlockTypes();
export class Block {

    canMove = true;
    canEdit = true;

    constructor(args) {
        this._properties = {};
        this._allowchild = [];
        this._events = {};
        this._type = (args && args._type) ? args._type : "skll.block.Block";
        const cls = blockTypes.get(this._type);
        if (cls) {
            this.applycls(args, cls);
            if (cls.typename)
                this._typename = cls.typename;
        }
        if (!this.name) {
            const t = (this._typename ? this._typename : this._type).split(".");
            this.name = t[t.length - 1] + "-" + UUID().substring(0, 4);
        }
    }
    
    applycls(args, cls) {
        if (!cls) return;
        if (cls.defaults) {
            Object.entries(cls.defaults).forEach(([i, v]) => {
                if (this[i] === undefined) this[i] = v;
            })
        }
        if (cls.childof) {
            this.applycls(args, blockTypes.get(cls.childof));
        }
        if (cls.properties) {
            Object.entries(cls.properties).forEach(([i, v]) => {
                this._properties[i] = v;
                if (args[i] !== undefined) {
                    this[i] = args[i];
                } else if (v.default !== undefined) {
                    this[i] = v.default;
                }
            })
        }
        if (cls.child_types) {
            this._allowchild = this._allowchild.concat(cls.child_types);
        }
        if (cls.split_type) {
            this._splittype = cls.split_type;
        }
        if (cls.events) {
            Object.entries(cls.events).forEach(([i, v]) => {
                this._events[i] = v;
            })
        }
    }
    
    get root() {
        if (this._session) return this;
        if (this.parent) return this.parent.root;
        return null;
    }
    get session() {
        return this.root._session;
    }

    clone() {
        let copy = Object.assign({}, this);
        copy.$div = null;
        copy.__proto__ = this.__proto__;
        return copy;
    }
    get desc() {
        let result = this._type + " (";
        let props = [];
        Object.keys(this._properties).forEach(name => {
            const v = this._properties[name];
            if (name.startsWith("_")) return;
            if (this[name] !== undefined && this[name] !== null) {
                if (v.type == "text")
                    props.push(`${name}="${this[name]}"`);
                else if (v.type == "number") {
                    props.push(`${name}=${this[name]}`);
                } else if (v.type == "boolean") {
                    props.push(`${name}=${this[name] ? "True" : "False"}`)
                }
            }
        });
        result += props.join(", ") + ")";
        return result;
    }
    addProperties(name, desc=null, type="text", enabled=true) {
        if (this._properties[name]) {
            throw Error(`Property ${name} already exists`);
        }
        if (!desc) desc = name;
        this._properties[name] = {
            desc: desc,
            type: type,
            enabled: enabled
        };
    }
    static __onEditClicked(e) {
        e.data.thiz.onEditClicked();
    }
    onEditClicked() {
        EditDialog.createEditDialog(this).addClass("shown");//.modal();
    }
    onEditApplied() {
        this.render();
        this.root.model_changed = true;
    }
    createEditBtn() {
        return $("<a href='#'>")
            .addClass("editbtn")
            .on("click", {thiz: this}, Block.__onEditClicked)
            .html("✏️");
    }
    render() {
        if (!this.$div) {
            this.$div = $("<div>").addClass("block");
            $("<span>").addClass("title").html(this.name).appendTo(this.$div);
            $("<span>").addClass("desc").html(this.desc).appendTo(this.$div);
            if (this.canEdit)
                this.createEditBtn().appendTo(this.$div);
            this.registerEvents();
        } 
        else {
            this.$div.children("span.title").html(this.name);
            if (this.desc)
                this.$div.children("span.desc").html(this.desc);
            if (this.canEdit && (this.$div.children("a.editbtn").length == 0)) 
                this.createEditBtn().appendTo(this.$div);
            else if (!this.canEdit)
                this.$div.children("a.editbtn").remove();
        }
        if (this._events["onRendered"]) this._events["onRendered"](this);
        return this.$div;
    }
    export() {
        let result = {};
        Object.entries(this._properties).forEach(([i, v]) => {
            result[i] = this[i];
        });
        return result;
    }
    remove(obj) {}
    append(obj, at) {}
    prepend(obj, at) {}
    childdroptypes(dragsrc) {return [];}
    childtypematch(src) {
        if (!this._allowchild||(this._allowchild.length == 0)) return true;
        const cls = src._type;
        for (let i = 0; i < this._allowchild.length; i++) {
            if (this._allowchild[i] == cls) return true;
        }
        // this._allowchild.forEach(v => {
        //     const cls = src._type;
        //     if (v == cls) result = true;
        // })
        return false;
    }

    begindrag(clone) {
        let src = this;
        if (clone) {
            src = this.clone();
            src.render();
        }
        src.dragging = src.$div.clone().addClass("dragbox").appendTo($("body"))
        src.$div.addClass("dragsource");
        $(document).data("dragsource", src)
            .on('mousemove', Block.onmousemove)
            .on('mouseup', Block.onmouseup);
        $(".trash").addClass("visible");
    }
    afterdrag() {
        this.$div.detach();
        this.$div.removeClass("newobj");
        if (this.parent) this.parent.remove(this);
    }
    allowdroptypes(dragsrc) {
        let droptypes = [];
        if (this._events["onFileDropped"] && dragsrc._type == File.TYPE) {
            droptypes.push("dropinto")
        }
        if (dragsrc._type != File.TYPE && this.parent) {
            droptypes = droptypes.concat(this.parent.childdroptypes(dragsrc));
        }
        return droptypes;
    }
    ondrop(src, droptype) {
        if (src._type == File.TYPE && this._events["onFileDropped"]) {
            this._events["onFileDropped"](this, src, droptype);
            return;
        }
        switch (droptype) {
            case "dropbefore":
            case "dropleft":
                this.parent.prepend(src, this);
                this.$div.before(src.$div);
                break;
            case "dropafter":
            case "dropright":
                this.parent.append(src, this);
                this.$div.after(src.$div);
                break;
        }
    }

    static dragTimer = null;
    static onmousedown(e) {
        if (e.originalEvent.button != 0) return;
        let thiz = e.data.thiz;
        if (!thiz.canMove) return;
        e.preventDefault();
        e.stopPropagation();
        if (Block.dragTimer) clearTimeout(Block.dragTimer);
        thiz.$div.on("mouseup", () => {
            if (Block.dragTimer) {
                clearTimeout(Block.dragTimer);
                Block.dragTimer = null;
            }
            thiz.$div.off("mouseup");
        });
        Block.dragTimer = setTimeout(() => {
            Block.dragTimer = null;
            thiz.begindrag(e.originalEvent.ctrlKey);
        }, 100);
    }
    static onmouseup(e) {
        if (e.originalEvent.button != 0) return;
        $(".droppos").remove();
        let thiz = $(document).data("dragsource");
        if (!thiz) return;
        e.preventDefault();
        e.stopPropagation();
        $(".trash").removeClass("visible");
        let target = $(document).data("droptarget");
        if (target && target._droptype) {
            //if ((target != "trash") && target._droptype) {
                thiz.afterdrag();
                target.ondrop(thiz, target._droptype);
            //} else {
            //    $(".trash").removeClass("dropinto");
            //    $(".newobj").remove();
            //}
            if (this.root) this.root.model_changed = true;
            //Block.performdragndrop(thiz, target);
        } else if (thiz.$div.hasClass("newobj")) {
            $(".newobj").remove();
        }
        thiz.$div.removeClass("dragsource");
        thiz.dragging.remove();
        // .css({
        //     "left": '',
        //     "top": '',
        //     "width": '',
        //     "height": ''
        // });
        $(document).data({
            "dragsource": false,
            "droptarget": false
        }).off('mousemove').off('mouseup');
    }
    static onmousemove(e) {
        let thiz = $(document).data("dragsource");
        if (!thiz) return;
        thiz.dragging.css({
            "left": e.pageX,
            "top": e.pageY,
        })
    }
    becomeDropTarget(src) {
        const droptypes = this.allowdroptypes(src);
        if (!droptypes || (droptypes.length == 0)) return;
        if (droptypes.indexOf("dropleft") != -1) {
            $("<a>").addClass("droppos droppos-left")
            .on("mouseenter", {thiz: this}, (e) => {
                const thiz = e.data.thiz;
                thiz._droptype = "dropleft";
            }).on("mouseleave", {thiz: this}, (e) => {
                const thiz = e.data.thiz;
                thiz._droptype = null;
            }).on("mouseup", {thiz: this}, Block.onmouseup)
            .appendTo(this.$div);
        }
        if (droptypes.indexOf("dropright") != -1) {
            $("<a>").addClass("droppos droppos-right")
            .on("mouseenter", {thiz: this}, (e) => {
                const thiz = e.data.thiz;
                thiz._droptype = "dropright";
            }).on("mouseleave", {thiz: this}, (e) => {
                const thiz = e.data.thiz;
                thiz._droptype = null;
            }).on("mouseup", {thiz: this}, Block.onmouseup)
            .appendTo(this.$div);
        }
        if (droptypes.indexOf("dropbefore") != -1) {
            $("<a>").addClass("droppos droppos-before")
            .on("mouseenter", {thiz: this}, (e) => {
                const thiz = e.data.thiz;
                thiz._droptype = "dropbefore";
            }).on("mouseleave", {thiz: this}, (e) => {
                const thiz = e.data.thiz;
                thiz._droptype = null;
            }).on("mouseup", {thiz: this}, Block.onmouseup)
            .appendTo(this.$div);
        }
        if (droptypes.indexOf("dropafter") != -1) {
            $("<a>").addClass("droppos droppos-after")
            .on("mouseenter", {thiz: this}, (e) => {
                const thiz = e.data.thiz;
                thiz._droptype = "dropafter";
            }).on("mouseleave", {thiz: this}, (e) => {
                const thiz = e.data.thiz;
                thiz._droptype = null;
            }).on("mouseup", {thiz: this}, Block.onmouseup)
            .appendTo(this.$div);
        }
        if (droptypes.indexOf("dropinto") != -1) {
            $("<a>").addClass("droppos droppos-into")
            .on("mouseenter", {thiz: this}, (e) => {
                const thiz = e.data.thiz;
                thiz._droptype = "dropinto";
            }).on("mouseleave", {thiz: this}, (e) => {
                const thiz = e.data.thiz;
                thiz._droptype = null;
            }).on("mouseup", {thiz: this}, Block.onmouseup)
            .appendTo(this.$div);
        }
    }
    resetDropTarget() {
        this._droptype = null;
        $(".droppos").remove();
    }
    getInputColumns() {
        if (!this.session) return;
        this.session.run("COLUMNS", this, "columns").then((r)=>{
            const columns = r.columns;
            //const dialog = TableDialog.render(data);
            setTimeout(()=> {
                dialog.modal();
            }, 1);
        });
    }
    runto(mode) {
        if (!this.session) return;
        this.session.run(mode, this, "table").then((r)=>{
            if (!r) return;
            this.session.tabView.addDataTable(`${this.name}_${mode}`, r.data);
        });
    }
    makeContextMenu() {
        return [
            {
                title: "Preview block",
                icon: "/static/img/open_in_new_black_24dp.svg",
                click: () => {
                    this.runto("PREVIEW");
                }
            },
            {
                title: "Train upto block",
                icon: "/static/img/open_in_new_black_24dp.svg",
                click: () => {
                    this.runto("TRAIN");
                }
            },
            {
                title: "Edit",
                icon: "/static/img/open_in_new_black_24dp.svg",
                click: () => {
                    this.onEditClicked();
                }
            },
        ];
    }

    static onmouseover(e) {
        const dragsrc = $(document).data("dragsource");
        const thiz = e.data.thiz;
        if (!dragsrc) return;
        e.preventDefault();
        e.stopPropagation();
        let oldtgt = $(document).data("droptarget");
        if (oldtgt == thiz) return;
        if (oldtgt) {
            oldtgt.resetDropTarget();
            $(document).data("droptarget", false);
        }
        $(".droppos").remove();
        $(document).data("droptarget", thiz);
        thiz.becomeDropTarget(dragsrc);
    }
    static onmouseout(e) {
        if (!$(document).data("dragsource")) return;
        e.preventDefault();
        e.stopPropagation();
        let thiz = e.data.thiz;
        if ($(document).data("droptarget") == thiz) {
            thiz.resetDropTarget();
            $(document).data("droptarget", false);
        }
    }
    static oncontextmenu(e) {
        e.preventDefault();
        e.stopPropagation();
        const thiz = e.data.thiz;
        const options = thiz.makeContextMenu();
        ContextMenu.make(options).showAt(e);
    }
    registerEvents() {
        this.$div.on("mousedown", {"thiz": this}, Block.onmousedown)
            .on("mouseenter", {"thiz": this}, Block.onmouseover)
            .on("mouseleave", {"thiz": this}, Block.onmouseout)
            .on("dragover", {"thiz": this}, Block.onmouseover)
            .on("contextmenu", {"thiz": this}, Block.oncontextmenu);
    }
}

/**
 * Special block for trash
 */
export class Trash extends Block {
    static TYPE = ".trash";
    
    constructor() {
        super({_type: Trash.TYPE});
        this.canEdit = false;
        this.canMove = false;
    }
    becomeDropTarget(src) {
        this.$div.addClass("dropinto");
        this._droptype = "dropinto";
    }
    resetDropTarget(src) {
        this.$div.removeClass("dropinto");
        this._droptype = null;
    }
    ondrop(src, droptype) {
        //do nothing
        this.$div.removeClass("dropinto");
        this._droptype = null;
        $(".newobj").remove();
    }
    render() {
        if (!this.$div) {
            this.$div = $("<div>").addClass("trash");
            this.registerEvents();
        }
        return this.$div;
    }
}

export class Parent extends Block {
    static TYPE = ".parent"

    constructor(kwargs) {
        if (!kwargs._type) kwargs._type = Parent.TYPE;
        super(kwargs);
        //Children is 2D array although only 1 column to unify with Split
        this._blocks = kwargs.children ? kwargs.children : [];
        this._blocks.forEach(v => {
            v.parent = this;
        })
    }
    clone() {
        let copy = super.clone();
        copy._blocks = [];
        this._blocks.forEach(v => {
            copy._blocks.push(v.clone());
        })
        return copy;
    }
    get desc() {
        if (this._type == "skll.block.baseblock.Parent")
            return "";
        return super.desc;
    }
    allowdroptypes(dragsrc) {
        if (dragsrc._type == File.TYPE) return [];
        let types = super.allowdroptypes(dragsrc);
        
        if (this._blocks.length == 0) {
            if (this.childtypematch(dragsrc)) 
                types.push("dropinto");
        }
        return types;
    }
    childdroptypes(dragsrc) {
        if (!this.childtypematch(dragsrc)) return [];
        return ["dropbefore", "dropafter"];
    }
    remove(obj) {
        let idx = this._blocks.indexOf(obj);
        if (idx != -1) this._blocks.splice(idx, 1);
        obj.parent = null;
    }
    prepend(obj, at) {
        if (at === null) at = 0;
        if (typeof(at) == "object") {
            at = this._blocks.indexOf(at) - 1;
            if (at < 0) at = 0;
        }
        this._blocks.splice(at, 0, obj);
        obj.parent = this;
    }
    append(obj, at) {
        if (at === null) at = -1;
        if (typeof(at) == "object") {
            at = this._blocks.indexOf(at);
        }
        if (at == -1) {
            this._blocks.push(obj);
        } else {
            this._blocks.splice(at+1, 0, obj);
        }
        obj.parent = this;
    }
    ondrop(src, droptype) {
        switch (droptype) {
            case "dropleft":
                this.parent.prepend(src, this);
                this.$div.before(src.$div);
                break;
            case "dropright":
                this.parent.append(src, this);
                this.$div.after(src.$div);
                break;
            case "dropinto":
                src.parent = this;
                this._blocks.unshift(src);
                let tgt = this.$div.find(".block:first");
                if (tgt.length) 
                    tgt.before(src.$div);
                else    // no block inside me
                    this.$div.append(src.$div);
                break;
            default:
                return super.ondrop(src, droptype);
        }
    }
    render() {
        this.$div = super.render().addClass("block-set");
        this.$div.children(".block").remove();
        this._blocks.forEach(v => {
            try {
                v.render().appendTo(this.$div);
            } catch (e) {
                console.log(e);
            }
        });
        return this.$div;
    }
    export() {
        const thiz = super.export();
        let children = {};
        this._blocks.forEach((v, i) => {
            children[i] = v.export();
        });
        thiz["_children"] = children;
        return thiz;
    }
}
// export class Root extends Parent {
//     static model_changed;

//     constructor(kwargs) {
//         super(kwargs);
//         this.canMove = false;
//         this.canEdit = true;
//     }
//     render() {
//         super.render();
//         this.$div.addClass("rootblock");
//         return this.$div;
//     }
//     export() {
//         const r = super.export();
//         r._type = "skll.block.baseblock.Parent";
//         return r;
//     }
// }
// class SplitGroup extends Parent {
//     constructor(kwargs) {
//         if (!kwargs._type) kwargs["_type"] = ".splitgroup";
//         super(kwargs);
//         //disable drag and drop for splitgroup
//         this.canMove = false;
//         if (kwargs.split_type) this._splittype = kwargs.split_type;
//         if (!this._splits) this._splits = [];
//         switch (this._splittype) {
//             case "column":
//                 this._properties._splits.type = "list(column)";
//                 break;
//             case "datatype":
//                 this._properties._splits.type = "list(datatype)";
//                 break;
//             case "none":
//             default:
//                 this.canEdit = false;
//                 break;

//         } 
//     }

//     get name() {
//         return this.parent ? this.parent.name: "";
//     }
//     set name(v) {
//         //ignore
//     }
//     clone() {
//         let copy = super.clone();
//         copy._splits = [];
//         this._splits.forEach(v => {
//             copy._splits.push(v);
//         })
//         return copy;
//     }
//     render() {
//         const res = super.render();
//         if (this._splittype == "none") {
//             this.$div.children("span.title").remove();
//         } else {
//             this.$div.children("span.title").html(JSON.stringify(this._splits).replaceAll(",", ", "));
//         }
//         return res;
//     }
// }

/**
 * Hacking block for file drag and drop
 */
export class File extends Block {
    static TYPE = ".file";
    constructor(kwargs) {
        kwargs._type = File.TYPE;
        kwargs.name = "File";
        super(kwargs);
        this.filename = kwargs.filename;
    }
    get desc() {
        return this.filename;
    }
    begindrag() {
        super.begindrag();
        $(".dragbox").addClass("fileblock");
    }
}

// export class Split extends Block {
//     static TYPE = ".split";
//     constructor(args) {
//         if (!args._type) args._type = Split.TYPE;
//         super(args);
//         this.children = [];
//         const splits = args.splits || [];
//         for (let i = 0; i < splits.length; i++) {
//             const child = new SplitGroup({
//                 _type: ".splitgroup", 
//                 children: [args.children[i]],
//                 split_type: this._splittype,
//             });
//             child._splits = splits[i];
//             child.parent = this;
//             this.children.push(child);
//         }
//     }
//     clone() {
//         let copy = super.clone();
//         copy.children = [];
//         this.children.forEach(v => {
//             copy.children.push(v.clone());
//         })
//         return copy;
//     }
//     prepend(obj, at) {
//         if (this.singlar && this.children.length > 0)
//             return;
//         if (at === null) at = 0;
//         if (typeof(at) == "object") {
//             at = this.children.indexOf(at) - 1;
//             if (at < 0) at = 0;
//         }
//         this.children.splice(at, 0, obj);
//         obj.parent = this;
//     }
//     append(obj, at) {
//         if (this.singlar && this.children.length > 0)
//             return;
//         if (at === null) at = -1;
//         if (typeof(at) == "object") {
//             at = this.children.indexOf(at);
//         }
//         if (at == -1) {
//             this.children.push(obj);
//         } else {
//             this.children.splice(at+1, 0, obj);
//         }
//         obj.parent = this;
//     }
//     remove(obj) {
//         let idx = this.children.indexOf(obj);
//         if (idx != -1) this.children.splice(idx, 1);
//         obj.parent = null;
//         this.adjustAddButton();
//     }
//     allowdroptypes(dragsrc) {
//         //disable dropping to split, b/c user should drop into splitgroup
//         return [];
//         // if (dragsrc._type == File.TYPE) return [];
//         // let types = super.allowdroptypes(dragsrc);
        
//         // if (this.children.length == 0) {
//         //     if (this.childtypematch(dragsrc)) 
//         //         types.push("dropinto");
//         // }
//         // return types;
//     }
//     childdroptypes(dragsrc) {
//         if (this.singlar) return [];
//         if (!this.childtypematch(dragsrc)) return [];
//         //disable dropleft and dropright
//         //return ["dropleft", "dropright"];
//     }
//     ondrop(src, droptype) {
//         switch (droptype) {
//             case 'dropinto':
//                 this.prepend(src, 0);
//                 this.$addbtn.before(src.$div);
//                 break;
//             default:
//                 super.ondrop(src, droptype);
//         }
//         this.adjustAddButton();
//     }
//     adjustAddButton() {
//         if (this.singlar && this.children.length) {
//             this.$addbtn.hide();
//         } else {
//             this.$addbtn.show();
//         }
//     }
//     render() {
//         this.$div = super.render().addClass("split-block");
//         this.$div.children(".splitblock").remove();
//         this.$splitdiv = $("<div>").addClass("block splits-container").appendTo(this.$div);
//         this.children.forEach(v => {
//             v.render().appendTo(this.$splitdiv);
//         });
//         const thiz = this;
//         this.$addbtn = $("<div>").addClass("block split-add-block")
//             .on("click", {thiz: this}, (e)=>{
//                 const thiz = e.data.thiz;
//                 const newgroup = new SplitGroup({
//                     split_type: thiz._splittype,
//                 });
//                 newgroup.parent = thiz;
//                 thiz.children.push(newgroup);
//                 this.$addbtn.before(newgroup.render());
//                 thiz.adjustAddButton();
//             }).appendTo(this.$splitdiv);
//         this.adjustAddButton();
//         return this.$div;
//     }
//     export() {
//         const thiz = super.export();
//         thiz["_children"] = {};
//         thiz["splits"] = [];
//         this.children.forEach((v, i) => {
//             thiz["_children"][i+1] = v.export();
//             thiz["splits"].push(v._splits);
//         });
//         return thiz;
//     }
// }

blockTypes.add({
    "skll.block.baseblock.Block": {
        cls: Block,
        typename: "Passthrough",
        desc: "A block that simply pass-though data and do nothing",
        properties: {
            "name": {
                desc: "Name",
                type: "text",
                enabled: true,
            },
            "_type": {
                desc: "Underlying SK-ll type",
                type: "text",
                enabled: true,
            },
            "disable_mask": {
                desc: "Disable this block when",
                type: "mc(preview,train,test,run)",
                enabled: true,
            },
            "column_mask": {
                desc: "Columns applies to",
                type: "list(column)",
                enabled: true,
            }
        },
    },
    // ".split": {
    //     cls: Split,
    //     hidden: true,
    //     desc: "Internal type that has no effect",
    //     childof: "skll.block.baseblock.Block",
    // },
    ".parent": {
        cls: Parent,
        hidden: true,
        desc: "Internal type that has no effect",
        defaults: {
            "_isinternal": true,
        },
        properties: {
            "name": {
                desc: "Name",
                type: "text",
                enabled: true,
            },
        },
    },
    // ".splitgroup": {
    //     cls: SplitGroup,
    //     hidden: true,
    //     desc: "Internal type that has no effect",
    //     properties: {
    //         "_splits": {
    //             desc: "Split",
    //             type: "list(text)",
    //             enabled: true,
    //         },
    //     },
    //     defaults: {
    //         "_isinternal": true,
    //     }
    // },
});