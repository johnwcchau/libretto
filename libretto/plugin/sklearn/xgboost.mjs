const xgboost={
    "xgboost.XGBModel": {
        "cls": "Block",
        "typename": "XGBModel",
        "desc": "Implementation of the Scikit-Learn API for XGBoost.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "xgboost",
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
            "n_estimators": {
                "type": "number",
                "desc": "Number of gradient boosted trees. Equivalent to number of boostingrounds.",
                "dictKeyOf": "initkargs"
            },
            "max_depth": {
                "type": "number",
                "desc": "Maximum tree depth for base learners.",
                "dictKeyOf": "initkargs"
            },
            "learning_rate": {
                "type": "number",
                "desc": "Boosting learning rate (xgb's \"eta\")",
                "dictKeyOf": "initkargs"
            },
            "verbosity": {
                "type": "number",
                "desc": "The degree of verbosity. Valid values are 0 (silent) - 3 (debug).",
                "dictKeyOf": "initkargs"
            },
            "objective": {
                "type": "typing.Union[str, typing.Callable[[numpy.ndarray, numpy.ndarray], typing.Tuple[numpy.ndarray, numpy.ndarray]], NoneType]",
                "desc": "Specify the learning task and the corresponding learning objective ora custom objective function to be used (see note below).booster: stringSpecify which booster to use: gbtree, gblinear or dart.tree_method: stringSpecify which tree method to use. Default to auto. If this parameteris set to default, XGBoost will choose the most conservative optionavailable. It's recommended to study this option from the parametersdocument: https://xgboost.readthedocs.io/en/latest/treemethod.html.",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "Number of parallel threads used to run xgboost. When used with other Scikit-Learnalgorithms like grid search, you may choose which algorithm to parallelize andbalance the threads. Creating thread contention will significantly slow down bothalgorithms.",
                "dictKeyOf": "initkargs"
            },
            "gamma": {
                "type": "number",
                "desc": "Minimum loss reduction required to make a further partition on a leafnode of the tree.",
                "dictKeyOf": "initkargs"
            },
            "min_child_weight": {
                "type": "number",
                "desc": "Minimum sum of instance weight(hessian) needed in a child.",
                "dictKeyOf": "initkargs"
            },
            "max_delta_step": {
                "type": "number",
                "desc": "Maximum delta step we allow each tree's weight estimation to be.",
                "dictKeyOf": "initkargs"
            },
            "subsample": {
                "type": "number",
                "desc": "Subsample ratio of the training instance.",
                "dictKeyOf": "initkargs"
            },
            "colsample_bytree": {
                "type": "number",
                "desc": "Subsample ratio of columns when constructing each tree.",
                "dictKeyOf": "initkargs"
            },
            "colsample_bylevel": {
                "type": "number",
                "desc": "Subsample ratio of columns for each level.",
                "dictKeyOf": "initkargs"
            },
            "colsample_bynode": {
                "type": "number",
                "desc": "Subsample ratio of columns for each split.",
                "dictKeyOf": "initkargs"
            },
            "reg_alpha": {
                "type": "number",
                "desc": "L1 regularization term on weights (xgb's alpha).",
                "dictKeyOf": "initkargs"
            },
            "reg_lambda": {
                "type": "number",
                "desc": "L2 regularization term on weights (xgb's lambda).",
                "dictKeyOf": "initkargs"
            },
            "scale_pos_weight": {
                "type": "number",
                "desc": "Balancing of positive and negative weights.",
                "dictKeyOf": "initkargs"
            },
            "base_score": {
                "type": "number",
                "desc": "The initial prediction score of all instances, global bias.",
                "dictKeyOf": "initkargs"
            },
            "random_state": {
                "type": "number",
                "desc": "Random number seed... note::Using gblinear booster with shotgun updater is nondeterministic asit uses Hogwild algorithm.",
                "dictKeyOf": "initkargs"
            },
            "missing": {
                "type": "number",
                "desc": "Value in the data which needs to be present as a missing value.num_parallel_tree: numberUsed for boosting random forest.",
                "dictKeyOf": "initkargs"
            },
            "monotone_constraints": {
                "type": "Optional[Union[Dict[str, int], str]]",
                "desc": "Constraint of variable monotonicity. See tutorial for moreinformation.",
                "dictKeyOf": "initkargs"
            },
            "interaction_constraints": {
                "type": "Optional[Union[str, List[Tuple[str]]]]",
                "desc": "Constraints for interaction representing permitted interactions. Theconstraints must be specified in the form of a nest list, e.g. [[0, 1],[2, 3, 4]], where each inner list is a group of indices of featuresthat are allowed to interact with each other. See tutorial for moreinformationimportance_type: stringThe feature importance type for the feature_importances\\_ property:* For tree model, it's either \"gain\", \"weight\", \"cover\", \"total_gain\" or\"total_cover\".* For linear model, only \"weight\" is defined and it's the normalized coefficientswithout bias.",
                "dictKeyOf": "initkargs"
            },
            "gpu_id": {
                "type": "number",
                "desc": "Device ordinal.",
                "dictKeyOf": "initkargs"
            },
            "validate_parameters": {
                "type": "boolean",
                "desc": "Give warnings for unknown parameter.",
                "dictKeyOf": "initkargs"
            },
            "predictor": {
                "type": "string",
                "desc": "Force XGBoost to use specific predictor, available choices are [cpu_predictor,gpu_predictor].",
                "dictKeyOf": "initkargs"
            },
            "enable_categorical": {
                "type": "boolean",
                "desc": ".. versionadded:: 1.5.0Experimental support for categorical data. Do not set to true unless you areinterested in development. Only valid when `gpu_hist` and dataframe are used.",
                "dictKeyOf": "initkargs"
            },
            "kwargs": {
                "type": "dict, optional",
                "desc": "Keyword arguments for XGBoost Booster object. Full documentation ofparameters can be found here:https://github.com/dmlc/xgboost/blob/master/doc/parameter.rst.Attempting to set a parameter via the constructor args and \\*\\*kwargsdict simultaneously will result in a TypeError... note:: \\*\\*kwargs unsupported by scikit-learn\\*\\*kwargs is unsupported by scikit-learn. We do not guaranteethat parameters passed via this argument will interact properlywith scikit-learn... note:: Custom objective functionA custom objective function can be provided for the ``objective``parameter. In this case, it should have the signature``objective(y_true, y_pred) -> grad, hess``:y_true: array_like of shape [n_samples]The target valuesy_pred: array_like of shape [n_samples]The predicted valuesgrad: array_like of shape [n_samples]The value of the gradient for each sample point.hess: array_like of shape [n_samples]",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "xgboost.XGBModel"
        }
    },
    "xgboost.XGBClassifier": {
        "cls": "Block",
        "typename": "XGBClassifier",
        "desc": "Implementation of the scikit-learn API for XGBoost classification.",
        "childof": "xgboost.XGBModel",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "xgboost",
        "defaults": {
            "cls": "xgboost.XGBClassifier"
        }
    },
    "xgboost.XGBRFClassifier": {
        "cls": "Block",
        "typename": "XGBRFClassifier",
        "desc": "scikit-learn API for XGBoost random forest classification.",
        "childof": "xgboost.XGBModel",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "xgboost",
        "defaults": {
            "cls": "xgboost.XGBRFClassifier"
        }
    },
    "xgboost.XGBRanker": {
        "cls": "Block",
        "typename": "XGBRanker",
        "desc": "Implementation of the Scikit-Learn API for XGBoost Ranking.",
        "childof": "xgboost.XGBModel",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "xgboost",
        "defaults": {
            "cls": "xgboost.XGBRanker"
        }
    },
    "xgboost.XGBRFRegressor": {
        "cls": "Block",
        "typename": "XGBRFRegressor",
        "desc": "scikit-learn API for XGBoost random forest regression.",
        "childof": "xgboost.XGBModel",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "xgboost",
        "defaults": {
            "cls": "xgboost.XGBRFRegressor"
        }
    },
    "xgboost.XGBRegressor": {
        "cls": "Block",
        "typename": "XGBRegressor",
        "desc": "Implementation of the scikit-learn API for XGBoost regression.",
        "childof": "xgboost.XGBModel",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "xgboost",
        "defaults": {
            "cls": "xgboost.XGBRegressor"
        }
    }
}
export default xgboost;