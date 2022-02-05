import ContextMenu from "./ContextMenu.mjs";

export class ColumnSelector {
    static _dragTimer = null;

    static oncontextmenu(e) {
        e.preventDefault();
        e.stopPropagation();
        const thiz = e.data.thiz;
        const options = [
            {
                title: "Select None",
                click: () => {
                    thiz._list.find("option").each((i, v) => {
                        const $v = $(v);
                        $v.prop("selected", false);
                    });
                }
            },
            {
                title: "Select inverse",
                click: () => {
                    thiz._list.find("option").each((i, v) => {
                        const $v = $(v);
                        $v.prop("selected", !$v.prop("selected"));
                    });
                }
            },
            {
                title: "Select all numeric columns",
                icon: "/static/img/open_in_new_black_24dp.svg",
                click: () => {
                    const types = ["int32", "int64", "float32", "float64"];
                    thiz._list.find("option").each((i, v) => {
                        const $v = $(v);
                        const val = $v.attr("value");
                        $v.prop("selected", types.indexOf(thiz.columns[val]) != -1);
                    });
                }
            },
        ];
        ContextMenu.make(options).showAt(e);
    }
    render(columns) {
        this.columns = {};
        this._list.html("");
        const idx = (this._mode == "datatype") ? 1 : 0;
        const options = new Set();
        columns.forEach(v => {
            this.columns[v[0]] = v[1];
            options.add(v[idx]);
        })
        if (!this._multiple) {
            $(`<option value="">(None)</option>`).appendTo(this._list);
        }
        options.forEach(v => {
            const option = $(`<option value="${v}">`).html(v);
            if (this._init
                && ((this._multiple && this._init.indexOf(v) != -1)
                    || (!this._multiple && this._init == v))) {
                option.prop("selected", true);
            }
            option.appendTo(this._list);
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
    constructor(init=[], mode="column", multiple=true) {
        this._mode = mode;
        this._init = init;
        this._multiple = multiple;
        this._list = $("<select>");
        this._list.addClass("column-selector-list")
            .data("thiz", this)
            .prop("multiple", multiple);
        if (multiple)
            this._list.on("contextmenu", {"thiz": this}, ColumnSelector.oncontextmenu);
    }
    get panel() {
        return this._list;
    }
}
