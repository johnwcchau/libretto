import { Parent, Block, BlockTypes } from "/static/modules/BaseBlock.mjs";
new BlockTypes().add({
    "skll.plugin.sklearn.sklearn.RunModeSplit": {
        cls: Block,
        typename: "Train/Test Split",
        desc: "Dataset splitting by run mode",
        childof: "skll.plugin.sklearn.sklearn.SklSplitter",
    },
    "skll.plugin.sklearn.sklearn.SklClass": {
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
    "skll.plugin.sklearn.sklearn.Method": {
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
    "skll.plugin.sklearn.sklearn.SklScoringMethod": {
        cls: Block,
        desc: "Sklearn method outputting a scalar scores",
        childof: "skll.plugin.sklearn.sklearn.Method",
    },
    "skll.plugin.sklearn.sklearn.SklSplitter": {
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
    "skll.plugin.sklearn.sklearn.SklWrappingClass": {
        cls: Parent,
        desc: "Ensemble estimators or Hyper-parameter search class",
        childof: "skll.plugin.sklearn.sklearn.SklClass",
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
            "skll.plugin.sklearn.sklearn.SklClass",
            "skll.plugin.sklearn.sklearn.SklPipeline",
        ]
    },
});

export default null;