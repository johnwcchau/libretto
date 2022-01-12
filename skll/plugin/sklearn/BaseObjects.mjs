const baseObjects = {
    "skll.plugin.sklearn.block.RunModeSplit": {
        cls: "Block",
        typename: "RunModeSplit",
        group: "sklearn.(generics)",
        typename: "Train/Test Split",
        desc: "Dataset splitting by run mode",
        childof: "skll.plugin.sklearn.block.SklSplitter",
    },
    "skll.plugin.sklearn.block.SklClass": {
        cls: "Block",
        typename: "SklClass",
        group: "sklearn.(generics)",
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
    "skll.plugin.sklearn.block.Method": {
        cls: "Block",
        typename: "Method",
        group: "sklearn.(generics)",
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
    "skll.plugin.sklearn.block.SklScoringMethod": {
        cls: "Block",
        typename: "SklScoringMethod",
        group: "sklearn.(generics)",
        desc: "Sklearn method outputting a scalar scores",
        childof: "skll.plugin.sklearn.block.Method",
    },
    "skll.plugin.sklearn.block.SklSplitter": {
        cls: "Parent",
        typename: "SklSplitter",
        group: "sklearn.(generics)",
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
    "skll.plugin.sklearn.block.SklWrappingClass": {
        cls: "Parent",
        typename: "SklWrappingClass",
        group: "sklearn.(generics)",
        desc: "Ensemble estimators or Hyper-parameter search class",
        childof: "skll.plugin.sklearn.block.SklClass",
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
            "skll.plugin.sklearn.block.SklClass",
            "skll.plugin.sklearn.block.SklPipeline",
        ]
    },
};

export default baseObjects;