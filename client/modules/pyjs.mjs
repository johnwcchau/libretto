import { Parent, Block, BlockTypes } from "./BaseBlock.mjs";

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
        typename: "File Input",
        desc: "File input",
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
        desc: "Transformation for each column",
        childof: "skll.block.baseblock.Parent",
    },
    "skll.block.sklwrapper.RunModeSplit": {
        cls: Block,
        typename: "Train/Test Split",
        desc: "Dataset splitting by run mode",
        childof: "skll.block.sklwrapper.SklSplitter",
    },
    "skll.block.splitter.XyidSplit": {
        cls: Block,
        typename: "Extract Y/ID Column",
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
    "skll.block.sklwrapper.SklClass": {
        cls: Block,
        desc: "Sklearn transformer or estimator class",
        childof: "skll.block.baseblock.Block",
        properties: {
            "cls": {
                desc: "class name",
                type: "text",
            },
            "trainmethod": {
                desc: "method for train or autodetect",
                type: "text",
            },
            "testmethod": {
                desc: "method for test or autodetect",
                type: "text",
            },
            "scoremethod": {
                desc: "method for score or autodetect",
                type: "text",
            },
            "keepcolnames": {
                desc: "reapply column names to result",
                type: "boolean",
            },
            "initargs": {
                desc: "fixed positional init arguments",
                type: "list(text)",
            },
            "initkargs": {
                desc: "fixed named init arguments",
                type: "dict(text,text)",
            }
        }
    },
    "skll.block.sklwrapper.Method": {
        cls: Block,
        desc: "Any python method applying 1-to-1 transformations",
        childof: "skll.block.baseblock.Block",
        properties: {
            "method": {
                desc: "method name",
                type: "text",
            },
            "xname": {
                desc: "argument pos/name for x",
                type: "text",
            },
            "yname": {
                desc: "argument pos/name for y",
                type: "text",
            },
            "args": {
                desc: "fixed positional arguments",
                type: "list(text)",
            },
            "kargs": {
                desc: "fixed named arguments",
                type: "dict(text,text)",
            }
        }
    },
    "skll.block.sklwrapper.SklScoringMethod": {
        cls: Block,
        desc: "Sklearn method outputting a scalar scores",
        childof: "skll.block.sklwrapper.Method",
    },
    "skll.block.sklwrapper.SklSplitter": {
        cls: Parent,
        desc: "Scoring splitters e.g. Kfold",
        childof: "skll.block.baseblock.Loop",
        properties: {
            "cls": {
                desc: "class name",
                type: "text",
            },
            "initargs": {
                desc: "fixed positional init arguments",
                type: "list(text)",
            },
            "initkargs": {
                desc: "fixed named init arguments",
                type: "dict(text,text)",
            }
        }
    },
    "skll.block.sklwrapper.SklWrappingClass": {
        cls: Parent,
        desc: "Ensemble estimators or Hyper-parameter search class",
        childof: "skll.block.sklwrapper.SklClass",
        properties: {
            "estname": {
                desc: "argument pos/name for estimators",
                type: "text",
            },
            "multiple": {
                desc: "multiple estimators accepted",
                type: "boolean",
            },
        },
        split_type: "none",
        child_types: [
            "skll.block.sklwrapper.SklClass",
            "skll.block.sklwrapper.SklPipeline",
        ]
    },
});

export default function pyimport(py) {
    if (!py) return;
    const blockTypes = new BlockTypes();
    const type = py._type;
    const cls = blockTypes.get(type).cls;
    if (!cls) throw `Unknown type for ${py._type}`;
    if (py._children) {
        let children = [];
        Object.entries(py._children).forEach(([i, v]) => {
            children[i] = pyimport(v);
        });
        py["children"] = children;
        delete py._children;
    }
    return new cls(py);
}