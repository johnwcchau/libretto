import getCurrentSession from "./Session.mjs";

class PlotPanel {
    /**
     * Plot param:
     *    filter, groupby, aggby, aggregate, column
     */
    static plottype = {
        "Scatter": ["x", "y", "marker.size", "marker.color"],
        "bar": ["x", "y", "marker.color"],
        "pie": ["labels", "values", "marker.color"],
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
            v = $(v);
            const name = v.find(".plot-trace-name").val() || `trace ${++tracecnt}`;
            const filter = v.find(".plot-trace-filter").val();
            const groupby = v.find(".plot-trace-groupby option:selected").map(function () {
                return $(this).val() ? $(this).val() : null;
            }).get();
            const typename = v.find(".plot-trace-type-selector").val();
            const type = PlotPanel.plottype[typename];
            if (!type || !type.length) return;
            let datum = {
                name: name,
                type: typename,
                filter: filter,
                groupby: groupby,
                opacity: 0.5,
                dims: [],
            };
            v.find(".plot-trace-selector").each((i,v)=>{
                v = $(v);
                const valtype = v.find(".plot-trace-data-type").val();
                let val = {
                    name: $(v).find("label").html(),
                    type: valtype,
                    val: null
                };
                if (valtype == "constant") {
                    val["val"] = v.find(".plot-trace-constant-value").val();
                } else if (valtype == "sum") {
                    val["val"] = v.find(".plot-trace-column").val();
                } else if (valtype == "column") {
                    val["val"] = v.find(".plot-trace-column").val();
                }
                if (!val["val"]) return;
                datum.dims.push(val);
                
            });
            if (typename=="Scatter") datum["mode"] = "markers";
            data.push(datum);
        });
        getCurrentSession().readPlotResult(data).then(r=> {
            const layout = {
                title: title,
                barmode: barmode,
                showlegend: showlegend,
            }
            const $div = $(`<div class="plot">`);
            const id=thiz.tabView.addTab(title, "/static/img/show_chart_black_24dp.svg", $div); 
            $.modal.close();
            setTimeout(()=>{
                Plotly.newPlot(id, r["traces"], layout, {editable:true, responsive: true});
            }, 10);
        });
    }
    static onResetClicked(e) {
        e.data.thiz.reset();
    }
    static onAddTraceClicked(e) {
        e.data.thiz.addtraceline();
    }
    static onPlotTypeChanged(e) {
        const val = $(e.delegateTarget).val();
        const type = PlotPanel.plottype[val];
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
            $(`
            <select class="plot-trace-data-type">
                <option value="column">Column</option>
                <option value="sum">Value Count</option>
                <option value="constant">Constant</option>
            </select>`).on('change', (e)=>{
                const select = $(e.delegateTarget);
                if (select.val() == "constant") {
                    select.siblings(".plot-trace-constant-value").css("display", "");
                    select.siblings(".plot-trace-column").css("display", "none");
                } else {
                    select.siblings(".plot-trace-constant-value").css("display", "none");
                    select.siblings(".plot-trace-column").css("display", "");
                }
            }).appendTo(line);
            $('<input class="plot-trace-constant-value" style="display:none">').appendTo(line);
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
        /**
         * <span.plot-traceline>
         *   <span.plot-trace-option>
         *     <label><input.plot-trace-name>
         *   </span>
         *   <span.plot-trace-option>
         *     <label><input.plot-trace-filter>
         *   </span>
         *   <span.plot-trace-option>
         *     <label><select.plot-trace-groupby>
         *   </span>
         *   <span.plot-trace-selector>
         *     <label><select>
         *   </span>
         *   ...
         * </span>
         *  */
        
        const traceline = $('<span class="plot-traceline">').appendTo(this._traces);
        $('<a href="#" class="plot-trace-rm">-</a>')
            .on("click", {thiz: this, row: traceline}, (e)=>{
                e.data.thiz.removetraceline(e.data.row);
            })
            .appendTo(traceline);
        $('<span class="plot-trace-option"><label class="plot-trace-selector-label">Name</label><input class="plot-trace-name"/></span>').appendTo(traceline);
        $('<span class="plot-trace-option"><label class="plot-trace-selector-label">Filter</label><input class="plot-trace-filter" placeholder="(None)"/></span>').appendTo(traceline);
        const groupby = $(`
        <span class="plot-trace-option">
            <label class="plot-trace-selector-label">Groupby</label>
            ${this._column_selector_html}
        </span>`).appendTo(traceline);
        groupby.find(".plot-trace-column")
            .removeClass("plot-trace-column")
            .addClass("plot-trace-groupby")
            .prop("multiple", "multiple");
        $('<option value="">(None)</option>').prependTo(groupby.find(".plot-trace-column"));

        $('<label class="plot-trace-selector-label">Type</label>').appendTo(traceline);
        const selector = $(PlotPanel._plottype_selector_html);
        selector.addClass("plot-trace-type-selector")
            .on("change", {thiz: this, row: traceline}, PlotPanel.onPlotTypeChanged)
            .appendTo(traceline);
        selector.trigger("change");
        traceline.find(".plot-trace-name").val("Trace " + this.tracecnt++);
        return traceline;
    }
    reset() {
        const thiz = this;
        this._traces.html("");
        this.tracecnt = 1;
        this.dialog.find("#plot_title").val("Result Plot");
        getCurrentSession().readLastResult(null, "columns").then((r) => {
            if (!r || !r.columns) {
                alert("No data");
                return;
            }
            let cols = [];
            r.columns.forEach((col) => {
                const v = col[0];
                cols.push(`<option value="${v}">${v}</option>`);
            })
            thiz._column_selector_html = '<select class="plot-trace-column"><option value="">-</option>' + cols.join("") + "</select>";
            thiz.addtraceline();
        });
    }
    render(tabView) {
        if (!this.container) return;
        this.tabView = tabView;
        this.reset();
        this.container.html("");
        this.dialog.appendTo(this.container);
        this.container.data("tabView").showTab(this.container.attr("id"));
        return this.dialog;
    }
    
    constructor() {
        if (PlotPanel.instance) {
            return PlotPanel.instance;
        }
        this.container = null;
        this._dialog = $(PlotPanel.dialog_html);
        this._traces = this._dialog.find(".plot-traces");
        this._dialog.find("#plot_plot").on("click", {thiz:this}, PlotPanel.onPlotClicked);
        this._dialog.find("#plot_reset").on("click", {thiz:this}, PlotPanel.onResetClicked);
        this._dialog.find("#plot_add_trace").on("click", {thiz:this}, PlotPanel.onAddTraceClicked);
        this._dialog.find("#plot_cancel").on("click", {thiz:this}, PlotPanel.onCancel);
        PlotPanel.instance = this;
    }
    get dialog() {
        return this._dialog;
    }
}

let types = [];
Object.keys(PlotPanel.plottype).forEach(v => {
    types.push(`<option value="${v}">${v}</option>`);
});
PlotPanel._plottype_selector_html = "<select>" + types.join() + "</select>";

const instance = new PlotPanel();
export default instance;