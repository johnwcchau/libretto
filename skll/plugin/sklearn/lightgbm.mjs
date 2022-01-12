const lightgbm={
    "lightgbm.LGBMModel": {
        "cls": "Block",
        "typename": "LGBMModel",
        "desc": "Implementation of the scikit-learn API for LightGBM.",
        "childof": "skll.plugin.sklearn.block.SklClass",
        "pytype": "skll.plugin.sklearn.block.SklClass",
        "group": "lightgbm",
        "properties": {
            "initkargs": {
                "hidden": true
            },
            "initargs": {
                "hidden": true
            },
            "cls": {
                "hidden": true
            },
            "trainmethod": {
                "hidden": true
            },
            "testmethod": {
                "hidden": true
            },
            "scoremethod": {
                "hidden": true
            },
            "boosting_type": {
                "type": "option(gdbt, dart, goss, rf)",
                "desc": "'gbdt', traditional Gradient Boosting Decision Tree.'dart', Dropouts meet Multiple Additive Regression Trees.'goss', Gradient-based One-Side Sampling.'rf', Random Forest.",
                "default": "gdbt"
            },
            "num_leaves": {
                "type": "number",
                "desc": "Maximum tree leaves for base learners.",
                "default": "31"
            },
            "max_depth": {
                "type": "number",
                "desc": "Maximum tree depth for base learners, <=0 means no limit.",
                "dafault": "-1"
            },
            "learning_rate": {
                "type": "number",
                "desc": "Boosting learning rate.You can use ``callbacks`` parameter of ``fit`` method to shrink/adapt learning ratein training using ``reset_parameter`` callback.Note, that this will ignore the ``learning_rate`` argument in training.",
                "dafault": "0.1"
            },
            "n_estimators": {
                "type": "number",
                "desc": "Number of boosted trees to fit.",
                "dafault": "100"
            },
            "subsample_for_bin": {
                "type": "number",
                "desc": "Number of samples for constructing bins.",
                "dafault": "200000"
            },
            "objective": {
                "type": "option(regression,binary,multiclass,lambdarank)",
                "desc": "Specify the learning task and the corresponding learning objective ora custom objective function to be used (see note below).Default: 'regression' for LGBMRegressor, 'binary' or 'multiclass' for LGBMClassifier, 'lambdarank' for LGBMRanker."
            },
            "class_weight": {
                "type": "dict",
                "desc": "Weights associated with classes in the form ``{class_label: weight}``.Use this parameter only for multi-class classification task;for binary classification task you may use ``is_unbalance`` or ``scale_pos_weight`` parameters.Note, that the usage of all these parameters will result in poor estimates of the individual class probabilities.You may want to consider performing probability calibration(https://scikit-learn.org/stable/modules/calibration.html) of your model.The 'balanced' mode uses the values of y to automatically adjust weightsinversely proportional to class frequencies in the input data as ``n_samples / (n_classes * np.bincount(y))``.If None, all classes are supposed to have weight one.Note, that these weights will be multiplied with ``sample_weight`` (passed through the ``fit`` method)if ``sample_weight`` is specified."
            },
            "min_split_gain": {
                "type": "number",
                "desc": "Minimum loss reduction required to make a further partition on a leaf node of the tree.",
                "dafault": "0"
            },
            "min_child_weight": {
                "type": "number",
                "desc": "Minimum sum of instance weight (hessian) needed in a child (leaf).",
                "dafault": "1e-3"
            },
            "min_child_samples": {
                "type": "number",
                "desc": "Minimum number of data needed in a child (leaf).",
                "dafault": "20"
            },
            "subsample": {
                "type": "number",
                "desc": "Subsample ratio of the training instance.",
                "dafault": "1"
            },
            "subsample_freq": {
                "type": "number",
                "desc": "Frequency of subsample, <=0 means no enable.",
                "dafault": "0"
            },
            "colsample_bytree": {
                "type": "number",
                "desc": "Subsample ratio of columns when constructing each tree.",
                "dafault": "1"
            },
            "reg_alpha": {
                "type": "number",
                "desc": "L1 regularization term on weights.",
                "dafault": "0"
            },
            "reg_lambda": {
                "type": "number",
                "desc": "L2 regularization term on weights.",
                "dafault": "0"
            },
            "random_state": {
                "type": "int, RandomState object or None, optional (default=None)",
                "desc": "Random number seed.If int, this number is used to seed the C++ code.If RandomState object (numpy), a random integer is picked based on its state to seed the C++ code.If None, default seeds in C++ code are used."
            },
            "n_jobs": {
                "type": "number",
                "desc": "Number of parallel threads to use for training (can be changed at prediction time).",
                "dafault": "-1"
            },
            "importance_type": {
                "type": "option(split,gain)",
                "desc": "The type of feature importance to be filled into ``feature_importances_``.If 'split', result contains numbers of times the feature is used in a model.If 'gain', result contains total gains of splits which use the feature.**kwargsOther parameters for the model.Check http://lightgbm.readthedocs.io/en/latest/Parameters.html for more parameters... warning::\\*\\*kwargs is not supported in sklearn, it may cause unexpected issues.",
                "dafault": "split"
            }
        },
        "defaults": {
            "cls": "lightgbm.LGBMModel",
        }
    },
    "lightgbm.LGBMClassifier": {
        "cls": "Block",
        "typename": "LGBMClassifier",
        "desc": "LGBMClassifier",
        "childof": "lightgbm.LGBMModel",
        "pytype": "skll.plugin.sklearn.block.SklClass",
        "group": "lightgbm",
        "defaults": {
            "cls": "lightgbm.LGBMClassifier"
        }
    },
    "lightgbm.LGBMRegressor": {
        "cls": "Block",
        "typename": "LGBMRegressor",
        "desc": "LGBMRegressor",
        "childof": "lightgbm.LGBMModel",
        "pytype": "skll.plugin.sklearn.block.SklClass",
        "group": "lightgbm",
        "defaults": {
            "cls": "lightgbm.LGBMRegressor"
        }
    },
    "lightgbm.LGBMRanker": {
        "cls": "Block",
        "typename": "LGBMRanker",
        "desc": "LGBMRanker",
        "childof": "lightgbm.LGBMModel",
        "pytype": "skll.plugin.sklearn.block.SklClass",
        "group": "lightgbm",
        "defaults": {
            "cls": "lightgbm.LGBMClassifier"
        }
    }
}
export default lightgbm;