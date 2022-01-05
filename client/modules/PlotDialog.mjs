class PlotDialog {
    static plottype = ["scatter", "line", "bar", "pie", "box", 
        "histogram", "histogram2d"];
    static dialog_html = `
<dialog id="plot_dialog" class="modal plot-dialog">
    <div class="toolbar">
        <a href="#" id="plot_plot">Plot</a>
        <a href="#" id="plot_reset">Reset</a>
    </div>
    <div id="plot_layout_param">
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
    </div>
    <table>
        <thead>
            <tr>
                <th>type</th>
                <th>X</th>
                <th>Y</th>
                <th>+</th>
                <th>-</th>
            </tr>
        </thead>
        <tbody id="plot_traces">

        </tbody>
    </table>
</dialog>
    `;
    static trace_html = `
<tr>
    <td class="plot_trace_type"></td>
    <td class="plot_trace_X"></td>
    <td class="plot_trace_Y"></td>
    <td><a href="#" class="plot_trace_add">+</a></td>
    <td><a href="#" class="plot_trace_rm">-</a></td>
</tr>
    `;
    static onPlotClicked(e) {
        const thiz = e.data.thiz;
        const dialog = thiz.dialog;
        let data = [];
        const barmode = dialog.find("#plot_barmode").val();
        const title = dialog.find("#plot_title").val();
        const showlegend = dialog.find("#plot_showlegend").prop("checked");
        thiz._traces.find("tr").each((i, v) => {
            const t = $(v).find(".plot_trace_type_selector").val();
            const xid = $(v).find(".plot_trace_X_selector").val();
            const yid = $(v).find(".plot_trace_Y_selector").val();
            const x = (xid == -1) ? null : thiz.table.dt.column(xid).data().toArray();
            const y = (yid == -1) ? null : thiz.table.dt.column(yid).data().toArray();
            data.push({
                x: x,
                y: y,
                type: (t == "line") ? "scatter" : t,
                mode: (t == "line") ? "lines+markers" : (t=="scatter") ? "markers" : null,
                opacity: 0.5
            })
        });
        const layout = {
            title: title,
            barmode: barmode,
            showlegend: showlegend,
        }
        const $div = $(`<div class="plot">`);
        const id=thiz.tabView.addTab(title, null, $div); 
        $.modal.close();
        setTimeout(()=>{
            Plotly.newPlot(id, data, layout);
        }, 10);
    }
    static onResetClicked(e) {
        e.data.thiz.reset();
    }
    removetraceline(row) {
        if (this._dialog.find("tbody tr").length == 1) return;
        row.remove();
    }
    addtraceline() {
        const traceline = $(PlotDialog.trace_html).appendTo(this._traces);
        $(PlotDialog._plottype_selector_html).addClass("plot_trace_type_selector").appendTo(traceline.find(".plot_trace_type"));
        $(this._column_selector_html).addClass("plot_trace_X_selector").appendTo(traceline.find(".plot_trace_X"));
        $(this._column_selector_html).addClass("plot_trace_Y_selector").appendTo(traceline.find(".plot_trace_Y"));
        traceline.find(".plot_trace_add").on("click", {thiz: this}, (e)=>{
            e.data.thiz.addtraceline();
        });
        traceline.find(".plot_trace_rm").on("click", {thiz: this, row: traceline}, (e)=>{
            e.data.thiz.removetraceline(row);
        });
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
        const selectedcolumns = this.table.selectedcolumns;
        const columns = this.columns;
        if (!Object.keys(selectedcolumns).length) return;
        let yid = null;
        Object.keys(columns).forEach(i => {
            if (columns[i] == "__Y__")
                yid = i;
        })
        if (!yid) return;
        this._traces.html("");
        Object.keys(selectedcolumns).forEach(i => {
            if (i == yid) return;
            const line = this.addtraceline();
            line.find(".plot_trace_X_selector").val(i);
            line.find(".plot_trace_Y_selector").val(yid);
        });
    }
    render(table, tabView) {
        this.table = table;
        this.columns = table.columns;
        this.tabView = tabView;
        this.reset();
        this.default();
        return this.dialog;
    }
    
    constructor() {
        if (PlotDialog.instance) {
            return PlotDialog.instance;
        }
        this._dialog = $(PlotDialog.dialog_html);
        this._traces = this._dialog.find("#plot_traces");
        this._dialog.find("#plot_plot").on("click", {thiz:this}, PlotDialog.onPlotClicked);
        this._dialog.find("#plot_reset").on("click", {thiz:this}, PlotDialog.onResetClicked);
        PlotDialog.instance = this;
    }
    get dialog() {
        return this._dialog;
    }
}

let types = [];
PlotDialog.plottype.forEach(v => {
    types.push(`<option value="${v}">${v}</option>`);
});
PlotDialog._plottype_selector_html = "<select>" + types.join() + "</select>";

const instance = new PlotDialog();
export default instance;