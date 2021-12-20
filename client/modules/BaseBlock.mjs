import EditDialog from './EditDialog.mjs';
import UUID from './UUID.mjs';

export let blockTypes = {};

export class Block {
    applycls(args, cls) {
        if (!cls) return;
        if (cls.childof) {
            this.applycls(args, blockTypes[cls.childof]);
        }
        if (cls.properties) {
            cls.properties.forEach((v, i) => {
                this._properties[i] = v;
                if (args[i]) {
                    this[i] = args[i];
                } else if (v.default) {
                    this[i] = v.default;
                }
            })
        }
    }
    constructor(args) {
        this._properties = {};
        this._type = (args && args._type) ? args._type : "skll.block.Block";
        const cls = blockTypes[this._type];
        if (cls) {
            this.applycls(args, cls);
        }
        if (!this.name) {
            this.name = UUID();
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
    tojson() {

    }
    remove(obj) {}
    append(obj, at) {}
    prepend(obj, at) {}

    begindrag() {
        this.dragging = this.$div.clone().addClass("dragbox").appendTo($("body"))
        this.$div.addClass("dragsource");
        $(document).data("dragsource", this)
            .on('mousemove', Block.onmousemove)
            .on('mouseup', Block.onmouseup);
        $("#trash").addClass("visible");
    }
    afterdrag() {
        this.$div.detach();
        this.$div.removeClass("newobj");
        if (this.parent) this.parent.remove(this);
    }
    droptype(dragsrc, loc) {
        if (dragsrc._type == "__fileblock") return null;
        if (loc.y < 0.5)
            return "dropbefore";
        return "dropafter";
    }
    ondrop(src, droptype) {
        switch (droptype) {
            case "dropbefore":
                this.parent.prepend(src, this);
                this.$div.before(src.$div);
                break;
            case "dropafter":
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
        let thiz = $(document).data("dragsource");
        if (!thiz) return;
        e.preventDefault();
        e.stopPropagation();
        $("#trash").removeClass("visible");
        let target = $(document).data("droptarget");
        if (target) {
            if (target != "trash") {
                const droptype = thiz.droptype;
                target.$div.removeClass(droptype);
                thiz.afterdrag();
                target.ondrop(thiz, droptype);
            } else
                $("#trash").removeClass("dropinto");
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
    static onmouseover(e) {
        const dragsrc = $(document).data("dragsource");
        const thiz = e.data.thiz;
        if (!dragsrc) return;
        e.preventDefault();
        e.stopPropagation();
        let oldtgt = $(document).data("droptarget");
        if (oldtgt) {
            if (oldtgt != "trash") {
                olddroptype = oldtgt.droptype;
                oldtgt.$div.removeClass(olddroptype);
                oldtgt.droptype = null;
            } else
                $("#trash").removeClass("dropinto");
        }

        let droptype = thiz.droptype(dragsrc, {
            x: e.originalEvent.offsetX / thiz.$div.width(), 
            y: e.originalEvent.offsetY / thiz.$div.height(),
        });
        if (!droptype) return;
        $(document).data("droptarget", thiz);
        thiz.$div.addClass(droptype);
        thiz.droptype = droptype;
    }
    static onmouseout(e) {
        if (!$(document).data("dragsource")) return;
        e.preventDefault();
        e.stopPropagation();
        let thiz = e.data.thiz;
        if ($(document).data("droptarget") == thiz) {
            $(document).data("droptarget", false);
        }
        thiz.$div.removeClass("dropafter dropinto");
    }
    registerEvents() {
        this.$div.on("mousedown", {"thiz": this}, Block.onmousedown)
            .on("mouseover", {"thiz": this}, Block.onmouseover)
            .on("mouseout", {"thiz": this}, Block.onmouseout)
            .on("dragover", {"thiz": this}, Block.onmouseover);
    }
}
/**
 * Non-exporting class for splits to hold block group
 */
export class BlockHolder extends Block {
    constructor(singlar) {
        this._blocks = [];
        this.canMove = false;
        this.singlar = singlar;
    }
    get desc() {
        return "";
    }
    droptype(dragsrc, loc) {
        if (this.singlar && this._blocks.length > 0)
            return null;
        return super.droptype(dragsrc, loc);
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
        obj.parent = this;
        this._blocks.unshift(src);
        let tgt = this.$div.find(".block:first");
        if (tgt.length) 
            tgt.before(obj.$div);
        else    // no block inside me
            this.$div.append(obj.$div);
    }
    render() {
        this.$div = super.render().addClass("blockset");
        this.$div.children(".block").remove();
        this._blocks.forEach(v => {
            v.render().appendTo(this.$div);
        });
        return this.$div;
    }
    tojson() {

    }
}
export class Parent extends Block {
    constructor(args) {
        if (!args._type) args._type = "skll.block.Parent";
        super(args);
        this._blocks = [];
        // this.blocks = kwargs.children;
        // this.blocks.forEach(v => {
        //     v.parent = this;
        // })
        // this.canMove = false;
    }
    get desc() {
        return "";
    }
    remove(obj) {
        let idx = this._blocks.indexOf(obj);
        if (idx != -1) this._blocks.splice(idx, 1);
        obj.parent = null;
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
    attach(obj) {
        obj.parent = this;
        this._blocks.unshift(obj);
        let tgt = this.$div.find(".block:first");
        if (tgt.length) 
            tgt.before(obj.$div);
        else    // no block inside me
            this.$div.append(obj.$div);
    }
    render() {
        this.$div = super.render().addClass("blockset");
        this.$div.children(".block").remove();
        this._blocks.forEach(v => {
            v.render().appendTo(this.$div);
        });
        return this.$div;
    }
    tojson() {
        var result = [];
        this._blocks.forEach(v => {
            result.push(v.tojson());
        });
        return {
            name: this.name,
            type: this._type,
            layers: result
        };
    }
}
/**
 * Hacking block for file drag and drop
 */
export class FileBlock extends Block {
    constructor(kwargs) {
        kwargs.type = "__fileblock";
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
    constructor(args) {
        if (!args._type) args._type = "skll.block.Split";
        super(args);
        if (!this.splits) this.splits = [];
        this._child = [];
        for (let i = 0; i < this.splits.length; i++) this._child.push(new Parent());
        // this.splits = kwargs.children;
        // this.splits.forEach(v => {
        //     v.blockset = new Parent({blocks: v.blocks});
        //     v.blockset.parent = this;
        //     v.blockset.canEdit = false;
        //     v.blockset.name = v.name;
        // })
    }
    render() {
        this.$div = super.render();
        this.$div.children(".splitblock").remove();
        let $div = $("<div>").addClass("block splitblock").appendTo(this.$div);
        this.splits.forEach(v => {
            v.blockset.render().appendTo($div);
        });
        return this.$div;
    }
    tojson() {
        var result = [];
        this.splits.forEach(v => {
            result.push({
                columns: v.columns,
                layers: v.blockset.tojson().layers,
            })
        });
        return {
            name: this.name,
            type: this._type,
            splits: result
        };
    }
}

blockTypes = {
    "skll.block.baseblock.Block": {
        cls: Block,
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
    "skll.block.baseblock.Split": {
        cls: Split,
        childof: "skll.block.baseblock.Block",
        properties: {
            "splits": {
                desc: "Splits",
                type: "list(text)",
                enabled: true,
            }
        }
    },
    "skll.block.baseblock.Parent": {
        cls: Parent,
        childof: "skll.block.baseblock.Block",
    }
};