import { Parent, Split, Block, blockTypes } from "./BaseBlock.mjs";

blockTypes = Object.assign(blockTypes, {
    "skll.block.baseblock.Loop": {
        cls: Parent,
        childof: "skll.block.baseblock.Block",
    },
    "skll.block.input.Input": {
        cls: Block,
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
        childof: "skll.block.baseblock.Parent",
    },
    "skll.block.splitter.TypeSplit": {
        cls: Split,
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
        childof: "skll.block.sklwrapper.SklSplitter",
    },
    "skll.block.splitter.XyidSplit": {
        cls: Block,
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
        childof: "skll.block.sklwrapper.Method",
    },
    "skll.block.sklwrapper.SklSplitter": {
        cls: Parent,
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
        }
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