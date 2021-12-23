export class TableDialog {

    render(dataset) {
        this._dialog.html("");
        //get columns from dataset
        //assume records orient from pd
        let columns = [];
        Object.keys(dataset[0]).forEach(v => {
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
        $('<table id="datatable" class="data-table">').appendTo(this._dialog).dataTable({
            data: dataset,
            columns: columns,
        });
        return this._dialog;
    }
    constructor() {
        const thiz = this;
        if (TableDialog.instance) {
            return TableDialog.instance;
        }

        this._dialog = $('<dialog id="table_dialog" class="modal table-dialog">');

        TableDialog.instance = this;
    }

    get dialog() {
        return this._dialog;
    }
}

const instance = new TableDialog();
Object.seal(instance);
export default instance;