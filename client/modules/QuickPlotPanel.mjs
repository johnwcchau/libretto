class QuickPlotPanel {
    static plottype = {
        "Scatter": ["x", "y", "marker.size"],
        "bar": ["x", "y"],
        "pie": ["labels", "values"],
        "candlestick": ["x", "open", "close", "low", "high"],
        "ohic": ["x", "open", "close", "low", "high"],
        "box": ["y"],
        "histogram": ["x"],
        "histogram2d": ["x", "y"],
        "violin": ["y"],
    }

    static dialog_html = `
<div id="plot_dialog" class="plot-dialog">
    <div class="toolbar">
        <a href="#" id="plot_plot">Plot</a>
        <a href="#" id="plot_reset">Reset</a>
        <a href="#" id="plot_add_trace">+</a>
        <a href="#" id="plot_cancel">Cancel</a>
    </div>
    <span>
        <label for="plot_barmode">Barmode</label>
        <select name="plot_barmode" id="plot_barmode">
            <option value="">-</option>
            <option value="group">group</option>
            <option value="stack">stack</option>
            <option value="overlay">overlay</option>
        </select>
    </span>
    <span>
        <label for="plot_title">Title</label>
        <input name="plot_title" id="plot_title"/>
    </span>
    <span>
        <input type="checkbox" name="plot_showlegend" id="plot_showlegend"/>
        <label for="plot_showlegend">Show Legend</label>
    </span>
    <div class="plot-traces">
    </div>
</div>
    `;
    static onPlotClicked(e) {
        const thiz = e.data.thiz;
        const dialog = thiz.dialog;
        let data = [];
        const barmode = dialog.find("#plot_barmode").val();
        const title = dialog.find("#plot_title").val();
        const showlegend = dialog.find("#plot_showlegend").prop("checked");
        let tracecnt = 0;
        thiz._traces.find(".plot-traceline").each((i, v) => {
            const typename = $(v).find(".plot-trace-type-selector").val();
            const type = QuickPlotPanel.plottype[typename];
            if (!type || !type.length) return;
            let datum = {
                type: typename,
                opacity: 0.5,
            };
            $(v).find(".plot-trace-selector").each((i,v)=>{
                const val = $(v).find("select").val();
                if (val=="-1") return;
                const key = $(v).find("label").html().split(".");
                let layer = datum;
                for (let idx = 0; idx < key.length - 1; idx++) {
                    if (!layer[key[idx]]) layer[key[idx]] = {};
                    layer = layer[key[idx]];
                }
                layer[key.pop()] = thiz.table.dt.column(val).data().toArray();
            });
            if (typename=="Scatter") datum["mode"] = "markers";
            datum["name"] = `trace ${++tracecnt}`;
            data.push(datum);
        });
        const layout = {
            title: title,
            barmode: barmode,
            showlegend: showlegend,
        }
        const $div = $(`<div class="plot">`);
        const id=thiz.tabView.addTab(title, "/static/img/show_chart_black_24dp.svg", $div); 
        $.modal.close();
        setTimeout(()=>{
            Plotly.newPlot(id, data, layout, {editable:true, responsive: true});
        }, 10);
    }
    static onResetClicked(e) {
        e.data.thiz.reset();
    }
    static onAddTraceClicked(e) {
        e.data.thiz.addtraceline();
    }
    static onPlotTypeChanged(e) {
        const val = $(e.delegateTarget).val();
        const type = QuickPlotPanel.plottype[val];
        const cnt = type ? type.length: 0;
        const thiz = e.data.thiz;
        let exist = e.data.row.find(".plot-trace-selector").length;
        while (exist > cnt) {
            e.data.row.find(".plot-trace-selector:last").remove();
            exist--;
        }
        while (exist < cnt) {
            const line = $('<span class="plot-trace-selector">').appendTo(e.data.row);
            $('<label class="plot-trace-selector-label">').appendTo(line);
            $(thiz._column_selector_html)
                .appendTo(line);
            exist++;
        }
        e.data.row.find(".plot-trace-selector>label").each((i, v) => {
            $(v).html(type[i]);
        })
    }
    static onCancel(e) {
        e.data.thiz.dialog.detach();
    }
    removetraceline(row) {
        if (this._dialog.find(".plot-traceline").length == 1) return;
        row.remove();
    }
    addtraceline() {
        const traceline = $('<span class="plot-traceline">').appendTo(this._traces);
        //$('<span class="plot-trace-selector"><label class="plot-trace-selector-label">Name</label><input class="plot-trace-name"/></span>').appendTo(traceline);
        $('<a href="#" class="plot-trace-rm">Remove</a>')
            .on("click", {thiz: this, row: traceline}, (e)=>{
                e.data.thiz.removetraceline(e.data.row);
            })
            .appendTo(traceline);
        const selector = $(QuickPlotPanel._plottype_selector_html);
        selector.addClass("plot-trace-type-selector")
            .on("change", {thiz: this, row: traceline}, QuickPlotPanel.onPlotTypeChanged)
            .appendTo(traceline);
        selector.trigger("change");
        return traceline;
    }
    reset() {
        const table = this.table;
        const columns = this.columns;
        this._traces.html("");
        this.dialog.find("#plot_title").val(table.name);
        let cols = [];
        Object.keys(columns).forEach(i => {
            const v = columns[i];
            cols.push(`<option value="${i}">${v}</option>`);
        });
        this._column_selector_html = '<select><option value="-1">-</option>' + cols.join("") + "</select>";
        this.addtraceline();
    }
    default() {
        // const selectedcolumns = this.table.selectedcolumns;
        // const columns = this.columns;
        // if (!Object.keys(selectedcolumns).length) return;
        // let yid = null;
        // Object.keys(columns).forEach(i => {
        //     if (columns[i] == "__Y__")
        //         yid = i;
        // })
        // if (!yid) return;
        // this._traces.html("");
        // Object.keys(selectedcolumns).forEach(i => {
        //     if (i == yid) return;
        //     const line = this.addtraceline();
        //     line.find(".plot_trace_X_selector").val(i);
        //     line.find(".plot_trace_Y_selector").val(yid);
        // });
    }
    render(table, tabView) {
        if (!this.container) return;
        this.table = table;
        this.columns = table.columns;
        this.tabView = tabView;
        this.reset();
        this.default();
        this.container.html("");
        this.dialog.appendTo(this.container);
        this.container.data("tabView").showTab(this.container.attr("id"));
        return this.dialog;
    }
    
    constructor() {
        if (QuickPlotPanel.instance) {
            return QuickPlotPanel.instance;
        }
        this.container = null;
        this._dialog = $(QuickPlotPanel.dialog_html);
        this._traces = this._dialog.find(".plot-traces");
        this._dialog.find("#plot_plot").on("click", {thiz:this}, QuickPlotPanel.onPlotClicked);
        this._dialog.find("#plot_reset").on("click", {thiz:this}, QuickPlotPanel.onResetClicked);
        this._dialog.find("#plot_add_trace").on("click", {thiz:this}, QuickPlotPanel.onAddTraceClicked);
        this._dialog.find("#plot_cancel").on("click", {thiz:this}, QuickPlotPanel.onCancel);
        QuickPlotPanel.instance = this;
    }
    get dialog() {
        return this._dialog;
    }
}

let types = [];
Object.keys(QuickPlotPanel.plottype).forEach(v => {
    types.push(`<option value="${v}">${v}</option>`);
});
QuickPlotPanel._plottype_selector_html = "<select>" + types.join() + "</select>";

const instance = new QuickPlotPanel();
export default instance;