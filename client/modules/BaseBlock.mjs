import EditDialog from './EditDialog.mjs';
import UUID from './UUID.mjs';
import Log from "./Log.mjs"

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
                if (args[i]) {
                    this[i] = args[i];
                } else if (v.default) {
                    this[i] = v.default;
                }
            })
        }
        if (cls.child_types) {
            this._allowchild = this._allowchild.concat(cls.child_types);
        }
    }
    constructor(args) {
        this._properties = {};
        this._allowchild = [];
        this._type = (args && args._type) ? args._type : "skll.block.Block";
        const cls = blockTypes.get(this._type);
        if (cls) {
            this.applycls(args, cls);
        }
        if (!this.name) {
            const t = this._type.split(".");
            this.name = t[t.length - 1] + "-" + UUID().substring(0, 4);
        }
    }
    canMove = true;
    canEdit = true;
    get desc() {
        let result = this._type + "(";
        let props = [];
        Object.keys(this._properties).forEach(name => {
            const v = this._properties[name];
            if (name.startsWith("_")) return;
            if (this[name]) {
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
        EditDialog.createEditDialog(this).modal();
    }
    onEditApplied() {
        this.render();
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
        } else {
            this.$div.children("span.title").html(this.name);
            if (this.desc)
                this.$div.children("span.desc").html(this.desc);
            if (this.canEdit && (this.$div.children("a.editbtn").length == 0)) 
                this.createEditBtn().appendTo(this.$div);
            else if (!this.canEdit)
                this.$div.children("a.editbtn").remove();
        }
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

    begindrag() {
        this.dragging = this.$div.clone().addClass("dragbox").appendTo($("body"))
        this.$div.addClass("dragsource");
        $(document).data("dragsource", this)
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
        if (this.filedrop && dragsrc._type == File.TYPE) {
            droptypes.push("dropinto")
        }
        if (dragsrc._type != File.TYPE && this.parent) {
            droptypes = droptypes.concat(this.parent.childdroptypes(dragsrc));
        }
        return droptypes;
    }
    ondrop(src, droptype) {
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
            thiz.begindrag();
        }, 100);
    }
    static onmouseup(e) {
        Log.log("debug", "mouseup");
        $(".droppos").remove();
        let thiz = $(document).data("dragsource");
        if (!thiz) return;
        e.preventDefault();
        e.stopPropagation();
        $(".trash").removeClass("visible");
        let target = $(document).data("droptarget");
        if (target) {
            if ((target != "trash") && target._droptype) {
                thiz.afterdrag();
                target.ondrop(thiz, target._droptype);
            } else {
                $(".trash").removeClass("dropinto");
                $(".newobj").remove();
            }
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
        Log.log("debug", droptypes.length);
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
    static onmouseover(e) {
        Log.log("mover");
        const dragsrc = $(document).data("dragsource");
        const thiz = e.data.thiz;
        if (!dragsrc) return;
        e.preventDefault();
        e.stopPropagation();
        let oldtgt = $(document).data("droptarget");
        if (oldtgt == thiz) return;
        Log.log("mover2");
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
    registerEvents() {
        this.$div.on("mousedown", {"thiz": this}, Block.onmousedown)
            .on("mouseenter", {"thiz": this}, Block.onmouseover)
            .on("mouseleave", {"thiz": this}, Block.onmouseout)
            .on("dragover", {"thiz": this}, Block.onmouseover);
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
        this._blocks = kwargs.children || [];
        this.singlar = kwargs.singlar || false;
        this._blocks.forEach(v => {
            v.parent = this;
        })
    }
    get desc() {
        return "";
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
        if (this.singlar) return [];
        if (!this.childtypematch(dragsrc)) return [];
        return ["dropbefore", "dropafter"];
    }
    remove(obj) {
        let idx = this._blocks.indexOf(obj);
        if (idx != -1) this._blocks.splice(idx, 1);
        obj.parent = null;
    }
    prepend(obj, at) {
        if (this.singlar && this._blocks.length > 0)
            return;
        if (at === null) at = 0;
        if (typeof(at) == "object") {
            at = this._blocks.indexOf(at) - 1;
            if (at < 0) at = 0;
        }
        this._blocks.splice(at, 0, obj);
        obj.parent = this;
    }
    append(obj, at) {
        if (this.singlar && this._blocks.length > 0)
            return;
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
        Log.log("debug", droptype);
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
        this.$div = super.render().addClass("blockset");
        this.$div.children(".block").remove();
        this._blocks.forEach(v => {
            v.render().appendTo(this.$div);
        });
        return this.$div;
    }
    export() {
        const root = {_next: null};
        var next = root;
        this._blocks.forEach((v) => {
            next._next = v.export();
            next = next._next;
        });
        if (this._type != Parent.TYPE) {
            const thiz = super.export();
            thiz["_children"] = {"1": root._next}
            return thiz;
        } else {
            return root._next;
        }
    }
}
export class Root extends Parent {
    
    constructor(kwargs) {
        super(kwargs);
        this.canMove = false;
        this.canEdit = false;
        this.name = "";
    }
    render() {
        super.render();
        this.$div.addClass("rootblock");
        return this.$div;
    }
}
/**
 * Hacking block for file drag and drop
 */
export class File extends Block {
    static TYPE = ".file";
    constructor(kwargs) {
        kwargs.type = File.TYPE;
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
export class Split extends Block {
    static TYPE = ".split";
    constructor(args) {
        if (!args._type) args._type = Split.TYPE;
        super(args);
        this.children = [];
        const splits = args.splits || [];
        for (let i = 0; i < splits.length; i++) {
            const child = (args.children && args.children[i]) ? args.children[i] : new Parent();
            child._splits = splits[i];
            child.parent = this;
            this.children.push(child);
        }
    }
    prepend(obj, at) {
        if (this.singlar && this.children.length > 0)
            return;
        if (at === null) at = 0;
        if (typeof(at) == "object") {
            at = this.children.indexOf(at) - 1;
            if (at < 0) at = 0;
        }
        this.children.splice(at, 0, obj);
        obj.parent = this;
    }
    append(obj, at) {
        if (this.singlar && this.children.length > 0)
            return;
        if (at === null) at = -1;
        if (typeof(at) == "object") {
            at = this.children.indexOf(at);
        }
        if (at == -1) {
            this.children.push(obj);
        } else {
            this.children.splice(at+1, 0, obj);
        }
        obj.parent = this;
    }
    remove(obj) {
        let idx = this.children.indexOf(obj);
        if (idx != -1) this.children.splice(idx, 1);
        obj.parent = null;
        this.adjustAddButton();
    }
    allowdroptypes(dragsrc) {
        if (dragsrc._type == File.TYPE) return [];
        let types = super.allowdroptypes(dragsrc);
        
        if (this.children.length == 0) {
            if (this.childtypematch(dragsrc)) 
                types.push("dropinto");
        }
        return types;
    }
    childdroptypes(dragsrc) {
        if (this.singlar) return [];
        if (!this.childtypematch(dragsrc)) return [];
        return ["dropleft", "dropright"];
    }
    ondrop(src, droptype) {
        switch (droptype) {
            case 'dropinto':
                this.prepend(src, 0);
                this.$addbtn.before(src.$div);
                break;
            default:
                super.ondrop(src, droptype);
        }
        this.adjustAddButton();
    }
    adjustAddButton() {
        if (this.singlar && this.children.length) {
            this.$addbtn.hide();
        } else {
            this.$addbtn.show();
        }
    }
    render() {
        this.$div = super.render();
        this.$div.children(".splitblock").remove();
        this.$splitdiv = $("<div>").addClass("block splitblock").appendTo(this.$div);
        this.children.forEach(v => {
            v.render().appendTo(this.$splitdiv);
        });
        this.$addbtn = $("<div>").addClass("block splitaddblock")
            .on("click", {thiz: this}, (e)=>{
                const thiz = e.data.thiz;
                const newgroup = new Parent({});
                thiz.children.push(newgroup);
                this.$addbtn.before(newgroup.render());
                thiz.adjustAddButton();
            }).appendTo(this.$splitdiv);
        this.adjustAddButton();
        return this.$div;
    }
    export() {
        const thiz = super.export();
        thiz["_children"] = {};
        thiz["splits"] = [];
        this.children.forEach((v, i) => {
            thiz["_children"][i+1] = v.export();
            thiz["splits"].push(v._splits);
        });
        return thiz;
    }
}

blockTypes.add({
    "skll.block.baseblock.Block": {
        cls: Block,
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
            }
        },
    },
    ".split": {
        cls: Split,
        hidden: true,
        desc: "Internal type that has no effect",
        childof: "skll.block.baseblock.Block",
    },
    ".parent": {
        cls: Parent,
        hidden: true,
        desc: "Internal type that has no effect",
        childof: "skll.block.baseblock.Block",
    },
});