class ContextMenu {
    positonToEvent(e) {
        let posx = 0;
        let posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + 
                            document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + 
                            document.documentElement.scrollTop;
        }
        this._panel.css({
            left: posx,
            top: posy
        });
        return this;
    }
    static hide() {
        $(".context-menu-highlighted").removeClass("context-menu-highlighted");
        const thiz = ContextMenu.instance;
        if (thiz.onHide) thiz.onHide();
        $("div.context-menu").remove();
        $(document).off("click", ContextMenu.hide);
    }
    showAt(e) {
        $(".context-menu-highlighted").removeClass("context-menu-highlighted");
        if (e.delegateTarget) $(e.delegateTarget).addClass("context-menu-highlighted");
        this.positonToEvent(e);
        this._panel.appendTo("body");
        $(document).on("click", ContextMenu.hide);
        return this;
    }
    make(options, onHide) {
        this.onHide = onHide;
        this._panel.html("");
        options.forEach(v => {
            const a = $('<a class="context-menu-item" href="#">').click((e)=>{
                ContextMenu.hide();
                if (v.click) v.click(v);
            }).appendTo(this._panel);
            if (v.icon) {
                $(`<img class="context-menu-item-icon" src=${v.icon} />`).appendTo(a);
            }
            $(`<span class="context-menu-item-text">`).html(v.title || "").appendTo(a);
        });
        return this;
    }
    constructor(options) {
        if (ContextMenu.instance) {
            return ContextMenu.instance;
        }
        this._panel = $("<div>").addClass("context-menu");
        this.data = null;
        this.onHide = null;
        ContextMenu.instance = this;
    }
    get panel() {
        return this._panel;
    }
}

const instance = new ContextMenu();
Object.seal(instance);
export default instance;