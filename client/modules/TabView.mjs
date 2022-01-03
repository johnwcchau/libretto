import UUID from "./UUID.mjs";

export default class TabView {

    static tabClick(e) {
        const thiz = e.data.thiz;
        const itemid = $(e.delegateTarget).attr("href");
        thiz._view.find(".tab-view-item").css("display", "none");
        $(itemid).css("display", "block");
        thiz._view.find(".tab-view-selected-tab-button").removeClass("tab-view-selected-tab-button");
        $(e.delegateTarget).parent().addClass("tab-view-selected-tab-button");
    }
    static closeClick(e) {
        const id = e.data.id;
        const thiz = e.data.thiz;
        thiz._view.find(`#tli_${id}`).remove();
        thiz._view.find(`#${id}`).remove();
    }
    addScoreTable(name, scores) {
        const table = $(`<table id="${name}" class="score-table">`).dataTable({
            data: scores,
            columns: [{
                title: "name",
                data: 0,
            }, {
                title: "score",
                data: 1,
            }],
        });
        this.addTab(name, null, $(table.api().table().container()));
    }
    addDataTable(name, data) {
        //get columns from dataset
        //assume records orient from pd
        let columns = [];
        Object.keys(data[0]).forEach(v => {
            if (v == "__ID__") {
                columns.unshift({
                    title: "ID",
                    data: v, 
                });
            } else {
                columns.push({
                    title: v,
                    data: v, 
                });
            }
        });
        const table = $(`<table id="${name}" class="data-table">`).dataTable({
            data: data,
            columns: columns,
        });
        this.addTab(name, null, $(table.api().table().container()));
    }
    
    addTab(name, icon, view) {
        const id = UUID();
        view.attr("id", id).addClass("tab-view-item").css("display", "none");
    
        const li = $(`<li id="tli_${id}" class="tab-view-tab-button">`).appendTo(this.tablist);
        const a = $(`<a href="#${id}" id="tb_${id}">`).on("click", {thiz: this}, TabView.tabClick).appendTo(li);
        const close = $('<a href="#" class="tab-view-close-button">X</a>').on("click", {thiz: this, id: id}, TabView.closeClick).appendTo(li);
        if (icon) {
            $(`<img src="${icon}">`).appendTo(a);
        }
        $("<span>").html(name).appendTo(a);
        view.appendTo(this._view);
        a.click();
    }

    constructor(view) {
        this._view = view.addClass("flex-column tab-view");
        this.tablist = $("<ul class='tab-view-tab-bar'>").appendTo(this._view);
    }
}