import { Parent, Split, Block, BlockTypes } from "./BaseBlock.mjs";

new BlockTypes().add({
    "skll.block.baseblock.Split": {
        cls: Split,
        typename: "Column Split",
        childof: "skll.block.baseblock.Block",
        properties: {
            // "splits": {
            //     desc: "Splits",
            //     type: "list(text)",
            //     enabled: true,
            // },
        },
        defaults: {
            "singlar": false,
        },
        split_type: "column"
    },
    "skll.block.baseblock.Parent": {
        cls: Parent,
        hidden: true,
        childof: "skll.block.baseblock.Block",
        properties: {
        },
        defaults: {
            "singlar": false,
        }
    },
    "skll.block.baseblock.Loop": {
        cls: Parent,
        hidden: true,
        childof: "skll.block.baseblock.Block",
        defaults: {
            "singlar": true,
        }
    },
    "skll.block.input.Input": {
        cls: Block,
        typename: "Input",
        desc: "Data input",
        childof: "skll.block.baseblock.Block",
        properties: {
            "url": {
                desc: "Input file url",
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
                        thiz.url = `file://${filename}`;
                        break;
                    default:
                        alert(`Unsupported file type ${ext}`);
                }
                thiz.render();
            },
            onRendered: (thiz) => {
                if (!thiz.url) return;
                let fname = thiz.url.replace("file://", "");
                thiz.$div.find("span.title").html(`${thiz.name} (${fname})`);
            }
        },
    },
    "skll.block.input.Drop": {
        cls: Block,
        typename: "Column Drop",
        desc: "Column Drop",
        childof: "skll.block.baseblock.Block",
        properties: {
            "cols": {
                desc: "Columns to drop",
                type: "list(column)",
                enabled: true,
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
        desc: "Column generation using apply with insecure eval",
        childof: "skll.block.baseblock.Block",
        properties: {
            "colname": {
                desc: "column to add/replace",
                type: "text",
                enabled: true,
            },
            "lamda": {
                desc: "lamda function with row input <x>",
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
    "skll.block.splitter.TypeSplit": {
        cls: Split,
        typename: "Type Split",
        desc: "Column splitting by data-type",
        childof: "skll.block.baseblock.Split",
        properties: {
            "convert_types": {
                desc: "normalize value type before splitting",
                type: "boolean",
                enabled: true,
            }
        },
        split_type: "datatype"
    },
    "skll.block.splitter.RunModeSplit": {
        cls: Block,
        typename: "Train/Test Split",
        desc: "Dataset splitting by run mode",
        childof: "skll.block.sklwrapper.SklSplitter",
    },
    "skll.block.splitter.XyidSplit": {
        cls: Block,
        typename: "X/Y/ID Split",
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
    "skll.block.sklwrapper.SklPipeline": {
        cls: Block,
        desc: "SKlearn Pipeline",
        childof: "skll.block.sklwrapper.SklClass",
        properties: {
            "cls": {
                desc: "class name",
                type: "text",
                default: "sklearn.pipeline.Pipeline",
                enabled: false,
            },
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
        desc: "Sklearn method outputing a scalar scores",
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
        cls: Split,
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
    let next = py;
    let root = [];
    const blockTypes = new BlockTypes();
    while (next) {
        const type = next._type;
        const cls = blockTypes.get(type).cls;
        if (!cls) throw `Unknown type for ${next._type}`;
        if (next._children) {
            let children = [];
            Object.entries(next._children).forEach(([i, v]) => {
                children[i-1] = pyimport(v); //python-side starts from 1
            });
            next["children"] = children;
            delete next._children;
        }
        const obj = new cls(next);
        root.push(obj);
        next = next._next;
    }
    return root;
}