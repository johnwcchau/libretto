import { Parent, Block, BlockTypes } from "./BaseBlock.mjs";
import Log from "./Log.mjs";

new BlockTypes().add({
    "skll.block.baseblock.Parent": {
        cls: Parent,
        typename: "Group",
        desc: "Group of blocks",
        childof: "skll.block.baseblock.Block",
        properties: {
        },
    },
    "skll.block.baseblock.Drop": {
        cls: Block,
        typename: "Drop",
        group: "tablular data operations",
        desc: "Remove columns",
        childof: "skll.block.baseblock.Block",
        properties: {
            as_new_columns: { hidden: true },
        },
        defaults: {
            as_new_columns: false,
        }
    },
    "skll.block.baseblock.Loop": {
        cls: Parent,
        hidden: true,
        childof: "skll.block.baseblock.Block",
    },
    "skll.block.input.FileInput": {
        cls: Block,
        typename: "Tablular Input",
        group: "inputs",
        desc: "Tablular data input from a file",
        childof: "skll.block.baseblock.Block",
        properties: {
            "filename": {
                desc: "Name of input file",
                type: "file",
            }
        },
        events: {
            onFileDropped: (thiz, src, type) => {
                const filename = src.filename;
                const ext = filename.split(".").pop();
                switch (ext) {
                    case "csv":
                    case "xls":
                    case "xlsx":
                        thiz.filename = filename;
                        break;
                    default:
                        alert(`Unsupported file type ${ext}`);
                }
                thiz.render();
            },
            onRender: (thiz) => {
                thiz.createDomElement();
                if (!thiz.filename) return;
                thiz.$div.find("span.title").html(`${thiz.name} (${thiz.filename})`);
            }
        },
    },
    "skll.block.imputer.ConstantImputer": {
        cls: Block,
        typename: "Constant Imputer",
        group: "tablular data operations",
        desc: "Data imputation with any constant",
        childof: "skll.block.baseblock.Block",
        properties: {
            "value": {
                desc: "Value for NA",
                type: "text",
            }
        }
    },
    "skll.block.imputer.MethodImputer": {
        cls: Block,
        typename: "Method Imputer",
        group: "tablular data operations",
        desc: "Data imputation with python method, with optionally group-by column",
        childof: "skll.block.baseblock.Block",
        properties: {
            "method": {
                desc: "method to get value",
                type: "text",
            },
            "groupby": {
                desc: "column name to group-by before applying method",
                type: "list(column)",
            }
        }
    },
    "skll.block.imputer.Eval": {
        cls: Block,
        typename: "Lambda Function",
        group: "tablular data operations",
        desc: "Column generation with eval(X, x)",
        childof: "skll.block.baseblock.Block",
        properties: {
            "colname": {
                desc: "column to add/replace",
                type: "text",
            },
            "lamda": {
                desc: "lamda function",
                type: "text",
            }
        }
    },
    "skll.block.splitter.ColumnWise": {
        cls: Parent,
        typename: "Column Wise Operation",
        group: "tablular data operations",
        desc: "Transformation for each column",
        childof: "skll.block.baseblock.Parent",
    },
    "skll.block.splitter.XyidSplit": {
        cls: Block,
        typename: "Extract Y/ID Column",
        group: "tablular data operations",
        desc: "Specifying column for Y and/or Id",
        childof: "skll.block.baseblock.Block",
        properties: {
            "ycol": {
                desc: "name of y column",
                type: "column",
            },
            "idcol": {
                desc: "name of id column",
                type: "column",
            }
        }
    },
});

export default function pyimport(py) {
    if (!py) return;
    try {
        const blockTypes = new BlockTypes();
        const type = py._jstype;
        const blktype = blockTypes.get(type);
        if (!blktype) throw `Unknown type ${type}`;
        const cls = blktype.cls;
        if (!cls) throw `Unknown type ${type}`;
        if (py._children) {
            let children = [];
            Object.entries(py._children).forEach(([i, v]) => {
                children[i] = pyimport(v);
            });
            py["children"] = children;
            delete py._children;
        }
        return new cls(py);
    } catch (ex) {
        Log.err(ex);
    }
}