import getCurrentSession, { Session } from "./Session.mjs";
import PlotPanel from "./PlotPanel.mjs";

export class Toolbar {
    constructor() {
        this._toolbar = $('<ul id="toolbar">');
    }
    get panel() {
        return this._toolbar;
    }
    addbtn(spec) {
        const $li = $("<li>").appendTo(this._toolbar);
        const $a = $('<a href="#">').appendTo($li);
        if (spec.icon) $(`<img src="${spec.icon}" title="${spec.title}">`).appendTo($a);
        else if (spec.title) $a.html(spec.title);
        if (spec.click) $a.on("click", spec.click);
    }
    addObj($obj) {
        const $li = $('<li class="no-border">').appendTo(this._toolbar);
        $obj.appendTo($li);
    }
}

class MainToolbar extends Toolbar{
    
    init() {
        this.addObj($('<img src="/static/img/libretto.svg" style="height:32px">'));
        this.addObj($("<h3>Libretto Editor</h3>"));
        this.addbtn({
            title: "New model",
            icon: "/static/img/clear_black_24dp.svg",
            click: () => {
                getCurrentSession().reset();
            },
        });
        this.addbtn({
            title: "Read from runtime",
            icon: "/static/img/cloud_download_black_24dp.svg",
            click: () => {
                getCurrentSession().load();
            },
        });
        this.addbtn({
            title: "Upload to runtime",
            icon: "/static/img/cloud_upload_black_24dp.svg",
            click: () => {
                getCurrentSession().dump();
            }
        });
        this.addbtn({
            title: "Save",
            icon: "/static/img/save_black_24dp.svg",
            click: () => {
                getCurrentSession().save();
            }
        })
        this.addbtn({
            title: "Save local",
            icon: "/static/img/file_download_black_24dp.svg",
            click: () => {
                getCurrentSession().saveLocal();
            }
        });
        this.addObj($(`
            <select id="runmode">
                <option value="PREVIEW">Preview</option>
                <option value="TRAIN">Train</option>
                <option value="TEST">Test</option>
                <option value="RUN">Run</option>
            </select>
        `));
        this.addbtn({
            title: "Run",
            icon: "/static/img/play_arrow_black_24dp.svg",
            click: () => {
                const runMode = $("#runmode").val();
                const Session = getCurrentSession();
                Session.run(runMode, null, "table").then(r=>{
                    if (!r) return;
                    const data = r.data;
                    const variables = r.variables;
                    if (!data || !data.length) {
                        alert("No results")
                        return;
                    }
                    Session.tabView.addDataTable(`${Session.model.name}_${runMode}`, data, r.warning);
                    if (variables && Object.keys(variables).length) Session.tabView.addVariablesTable(`${Session.model.name}_Score`, variables);
                });
            }
        });
        
        this.addbtn({
            title: "Plot",
            icon: "/static/img/show_chart_black_24dp.svg",
            click: () => {
                PlotPanel.render(getCurrentSession().tabView);
            }
        })
        this.addbtn({
            title: "Filter",
            icon: "/static/img/table_rows_black_24dp.svg",
            click: () => {
                const query = prompt("Query string?", "");
                if (query === null) return;
                const Session = getCurrentSession();
                Session.readLastResult(query, "table").then(r=>{
                    if (!r) return;
                    const data = r.data;
                    if (!data || !data.length) {
                        alert("No results")
                        return;
                    }
                    Session.tabView.addDataTable(`${query}`, data, r.warning);
                })
            }
        })
        this.addbtn({
            title: "Publish",
            icon: "/static/img/local_shipping_black_24dp.svg",
            click: () => {
                getCurrentSession().publish();
            }
        });
        
        return this;
    }
    constructor() {
        if (MainToolbar.instance) {
            return MainToolbar.instance;
        }
        super();
        MainToolbar.instance = this;
    }
}
const instance = new MainToolbar();
Object.seal(instance);
export default instance;
