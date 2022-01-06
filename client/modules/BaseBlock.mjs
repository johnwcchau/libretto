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
        const cls = this.getcls();
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
    getcls() {
        return blockTypes.get(this._type);
    }
    applycls(args, cls) {
        if (!cls) return;
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
        if (cls.defaults) {
            Object.entries(cls.defaults).forEach(([i, v]) => {
                this[i] = v;
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
        EditDialog.createEditDialog(this);//.modal();
    }
    onEditApplied() {
        if (this._events["onEditApplied"]) this._events["onEditApplied"](this);
        this.render();
        this.root.model_changed = true;
    }
    createEditBtn() {
        return $("<a href='#'>")
            .addClass("editbtn")
            .on("click", {thiz: this}, Block.__onEditClicked)
            .html("✏️");
    }
    createDomElement() {
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
    }
    render() {
        if (this._events["onRender"]) this._events["onRender"](this);
        else this.createDomElement();
        return this.$div;
    }
    export() {
        let result = {};
        Object.entries(this._properties).forEach(([i, v]) => {
            if (v.dictKeyOf) {
                if (!result[v.dictKeyOf]) result[v.dictKeyOf] = {};
                result[v.dictKeyOf][v.dictKey] = this[i];
            } else if (v.listItemOf) {
                if (!result[v.dictKeyOf]) result[v.dictKeyOf] = [];
                result[v.listItemOf][v.listIndex] = this[i];
            } else {
                result[i] = this[i];
            }
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
    afterDrag() {
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
    onDrop(src, droptype) {
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
        $(".droptarget").removeClass("droptarget");
        let thiz = $(document).data("dragsource");
        if (!thiz) return;
        e.preventDefault();
        e.stopPropagation();
        $(".trash").removeClass("visible");
        let target = $(document).data("droptarget");
        if (target && target._droptype) {
            //if ((target != "trash") && target._droptype) {
                thiz.afterDrag();
                target.onDrop(thiz, target._droptype);
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
        this.$div.addClass("droptarget");
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
        this.$div.removeClass("droptarget");
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
                title: "Dataset stat",
                icon: "/static/img/open_in_new_black_24dp.svg",
                click: () => {
                    if (!this.session) return;
                    this.session.run("TRAIN", this, "stat").then((r)=>{
                        if (!r) return;
                        this.session.tabView.addDataTable(`${this.name}_Stats`, r.stat);
                    });
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
    onDrop(src, droptype) {
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
    onDrop(src, droptype) {
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
                return super.onDrop(src, droptype);
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

blockTypes.add({
    "skll.block.baseblock.Block": {
        cls: Block,
        typename: "Passthrough",
        desc: "A block that simply pass-though data and do nothing",
        properties: {
            "name": {
                desc: "Name",
                type: "text",
            },
            "_type": {
                desc: "Underlying SK-ll type",
                type: "text",
            },
            "disable_mask": {
                desc: "Disable this block when",
                type: "mc(preview,train,test,run)",
            },
            "column_mask": {
                desc: "Columns applies to",
                type: "list(column)",
            },
            "as_new_columns": {
                desc: "Append result instead of overwrite",
                type: "boolean",
            }
        },
    },
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
            },
        },
    },
});