export class TableDialog {

    #withScorePane() {
        this._panel = $(`
    <div class="tabView">
        <ul>
            <li><a href="#datatable_wrapper">Data</a></li>
            <li><a href="#scoretable_wrapper">Scores</a></li>
        </ul>
    </div>`).appendTo(this._dialog);
    }
    #scoreTable(scores) {
        $('<table id="scoretable" class="score-table">').appendTo(this._panel).dataTable({
            data: scores,
            columns: [{
                title: "name",
                data: 0,
            }, {
                title: "score",
                data: 1,
            }],
        });
    }
    #dataTable(data) {
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
        $('<table id="datatable" class="data-table">').appendTo(this._panel).dataTable({
            data: data,
            columns: columns,
        });
    }
    render(data, scores) {
        this._dialog.html("");
        this._panel = this._dialog;
        if (scores && scores.length > 0) {
            this.#withScorePane();
        }
        this.#dataTable(data);
        if (scores && scores.length > 0) {
            this.#scoreTable(scores);
            this._panel.tabs();
        }
        return this._dialog;
    }
    constructor() {
        const thiz = this;
        if (TableDialog.instance) {
            return TableDialog.instance;
        }

        this._dialog = $('<dialog id="table_dialog" class="modal table-dialog">');
        this._panel = this._dialog;

        TableDialog.instance = this;
    }

    get dialog() {
        return this._dialog;
    }
}

const instance = new TableDialog();
Object.seal(instance);
export default instance;