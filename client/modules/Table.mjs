export default class Table {
    static toggleColumnSelect(e) {
        const thiz = e.data.thiz;
        const dt = thiz.dt;
        const cell = e.delegateTarget;
        const colIdx = dt.cell(cell).index().column;
        const $header = $(dt.column(colIdx).header());
        if ($header.hasClass("highlight")) {
            $header.removeClass("highlight");
            $(dt.column(colIdx).nodes()).removeClass('highlight');
        } else {
            $header.addClass("highlight");
            $(dt.column(colIdx).nodes()).addClass('highlight');
        }
    }
    
    constructor(name, data, columns, plotter) {
        const id=name.replaceAll(/[^0-9a-zA-Z]/g, "_");
        this.name = name;
        this.plotter = plotter;
        this._table = $(`<table id="${id}" class="data-table">`).dataTable({
            data: data,
            columns: columns,
            buttons: [
                "copy", 
                "csv", 
                {
                    text: "plot",
                    action: () => {
                        plotter(this);
                    }
                }
            ],
            dom: 'Blfrtip',
        });
        this._table.find("td").on("click", {thiz: this}, Table.toggleColumnSelect)
    }
    get dt() {
        return this._table.api();
    }
    get table() {
        return $(this.dt.table().container());
    }
    get columns() {
        let cols = {};
        this.dt.columns().header().each((v, i) => {
            cols[i] = $(v).html();
        })
        return cols;
    }
    get selectedcolumns() {
        let cols = {};
        this.dt.columns().header().each((v, i) => {
            const $v = $(v);
            if ($v.hasClass("highlight"))
                cols[i] = $v.html();
        })
        return cols;
    }
}