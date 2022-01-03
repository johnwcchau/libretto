import { Parent, Block, BlockTypes } from "./BaseBlock.mjs";

new BlockTypes().add({
    // "skll.block.baseblock.Split": {
    //     cls: Split,
    //     typename: "Column Split",
    //     childof: "skll.block.baseblock.Block",
    //     properties: {
    //         // "splits": {
    //         //     desc: "Splits",
    //         //     type: "list(text)",
    //         //     enabled: true,
    //         // },
    //     },
    //     split_type: "column"
    // },
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
        },
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
                enabled: true,
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
            onRendered: (thiz) => {
                if (!thiz.filename) return;
                thiz.$div.find("span.title").html(`${thiz.name} (${thiz.filename})`);
            }
        },
    },
    // "skll.block.input.Drop": {
    //     cls: Block,
    //     typename: "Column Drop",
    //     desc: "Column Drop",
    //     childof: "skll.block.baseblock.Block",
    //     properties: {
    //         "cols": {
    //             desc: "Columns to drop",
    //             type: "list(column)",
    //             enabled: true,
    //         }
    //     },
    // },
    "skll.block.imputer.ConstantImputer": {
        cls: Block,
        typename: "Constant Imputer",
        desc: "Data imputation with any constant",
        childof: "skll.block.baseblock.Block",
        properties: {
            "value": {
                desc: "Value for NA",
                type: "text",
                enabled: true,
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
                enabled: true,
            },
            "groupby": {
                desc: "column name to group-by before applying method",
                type: "list(column)",
                enabled: true,
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
                enabled: true,
            },
            "lamda": {
                desc: "lamda function",
                type: "text",
                enabled: true,
            }
        }
    },
    "skll.block.splitter.ColumnWise": {
        cls: Parent,
        typename: "Column Wise Operation",
        desc: "Transformation for each column",
        childof: "skll.block.baseblock.Parent",
    },
    // "skll.block.splitter.TypeSplit": {
    //     cls: Split,
    //     typename: "Type Split",
    //     desc: "Column splitting by data-type",
    //     childof: "skll.block.baseblock.Split",
    //     properties: {
    //         "convert_types": {
    //             desc: "normalize value type before splitting",
    //             type: "boolean",
    //             enabled: true,
    //         }
    //     },
    //     split_type: "datatype"
    // },
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
                enabled: true,
            },
            "idcol": {
                desc: "name of id column",
                type: "column",
                enabled: true,
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
                enabled: true,
            },
            "trainmethod": {
                desc: "method for train or autodetect",
                type: "text",
                enabled: true,
            },
            "testmethod": {
                desc: "method for test or autodetect",
                type: "text",
                enabled: true,
            },
            "scoremethod": {
                desc: "method for score or autodetect",
                type: "text",
                enabled: true,
            },
            "keepcolnames": {
                desc: "reapply column names to result",
                type: "boolean",
                enabled: true,
            },
            "initargs": {
                desc: "fixed positional init arguments",
                type: "list(text)",
                enabled: true,
            },
            "initkargs": {
                desc: "fixed named init arguments",
                type: "dict(text,text)",
                enabled: true,
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
                enabled: true,
            },
            "xname": {
                desc: "argument pos/name for x",
                type: "text",
                enabled: true,
            },
            "yname": {
                desc: "argument pos/name for y",
                type: "text",
                enabled: true,
            },
            "args": {
                desc: "fixed positional arguments",
                type: "list(text)",
                enabled: true,
            },
            "kargs": {
                desc: "fixed named arguments",
                type: "dict(text,text)",
                enabled: true,
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
                enabled: true,
            },
            "initargs": {
                desc: "fixed positional init arguments",
                type: "list(text)",
                enabled: true,
            },
            "initkargs": {
                desc: "fixed named init arguments",
                type: "dict(text,text)",
                enabled: true,
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
                enabled: true,
            },
            "multiple": {
                desc: "multiple estimators accepted",
                type: "boolean",
                enabled: true,
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