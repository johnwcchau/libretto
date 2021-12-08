import {Block} from './BaseBlock.mjs';
import wsClient from './WsClient.mjs';

export class DataFrame extends Block {

    constructor(kwargs) {
        kwargs = kwargs || {};
        kwargs.name = kwargs.name || "DataFrame";
        kwargs.type = "pandas.read_csv";
        super(kwargs);
        super.addProperties("filepath_or_buffer", "Filename", "text", false);
        super.addProperties("comment", "Comment line indicator", "text");
        super.addProperties("header", "Header Row Number", "text");
        super.addProperties("index_col", "Index column[s]", "text");
        super.addProperties("usecols", "Use column[s]", "text");
        super.addProperties("dtype", "Datatype for columns", "text");
        super.addProperties("skiprows", "Rows to skip", "text");
        super.addProperties("skipfooter", "Bottom rows to skip", "number");
    }
    static canHandleType(type) {
        return (type=="csv");
    }
    onFileDropped(file) {
        const name = file.name;
        new Promise((resolve, reject) => {
            wsClient.send("exist", {path: name}).then((r)=> {
                const exist = r.exist;
                if (!exist) {
                    return wsClient.upload(file);
                } else {
                    const v = confirm("File with same name already exists in server, overwrite?")
                    if (v) return wsClient.upload(file);
                    else resolve();
                }
            }).then(() => {
                resolve();
            })
        }).then(() => {
            this.filepath_or_buffer = file.name;
            this.onEditClicked();
        });
    }
}