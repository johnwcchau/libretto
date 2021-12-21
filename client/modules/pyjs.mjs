import { Parent, Split, Block, BlockTypes } from "./BaseBlock.mjs";

new BlockTypes().add({
    "skll.block.baseblock.Split": {
        cls: Split,
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
        child_types: [".parent"]
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
        desc: "Data input",
        childof: "skll.block.baseblock.Block",
        properties: {
            "url": {
                desc: "Input file url",
                type: "file",
                enabled: true,
            }
        }
    },
    "skll.block.imputer.ConstantImputer": {
        cls: Block,
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
                type: "text",
                enabled: true,
            }
        }
    },
    "skll.block.splitter.ColumnWise": {
        cls: Parent,
        desc: "Transformation for each column",
        childof: "skll.block.baseblock.Parent",
    },
    "skll.block.splitter.TypeSplit": {
        cls: Split,
        desc: "Column splitting by data-type",
        childof: "skll.block.baseblock.Split",
        properties: {
            "convert_types": {
                desc: "normalize value type before splitting",
                type: "boolean",
                enabled: true,
            }
        }
    },
    "skll.block.splitter.RunModeSplit": {
        cls: Block,
        desc: "Dataset splitting by run mode",
        childof: "skll.block.sklwrapper.SklSplitter",
    },
    "skll.block.splitter.XyidSplit": {
        cls: Block,
        desc: "Specifying column for Y and/or Id",
        childof: "skll.block.baseblock.Block",
        properties: {
            "ycol": {
                desc: "name of y column",
                type: "text",
                enabled: true,
            },
            "idcol": {
                desc: "name of id column",
                type: "text",
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
        child_types: [
            "skll.block.sklwrapper.SklClass",
            "skll.block.sklwrapper.SklPipeline",
        ]
    },
});

function pytojs(py, root) {
    next = py;
    while (next) {
        type = next._type;
        cls = blockTypes[type];
        if (!cls) throw `Unknown type for ${next._type}`;
        obj = cls(next, cls);
        root.append(obj);
        if (next._children) {
            next._children.forEach((v, i) => {
                obj.setchild(i, pytojs(v));
            });
        }
        next = next._next;
    }
}