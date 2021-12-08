import EditDialog from './EditDialog.mjs'

export class Block {
    constructor(kwargs) {
        this._name = (kwargs && kwargs.name) ? kwargs.name : "Block";
        this._type = (kwargs && kwargs.type) ? kwargs.type : "Block";
        this._properties = {
            "_name": {
                desc: "Name",
                type: "text",
                enabled: true,
            },
            "_type": {
                desc: "Constructor",
                type: "text",
                enabled: false,
            },
            "_uuid": {
                desc: "Remote object UUID",
                type: "text",
                enabled: false,
            }
        };
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
    };
    addProperties(name, desc=null, type="text", enabled=true) {
        if (this._properties.indexOf(name) != -1) {
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
    onFileDropped(file) { }
    createEditBtn() {
        return $("<a href='#'>")
            .addClass("editbtn")
            .on("click", {thiz: this}, Block.__onEditClicked)
            .html("✏️");
    }
    render() {
        if (!this.$div) {
            this.$div = $("<div>").addClass("block");
            $("<span>").addClass("title").html(this._name).appendTo(this.$div);
            $("<span>").addClass("desc").html(this.desc).appendTo(this.$div);
            if (this.canEdit)
                this.createEditBtn().appendTo(this.$div);
            this.registerEvents();
        } else {
            this.$div.children("span.title").html(this._name);
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
        return {
            _name: this._name,
            _type: this._type,
        }
    }
    remove(obj) {}
    append(obj, at) {}
    detach() {
        this.$div.detach();
        this.$div.removeClass("newobj");
        if (this.parent) this.parent.remove(this);
    }
    attach(obj) {
        this.parent.append(obj, this);
        this.$div.after(obj.$div);
    }
    static performdragndrop(src, target) {
        src.detach();
        if (target != "trash")
            target.attach(src);
    }
    begindrag() {
        this.dragging = this.$div.clone().addClass("dragbox").appendTo($("body"))
        this.$div.addClass("dragsource");
        $(document).data("dragsource", this)
            .on('mousemove', Block.onmousemove)
            .on('mouseup', Block.onmouseup);
        $("#trash").addClass("visible");
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
    static setfiledrop(file) {
        let thiz = $(document).data("dragsource");
        if (!thiz) return;
        thiz._filedrop = file;
    }
    static onmouseup(e) {
        let thiz = $(document).data("dragsource");
        if (!thiz) return;
        e.preventDefault();
        e.stopPropagation();
        $("#trash").removeClass("visible");
        let target = $(document).data("droptarget");
        if (target) {
            if (target != "trash")
                target.$div.removeClass("droptarget");
            else
                $("#trash").removeClass("droptarget");
            Block.performdragndrop(thiz, target);
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
        if (thiz._filedrop) {
            let file = thiz._filedrop;
            thiz._filedrop = null;
            thiz.onFileDropped(file);
        }
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
        if (!$(document).data("dragsource")) return;
        e.preventDefault();
        e.stopPropagation();
        let thiz = e.data.thiz;
        let oldtgt = $(document).data("droptarget");
        if (oldtgt) {
            if (oldtgt != "trash")
                oldtgt.$div.removeClass("droptarget");
            else
                $("#trash").removeClass("droptarget");
        }
        $(document).data("droptarget", thiz);
        thiz.$div.addClass("droptarget");
    }
    static onmouseout(e) {
        if (!$(document).data("dragsource")) return;
        e.preventDefault();
        e.stopPropagation();
        let thiz = e.data.thiz;
        if ($(document).data("droptarget") == thiz) {
            $(document).data("droptarget", false);
        }
        thiz.$div.removeClass("droptarget");
    }
    registerEvents() {
        this.$div.on("mousedown", {"thiz": this}, Block.onmousedown)
            .on("mouseover", {"thiz": this}, Block.onmouseover)
            .on("mouseout", {"thiz": this}, Block.onmouseout)
            .on("dragover", {"thiz": this}, Block.onmouseover);
    }
}
export class BlockSet extends Block {
    constructor(kwargs) {
        super(kwargs);
        if (!this.type) this.type = "blockset";
        this.blocks = kwargs.blocks;
        this.blocks.forEach(v => {
            v.parent = this;
        })
        this.canMove = false;
    }
    get desc() {
        return "";
    }
    remove(obj) {
        let idx = this.blocks.indexOf(obj);
        if (idx != -1) this.blocks.splice(idx, 1);
        obj.parent = null;
    }
    append(obj, at) {
        if (at === null) at = -1;
        if (typeof(at) == "object") {
            at = this.blocks.indexOf(at);
        }
        if (at == -1) {
            this.blocks.push(obj);
        } else {
            this.blocks.splice(at+1, 0, obj);
        }
        obj.parent = this;
    }
    attach(obj) {
        obj.parent = this;
        this.blocks.unshift(obj);
        let tgt = this.$div.find(".block:first");
        if (tgt.length) 
            tgt.before(obj.$div);
        else    // no block inside me
            this.$div.append(obj.$div);
    }
    render() {
        this.$div = super.render().addClass("blockset");
        this.$div.children(".block").remove();
        this.blocks.forEach(v => {
            v.render().appendTo(this.$div);
        });
        return this.$div;
    }
    tojson() {
        var result = [];
        this.blocks.forEach(v => {
            result.push(v.tojson());
        });
        return {
            name: this._name,
            type: this._type,
            layers: result
        };
    }
}
export class BlockSplit extends Block {
    constructor(kwargs) {
        super(kwargs);
        this.type = "blocksplit";
        this.splits = kwargs.splits;
        this.splits.forEach(v => {
            v.blockset = new BlockSet({blocks: v.blocks});
            v.blockset.parent = this;
            v.blockset.canEdit = false;
            v.blockset.name = v.name;
        })
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
            name: this._name,
            type: this._type,
            splits: result
        };
    }
}
