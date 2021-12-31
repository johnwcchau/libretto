export class ColumnSelector {
    static _dragTimer = null;

    async refresh() {
        //dynamic import to avoid import ordering problem
        const Session = (await import("/static/modules/Session.mjs")).default; 
        Session.run("COLUMNS", this._block, "columns").then(r => {
            this._list.html("");
            const idx = (this._mode == "datatype") ? 1 : 0;
            let options = new Set();
            r.columns.forEach(v => {
                options.add(v[idx]);
            })
            options.forEach(v => {
                const option = $(`<option value="${v}">`).html(v);
                if (this._init.indexOf(v) != -1) {
                    option.prop("selected", true);
                }
                option.appendTo(this._list);
            });
        });
    }

    json() {
        let result = [];
        this._list.find("option").each((i, v) => {
            const $v = $(v);
            if ($v.prop("selected")) result.push($v.attr("value"));
        });
        return result;
    }
    constructor(block, init=[], mode="column", multiple=true) {
        this._block = block;
        this._mode = mode;
        this._init = init;
        this._multiple = multiple;
        this._list = $("<select>").addClass("column-selector-list").data("thiz", this).prop("multiple", multiple);
        this.refresh();
    }
    get panel() {
        return this._list;
    }
}
