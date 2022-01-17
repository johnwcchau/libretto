export class LogPanel {
    // static prompt = $("<dialog>")
    //     .attr("id", "loading_dialog")
    //     .addClass("modal");

    #getlastline(cls) {
        if (cls) return this._panel.find("div."+cls).last();
        return this._panel.find("div").last();
    }
    #getlinemsg(line) {
        return line.html();
    }
    #makeline(cls, msg) {
        $("<div class='" + cls + "'>" + msg + "</div>").appendTo(this._panel);
    }
    #showlog() {
        this._panel.scrollTop(this._panel.prop("scrollHeight"));
    }
    #isclass(line, cls) {
        return line.hasClass(cls);
    }
    #replace(line, msg) {
        line.html(msg).detach().appendTo(this._panel);
    }
    err(msg) {
        this.log("err", msg);
    }
    log(cls,msg) {
        if (!msg) return;
        const oldline = this.#getlastline();
        if ((this.#getlinemsg(oldline) == msg) && (this.#isclass(oldline, cls))) {
            return;
        }
        this.#makeline(cls, msg);
        this.#showlog();
    }
    write(stream, msg) {
        let m = "";
        msg = trimchar(msg, "'").replace("\\t", "    ").split("\\n");
        const first = msg[0].trim();
        if (first) {
            const ele = Log.#getlastline(stream);
            if (ele.length > 0) {
                let oldmsg = Log.#getlinemsg(ele);
                if (first.includes("\\r")) {
                    const v = first.split("\\r");
                    oldmsg = "Remote: " + v[v.length-1]
                } else {
                    oldmsg = oldmsg + " " + first;
                }
                this.#replace(oldmsg);
                if (oldmsg != "") m = oldmsg;
            } else {
                this.log(stream, "Remote: " + first);
                if (first != "") m = first;
            }
        }
        for (i = 1; i < msg.length; i++) {
            let l = msg[i].trim().split("\\r");
            l  = l[l.length - 1];
            this.log(stream, "Remote: " + l);
            if (l != "") m = l;
        }
        return m;
    }
    dialog(msg, progress=false) {
        this._loadingMsg.html(msg.replace("Remote: ", ""));
        this._loadingBar.progressbar("value", progress);
        if (!LogPanel._prompt.is(":visible")) {
            LogPanel._prompt.modal({
                closeExisting: true,
                escapeClose: false,
                clickClose: false,
                showClose: false,
            });
        }
    }
    hideDialog() {
        $.modal.close();
    }

    constructor() {
        this._panel = $("<div>").addClass("logPanel");
        $('<a href="#">')
            .addClass("logPanel_clear_button")
            .html("Clear")
            .click(()=> {
                this._panel.find("div").remove();
            }).appendTo(this._panel);
        const promptSection = $("<section>").appendTo(LogPanel._prompt);
        this._loadingBar = $("<div>").attr("id", "loading_bar").appendTo(promptSection);
        this._loadingBar.progressbar();
        this._loadingMsg = $("<div>").attr("id", "loading_msg").appendTo(promptSection);

        LogPanel.instance = this;
    }
    get panel() {
        return this._panel;
    }
}