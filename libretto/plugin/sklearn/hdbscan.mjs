const hdbscan = {
    "hdbscan.HDBSCAN": {
        "cls": "Block",
        "typename": "HDBSCAN",
        "desc": "Perform HDBSCAN clustering from vector array or distance matrix.  HDBSCAN - Hierarchical Density-Based Spatial Clustering of Applications with Noise. Performs DBSCAN over varying epsilon values and integrates the result to find a clustering that gives the best stability over epsilon. This allows HDBSCAN to find clusters of varying densities (unlike DBSCAN), and be more robust to parameter selection.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "hdbscan",
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
            "min_cluster_size": {
                "type": "number",
                "desc": "The minimum size of clusters; single linkage splits that containfewer points than this will be considered points \"falling out\" of acluster rather than a cluster splitting into two new clusters.",
                "default": "5",
                "dictKeyOf": "initkargs"
            },
            "min_samples": {
                "type": "number",
                "desc": "The number of samples in a neighbourhood for a point to beconsidered a core point.",
                "default": "None)",
                "dictKeyOf": "initkargs"
            },
            "metric": {
                "type": "string",
                "desc": "The metric to use when calculating distance between instances in afeature array. If metric is a string or callable, it must be one ofthe options allowed by metrics.pairwise.pairwise_distances for itsmetric parameter.If metric is \"precomputed\", X is assumed to be a distance matrix andmust be square.",
                "default": "euclidean",
                "dictKeyOf": "initkargs"
            },
            "p": {
                "type": "number",
                "desc": "p value to use if using the minkowski metric.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "alpha": {
                "type": "number",
                "desc": "A distance scaling parameter as used in robust single linkage.See [3]_ for more information.cluster_selection_epsilon: float, optional (default=0.0)A distance threshold. Clusters below this value will be merged.See [5]_ for more information.",
                "default": "1.0",
                "dictKeyOf": "initkargs"
            },
            "algorithm": {
                "type": "string",
                "desc": "Exactly which algorithm to use; hdbscan has variants specialisedfor different characteristics of the data. By default this is setto ``best`` which chooses the \"best\" algorithm given the nature ofthe data. You can force other options if you believe you knowbetter. Options are:* ``best``* ``generic``* ``prims_kdtree``* ``prims_balltree``* ``boruvka_kdtree``* ``boruvka_balltree``leaf_size: int, optional (default=40)If using a space tree algorithm (kdtree, or balltree) the numberof points ina leaf node of the tree. This does not alter theresulting clustering, but may have an effect on the runtimeof the algorithm.",
                "default": "best",
                "dictKeyOf": "initkargs"
            },
            "memory": {
                "type": "Instance of joblib.Memory or string (optional)",
                "desc": "Used to cache the output of the computation of the tree.By default, no caching is done. If a string is given, it is thepath to the caching directory.",
                "dictKeyOf": "initkargs"
            },
            "approx_min_span_tree": {
                "type": "boolean",
                "desc": "Whether to accept an only approximate minimum spanning tree.For some algorithms this can provide a significant speedup, butthe resulting clustering may be of marginally lower quality.If you are willing to sacrifice speed for correctness you may wantto explore this; in general this should be left at the default True.gen_min_span_tree: bool, optional (default=False)Whether to generate the minimum spanning tree with regardto mutual reachability distance for later analysis.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "core_dist_n_jobs": {
                "type": "number",
                "desc": "Number of parallel jobs to run in core distance computations (ifsupported by the specific algorithm). For ``core_dist_n_jobs``below -1, (n_cpus + 1 + core_dist_n_jobs) are used.",
                "default": "4",
                "dictKeyOf": "initkargs"
            },
            "cluster_selection_method": {
                "type": "string",
                "desc": "The method used to select clusters from the condensed tree. Thestandard approach for HDBSCAN* is to use an Excess of Mass algorithmto find the most persistent clusters. Alternatively you can insteadselect the clusters at the leaves of the tree -- this provides themost fine grained and homogeneous clusters. Options are:* ``eom``* ``leaf``",
                "default": "eom",
                "dictKeyOf": "initkargs"
            },
            "allow_single_cluster": {
                "type": "boolean",
                "desc": "By default HDBSCAN* will not produce a single cluster, setting thisto True will override this and allow single cluster results inthe case that you feel this is a valid result for your dataset.",
                "default": "False",
                "dictKeyOf": "initkargs"
            },
            "prediction_data": {
                "type": "boolean",
                "desc": "Whether to generate extra cached data for predicting labels ormembership vectors few new unseen points later. If you wish topersist the clustering object for later re-use you probably wantto set this to True.(default False)",
                "dictKeyOf": "initkargs"
            },
            "match_reference_implementation": {
                "type": "boolean",
                "desc": "There exist some interpretational differences between thisHDBSCAN* implementation and the original authors referenceimplementation in Java. This can result in very minor differencesin clustering results. Setting this flag to True will, at a someperformance cost, ensure that the clustering results match thereference implementation.**kwargs : optionalArguments passed to the distance metric",
                "default": "False",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "hdbscan.HDBSCAN",
            "trainmethod": "fit",
            "testmethod": "fit",
        }
    },
    "hdbscan.RobustSingleLinkage": {
        "cls": "Block",
        "typename": "RobustSingleLinkage",
        "desc": "Perform robust single linkage clustering from a vector array or distance matrix.  Robust single linkage is a modified version of single linkage that attempts to be more robust to noise. Specifically the goal is to more accurately approximate the level set tree of the unknown probability density function from which the sample data has been drawn.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "hdbscan",
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
            "X": {
                "type": "array or sparse (CSR) matrix of shape (n_samples, n_features), or \\",
                "desc": "array of shape (n_samples, n_samples)A feature array, or array of distances between samples if``metric='precomputed'``.",
                "dictKeyOf": "initkargs"
            },
            "cut": {
                "type": "number",
                "desc": "The reachability distance value to cut the cluster heirarchy atto derive a flat cluster labelling.",
                "dictKeyOf": "initkargs"
            },
            "k": {
                "type": "number",
                "desc": "Reachability distances will be computed with regard to the `k`nearest neighbors.",
                "default": "5)",
                "dictKeyOf": "initkargs"
            },
            "alpha": {
                "type": "number",
                "desc": "Distance scaling for reachability distance computation. Reachabilitydistance is computed as$max \\{ core_k(a), core_k(b), 1/\\alpha d(a,b) \\}$.",
                "default": "np.sqrt(2)",
                "dictKeyOf": "initkargs"
            },
            "gamma": {
                "type": "number",
                "desc": "Ignore any clusters in the flat clustering with size less than gamma,and declare points in such clusters as noise points.",
                "default": "5",
                "dictKeyOf": "initkargs"
            },
            "metric": {
                "type": "string",
                "desc": "The metric to use when calculating distance between instances in afeature array. If metric is a string or callable, it must be one ofthe options allowed by metrics.pairwise.pairwise_distances for itsmetric parameter.If metric is \"precomputed\", X is assumed to be a distance matrix andmust be square.",
                "default": "euclidean",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict",
                "desc": "Keyword parameter arguments for calling the metric (for examplethe p values if using the minkowski metric).",
                "default": "{}",
                "dictKeyOf": "initkargs"
            },
            "algorithm": {
                "type": "string",
                "desc": "Exactly which algorithm to use; hdbscan has variants specialisedfor different characteristics of the data. By default this is setto ``best`` which chooses the \"best\" algorithm given the nature ofthe data. You can force other options if you believe you knowbetter. Options are:* ``small``* ``small_kdtree``* ``large_kdtree``* ``large_kdtree_fastcluster``",
                "default": "best",
                "dictKeyOf": "initkargs"
            },
            "core_dist_n_jobs": {
                "type": "number",
                "desc": "Number of parallel jobs to run in core distance computations (ifsupported by the specific algorithm). For ``core_dist_n_jobs``below -1, (n_cpus + 1 + core_dist_n_jobs) are used.(default 4)",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "hdbscan.RobustSingleLinkage",
            "trainmethod": "fit",
            "testmethod": "fit",
        }
    },
};
export default hdbscan;