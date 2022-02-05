import UUID from "./UUID.mjs";
import Table from "./Table.mjs";
import PlotDialog from "./PlotDialog.mjs";

export default class TabView {

    static tabClick(e) {
        e.preventDefault();
        e.stopPropagation();
        const thiz = e.data.thiz;
        const itemid = $(e.delegateTarget).find("a.tab-view-tab-link").attr("href").substring(1);
        thiz.showTab(itemid);
    }
    static closeClick(e) {
        const id = e.data.id;
        const thiz = e.data.thiz;
        const tli = thiz._view.find(`#tli_${id}`);
        if (tli.hasClass("tab-view-selected-tab-button")) {
            if (tli.next().length) tli.next().click();
            else tli.prev().click();
        }
        tli.remove();
        thiz._view.find(`#${id}`).remove();
    }
    showTab(id) {
        this._view.find(".tab-view-visible-item").removeClass("tab-view-visible-item");
        this._view.find(".tab-view-selected-tab-button").removeClass("tab-view-selected-tab-button");
        $(`#${id}`).addClass("tab-view-visible-item");
        $(`#tli_${id}`).addClass("tab-view-selected-tab-button");
    }
    
    addTab(name, icon, view, closable=true) {
        const id = UUID();
        view.attr("id", id).addClass("tab-view-item");
    
        const li = $(`<li id="tli_${id}" class="tab-view-tab-button">`).on("click", {thiz: this}, TabView.tabClick).appendTo(this.tablist);
        const a = $(`<a href="#${id}" class="tab-view-tab-link" id="tb_${id}">`).appendTo(li);
        if (closable) $('<a href="#" class="tab-view-close-button">').on("click", {thiz: this, id: id}, TabView.closeClick).appendTo(li);
        if (icon) {
            $(`<img src="${icon}">`).appendTo(a);
        }
        $("<span>").html(name).appendTo(a);
        view.appendTo(this._view);
        a.click();
        return id;
    }

    constructor(view) {
        if (!view) view = $("<div>");
        this._view = view.addClass("flex-column tab-view");
        view.data("thiz", this);
        this.tablist = $("<ul class='tab-view-tab-bar'>").appendTo(this._view);
    }
    get panel() {
        return this._view;
    }

    addScoreTable(name, scores) {
        const columns = [
            {
                title: "name",
                data: 0,
            }, {
                title: "score",
                data: 1,
            }
        ];
        this.addTab(name, "/static/img/table_rows_black_24dp.svg", new Table(name, scores, columns, (table) => {
            PlotDialog.render(table, this);
        }).table);
    }
    addDataTable(name, data, warning) {
        //get columns from dataset
        //assume records orient from pd
        let columns = [];
        let fixColumn = false;
        Object.keys(data[0]).forEach(v => {
            if (v == "__ID__") {
                columns.unshift({
                    title: "ID",
                    data: v, 
                });
                fixColumn = true;
            } else {
                columns.push({
                    title: v,
                    data: v, 
                });
            }
        });
        this.addTab(name, "/static/img/table_rows_black_24dp.svg", new Table(name, data, warning, columns, (table) => {
            PlotDialog.render(table, this);
        }).table);
    }
}