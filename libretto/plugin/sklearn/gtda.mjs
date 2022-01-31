const gtda={
    "gtda.curves.Derivative": {
        "cls": "Block",
        "typename": "Derivative",
        "desc": "Derivatives of multi-channel curves.  A multi-channel (integer sampled) curve is a 2D array of shape ``(n_channels, n_bins)``, where each row represents the y-values in one of the channels. This transformer computes the n-th order derivative of each channel in each multi-channel curve in a collection, by discrete differences. The output is another collection of multi-channel curves.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.curves",
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
            "order": {
                "type": "number",
                "desc": "Order of the derivative to be taken.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.curves.Derivative"
        }
    },
    "gtda.curves.StandardFeatures": {
        "cls": "Block",
        "typename": "StandardFeatures",
        "desc": "Standard features from multi-channel curves.  A multi-channel (integer sampled) curve is a 2D array of shape ``(n_channels, n_bins)``, where each row represents the y-values in one of the channels. This transformer applies scalar or vector-valued functions channel-wise to extract features from each multi-channel curve in a collection. The output is always a 2D array such that row ``i`` is the concatenation of the outputs of the chosen functions on the channels in the ``i``-th (multi-)curve in the collection.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.curves",
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
            "function": {
                "type": "string",
                "desc": "Function or list/tuple of functions to apply to each channel of eachmulti-channel curve. Functions can map to scalars or to 1D arrays. If astring (see below) or a callable, then the same function is applied toall channels. Otherwise, `function` is a list/tuple of the same lengthas the number of entries along axis 1 in the collection passed to:meth:`fit`. Lists/tuples may contain allowed strings (see below),callables, and ``None`` in some positions to indicate that no featureshould be extracted from the corresponding channel. Available stringsare ``\"identity\"``, ``\"argmin\"``, ``\"argmax\"``, ``\"min\"``, ``\"max\"``,``\"mean\"``, ``\"std\"``, ``\"median\"`` and ``\"average\"``.",
                "default": "max",
                "dictKeyOf": "initkargs"
            },
            "function_params": {
                "type": "dict, None, list or tuple, optional, default: ``None``",
                "desc": "Additional keyword arguments for the function or functions in`function`. Passing ``None`` is equivalent to passing no arguments.Otherwise, if `function` is a single string or callable then`function_params` must be a dictionary. For functions encoded byallowed strings, the dictionary keys are as follows:- If ``function == \"average\"``, the only key is ``\"weights\"``(np.ndarray or None, default: ``None``).- Otherwise, there are no allowed keys.If `function` is a list or tuple, `function_params` must be a list ortuple of dictionaries (or ``None``) as above, of the same length as`function`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors. Ignored if `function` is one of the allowed string options.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.curves.StandardFeatures"
        }
    },
    "gtda.diagrams.Amplitude": {
        "cls": "Block",
        "typename": "Amplitude",
        "desc": ":ref:`Amplitudes <vectorization_amplitude_and_kernel>` of persistence diagrams.  For each persistence diagram in a collection, a vector of amplitudes or a single scalar amplitude is calculated according to the following steps:      1. The diagram is partitioned into subdiagrams according to homology        dimension.     2. The amplitude of each subdiagram is calculated according to the        parameters `metric` and `metric_params`. This gives a vector of        amplitudes, :math:`\\mathbf{a} = (a_{q_1}, \\ldots, a_{q_n})` where        the :math:`q_i` range over the available homology dimensions.     3. The final result is either :math:`\\mathbf{a}` itself or a norm of        :math:`\\mathbf{a}`, specified by the parameter `order`.  **Important notes**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.     - The shape of outputs of :meth:`transform` depends on the value of the       `order` parameter.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "metric": {
                "type": "``'bottleneck'`` | ``'wasserstein'`` | ``'betti'`` |         ``'landscape'`` | ``'silhouette'`` | ``'heat'`` |         ``'persistence_image'``, optional, default: ``'landscape'``",
                "desc": "Distance or dissimilarity function used to define the amplitude of asubdiagram as its distance from the (trivial) diagonal diagram:- ``'bottleneck'`` and ``'wasserstein'`` refer to the identically namedperfect-matching--based notions of distance.- ``'betti'`` refers to the :math:`L^p` distance between Betti curves.- ``'landscape'`` refers to the :math:`L^p` distance betweenpersistence landscapes.- ``'silhouette'`` refers to the :math:`L^p` distance betweensilhouettes.- ``'heat'`` refers to the :math:`L^p` distance betweenGaussian-smoothed diagrams.- ``'persistence_image'`` refers to the :math:`L^p` distance betweenGaussian-smoothed diagrams represented on birth-persistence axes.",
                "default": "'landscape'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict or None, optional, default: ``None``",
                "desc": "Additional keyword arguments for the metric function (passing ``None``is equivalent to passing the defaults described below):- If ``metric == 'bottleneck'`` there are no available arguments.- If ``metric == 'wasserstein'`` the only argument is `p` (float,default: ``2.``).- If ``metric == 'betti'`` the available arguments are `p` (float,default: ``2.``) and `n_bins` (int, default: ``100``).- If ``metric == 'landscape'`` the available arguments are `p` (float,default: ``2.``), `n_bins` (int, default: ``100``) and `n_layers`(int, default: ``1``).- If ``metric == 'silhouette'`` the available arguments are `p` (float,default: ``2.``), `power` (float, default: ``1.``) and `n_bins` (int,default: ``100``).- If ``metric == 'heat'`` the available arguments are `p` (float,default: ``2.``), `sigma` (float, default: ``0.1``) and `n_bins`(int, default: ``100``).- If ``metric == 'persistence_image'`` the available arguments are `p`(float, default: ``2.``), `sigma` (float, default: ``0.1``), `n_bins`(int, default: ``100``) and `weight_function` (callable or None,default: ``None``).",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "order": {
                "type": "number",
                "desc": "If ``None``, :meth:`transform` returns for each diagram a vector ofamplitudes corresponding to the dimensions in:attr:`homology_dimensions_`. Otherwise, the :math:`p`-norm of thesevectors with :math:`p` equal to `order` is taken.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.Amplitude"
        }
    },
    "gtda.diagrams.BettiCurve": {
        "cls": "Block",
        "typename": "BettiCurve",
        "desc": ":ref:`Betti curves <betti_curve>` of persistence diagrams.  Given a persistence diagram consisting of birth-death-dimension triples [b, d, q], subdiagrams corresponding to distinct homology dimensions are considered separately, and their respective Betti curves are obtained by evenly sampling the :ref:`filtration parameter <filtered_complex>`.  **Important note**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "n_bins": {
                "type": "number",
                "desc": "The number of filtration parameter values, per available homologydimension, to sample during :meth:`fit`.",
                "default": "100",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.BettiCurve"
        }
    },
    "gtda.diagrams.ComplexPolynomial": {
        "cls": "Block",
        "typename": "ComplexPolynomial",
        "desc": "Coefficients of complex polynomials whose roots are obtained from points in persistence diagrams.  Given a persistence diagram consisting of birth-death-dimension triples [b, d, q], subdiagrams corresponding to distinct homology dimensions are first considered separately. For each subdiagram, the polynomial whose roots are complex numbers obtained from its birth-death pairs is computed, and its :attr:`n_coefficients_` highest-degree complex coefficients excluding the top one are stored into a single real vector by concatenating the vector of all real parts with the vector of all imaginary parts [1]_ (if not enough coefficients are available to form a vector of the required length, padding with zeros is performed). Finally, all such vectors coming from different subdiagrams are concatenated to yield a single vector for the diagram.  There are three possibilities for mapping birth-death pairs :math:`(b, d)` to complex polynomial roots. They are:  .. math::    :nowrap:     \\begin{gather*}    R(b, d) = b + \\mathrm{i} d, \\\\    S(b, d) = \\frac{d - b}{\\sqrt{2} r} (b + \\mathrm{i} d), \\\\    T(b, d) = \\frac{d - b}{2} [\\cos{r} - \\sin{r} +        \\mathrm{i}(\\cos{r} + \\sin{r})],    \\end{gather*}  where :math:`r = \\sqrt{b^2 + d^2}`.  **Important note**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "polynomial_type": {
                "type": "``'R'`` | ``'S'`` | ``'T'``, optional, default: ``'R'``",
                "desc": "Type of complex polynomial to compute.",
                "default": "'R'",
                "dictKeyOf": "initkargs"
            },
            "n_coefficients": {
                "type": "list, int or None, optional, default: ``10``",
                "desc": "Number of complex coefficients per homology dimension. If an int thenthe number of coefficients will be equal to that value for eachhomology dimension. If ``None`` then, for each homology dimension inthe collection of persistence diagrams seen in :meth:`fit`, the numberof complex coefficients is defined to be the largest number ofoff-diagonal points seen among all subdiagrams in that homologydimension, minus one.",
                "default": "10",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.ComplexPolynomial"
        }
    },
    "gtda.diagrams.Filtering": {
        "cls": "Block",
        "typename": "Filtering",
        "desc": "Filtering of persistence diagrams.  Filtering a diagram means discarding all points [b, d, q] representing non-trivial topological features whose lifetime d - b is less than or equal to a cutoff value. Points on the diagonal (i.e. for which b and d are equal) may still appear in the output for padding purposes, but carry no information.  **Important note**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "homology_dimensions": {
                "type": "list, tuple, or None, optional, default: ``None``",
                "desc": "When set to ``None``, subdiagrams corresponding to all homologydimensions seen in :meth:`fit` will be filtered. Otherwise, it containsthe homology dimensions (as non-negative integers) at which filteringshould occur.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "epsilon": {
                "type": "number",
                "desc": "The cutoff value controlling the amount of filtering.",
                "default": "0.01",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.Filtering"
        }
    },
    "gtda.diagrams.HeatKernel": {
        "cls": "Block",
        "typename": "HeatKernel",
        "desc": "Convolution of persistence diagrams with a Gaussian kernel.  Based on ideas in [1]_. Given a persistence diagram consisting of birth-death-dimension triples [b, d, q], subdiagrams corresponding to distinct homology dimensions are considered separately and regarded as sums of Dirac deltas. Then, the convolution with a Gaussian kernel is computed over a rectangular grid of locations evenly sampled from appropriate ranges of the :ref:`filtration parameter <filtered_complex>`. The same is done with the reflected images of the subdiagrams about the diagonal, and the difference between the results of the two convolutions is computed. The result can be thought of as a (multi-channel) raster image.  **Important note**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "sigma": {
                "type": "number",
                "desc": "Standard deviation for Gaussian kernel.",
                "dictKeyOf": "initkargs"
            },
            "n_bins": {
                "type": "number",
                "desc": "The number of filtration parameter values, per available homologydimension, to sample during :meth:`fit`.",
                "default": "100",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.HeatKernel"
        }
    },
    "gtda.diagrams.NumberOfPoints": {
        "cls": "Block",
        "typename": "NumberOfPoints",
        "desc": "Number of off-diagonal points in persistence diagrams, per homology dimension.  Given a persistence diagram consisting of birth-death-dimension triples [b, d, q], subdiagrams corresponding to distinct homology dimensions are considered separately, and their respective numbers of off-diagonal points are calculated.  **Important note**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.NumberOfPoints"
        }
    },
    "gtda.diagrams.PairwiseDistance": {
        "cls": "Block",
        "typename": "PairwiseDistance",
        "desc": ":ref:`Distances <wasserstein_and_bottleneck_distance>` between pairs of persistence diagrams.  Given two collections of persistence diagrams consisting of birth-death-dimension triples [b, d, q], a collection of distance matrices or a single distance matrix between pairs of diagrams is calculated according to the following steps:      1. All diagrams are partitioned into subdiagrams corresponding to        distinct homology dimensions.     2. Pairwise distances between subdiagrams of equal homology        dimension are calculated according to the parameters `metric` and        `metric_params`. This gives a collection of distance matrices,        :math:`\\mathbf{D} = (D_{q_1}, \\ldots, D_{q_n})`.     3. The final result is either :math:`\\mathbf{D}` itself as a        three-dimensional array, or a single distance matrix constructed        by taking norms of the vectors of distances between diagram pairs.  **Important notes**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.     - The shape of outputs of :meth:`transform` depends on the value of the       `order` parameter.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "metric": {
                "type": "``'bottleneck'`` | ``'wasserstein'`` | ``'betti'`` |         ``'landscape'`` | ``'silhouette'`` | ``'heat'`` |         ``'persistence_image'``, optional, default: ``'landscape'``",
                "desc": "Distance or dissimilarity function between subdiagrams:- ``'bottleneck'`` and ``'wasserstein'`` refer to the identically namedperfect-matching--based notions of distance.- ``'betti'`` refers to the :math:`L^p` distance between Betti curves.- ``'landscape'`` refers to the :math:`L^p` distance betweenpersistence landscapes.- ``'silhouette'`` refers to the :math:`L^p` distance betweensilhouettes.- ``'heat'`` refers to the :math:`L^p` distance betweenGaussian-smoothed diagrams.- ``'persistence_image'`` refers to the :math:`L^p` distance betweenGaussian-smoothed diagrams represented on birth-persistence axes.",
                "default": "'landscape'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict or None, optional, default: ``None``",
                "desc": "Additional keyword arguments for the metric function (passing``None`` is equivalent to passing the defaults described below):- If ``metric == 'bottleneck'`` the only argument is `delta` (float,default: ``0.01``). When equal to ``0.``, an exact algorithm is used;otherwise, a faster approximate algorithm is used and symmetry is notguaranteed.- If ``metric == 'wasserstein'`` the available arguments are `p`(float, default: ``2.``) and `delta` (float, default: ``0.01``).Unlike the case of ``'bottleneck'``, `delta` cannot be set to ``0.``and an exact algorithm is not available.- If ``metric == 'betti'`` the available arguments are `p` (float,default: ``2.``) and `n_bins` (int, default: ``100``).- If ``metric == 'landscape'`` the available arguments are `p` (float,default: ``2.``), `n_bins` (int, default: ``100``) and `n_layers`(int, default: ``1``).- If ``metric == 'silhouette'`` the available arguments are `p` (float,default: ``2.``), `power` (float, default: ``1.``) and `n_bins` (int,default: ``100``).- If ``metric == 'heat'`` the available arguments are `p` (float,default: ``2.``), `sigma` (float, default: ``0.1``) and `n_bins`(int, default: ``100``).- If ``metric == 'persistence_image'`` the available arguments are `p`(float, default: ``2.``), `sigma` (float, default: ``0.1``), `n_bins`(int, default: ``100``) and `weight_function` (callable or None,default: ``None``).",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "order": {
                "type": "number",
                "desc": "If ``None``, :meth:`transform` returns for each pair of diagrams avector of distances corresponding to the dimensions in:attr:`homology_dimensions_`. Otherwise, the :math:`p`-norm ofthese vectors with :math:`p` equal to `order` is taken.",
                "default": "2.",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.PairwiseDistance"
        }
    },
    "gtda.diagrams.PersistenceEntropy": {
        "cls": "Block",
        "typename": "PersistenceEntropy",
        "desc": ":ref:`Persistence entropies <persistence_entropy>` of persistence diagrams.  Given a persistence diagram consisting of birth-death-dimension triples [b, d, q], subdiagrams corresponding to distinct homology dimensions are considered separately, and their respective persistence entropies are calculated as the (base 2) Shannon entropies of the collections of differences d - b (\"lifetimes\"), normalized by the sum of all such differences. Optionally, these entropies can be normalized according to a simple heuristic, see `normalize`.  **Important notes**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.     - By default, persistence subdiagrams containing only triples with zero       lifetime will have corresponding (normalized) entropies computed as       ``numpy.nan``. To avoid this, set a value of `nan_fill_value`       different from ``None``.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "normalize": {
                "type": "boolean",
                "desc": "When ``True``, the persistence entropy of each diagram is normalized bythe logarithm of the sum of lifetimes of all points in the diagram.Can aid comparison between diagrams in an input collection when thesehave different numbers of (non-trivial) points. [1]_",
                "default": "False",
                "dictKeyOf": "initkargs"
            },
            "nan_fill_value": {
                "type": "number",
                "desc": "If a float, (normalized) persistence entropies initially computed as``numpy.nan`` are replaced with this value. If ``None``, these valuesare left as ``numpy.nan``.",
                "default": "-1.",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.PersistenceEntropy"
        }
    },
    "gtda.diagrams.PersistenceImage": {
        "cls": "Block",
        "typename": "PersistenceImage",
        "desc": ":ref:`Persistence images <TODO>` of persistence diagrams.  Based on ideas in [1]_. Given a persistence diagram consisting of birth-death-dimension triples [b, d, q], the equivalent diagrams of birth-persistence-dimension [b, d-b, q] triples are computed and subdiagrams corresponding to distinct homology dimensions are considered separately and regarded as sums of Dirac deltas. Then, the convolution with a Gaussian kernel is computed over a rectangular grid of locations evenly sampled from appropriate ranges of the :ref:`filtration parameter <filtered_complex>`. The result can be thought of as a (multi-channel) raster image.  **Important note**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "sigma": {
                "type": "number",
                "desc": "Standard deviation for Gaussian kernel.",
                "dictKeyOf": "initkargs"
            },
            "n_bins": {
                "type": "number",
                "desc": "The number of filtration parameter values, per available homologydimension, to sample during :meth:`fit`.",
                "default": "100",
                "dictKeyOf": "initkargs"
            },
            "weight_function": {
                "type": "callable or None, default: ``None``",
                "desc": "Function mapping the 1D array of sampled persistence values (see:attr:`samplings_`) to a 1D array of weights. ``None`` is equivalent topassing ``numpy.ones_like``. More weight can be given to regions ofhigh persistence by passing a monotonic function, e.g. the identity.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.PersistenceImage"
        }
    },
    "gtda.diagrams.PersistenceLandscape": {
        "cls": "Block",
        "typename": "PersistenceLandscape",
        "desc": ":ref:`Persistence landscapes <persistence_landscape>` of persistence diagrams.  Given a persistence diagram consisting of birth-death-dimension triples [b, d, q], subdiagrams corresponding to distinct homology dimensions are considered separately, and layers of their respective persistence landscapes are obtained by evenly sampling the :ref:`filtration parameter <filtered_complex>`.  **Important note**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "n_layers": {
                "type": "number",
                "desc": "How many layers to consider in the persistence landscape.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "n_bins": {
                "type": "number",
                "desc": "The number of filtration parameter values, per availablehomology dimension, to sample during :meth:`fit`.",
                "default": "100",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.PersistenceLandscape"
        }
    },
    "gtda.diagrams.Scaler": {
        "cls": "Block",
        "typename": "Scaler",
        "desc": "Linear scaling of persistence diagrams.  A positive scale factor :attr:`scale_` is calculated during :meth:`fit` by considering all available persistence diagrams partitioned according to homology dimensions. During :meth:`transform`, all birth-death pairs are divided by :attr:`scale_`.  The value of :attr:`scale_` depends on two things:      - A way of computing, for each homology dimension, the :ref:`amplitude       <vectorization_amplitude_and_kernel>` in that dimension of a       persistence diagram consisting of birth-death-dimension triples       [b, d, q]. Together, `metric` and `metric_params` define this in the       same way as in :class:`Amplitude`.     - A scalar-valued function which is applied to the resulting       two-dimensional array of amplitudes (one per diagram and homology       dimension) to obtain :attr:`scale_`.  **Important note**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "metric": {
                "type": "``'bottleneck'`` | ``'wasserstein'`` | ``'betti'`` |         ``'landscape'`` |``'silhouette'`` |  ``'heat'`` |         ``'persistence_image'``, optional, default: ``'bottleneck'``",
                "desc": "See the corresponding parameter in :class:`Amplitude`.",
                "default": "'bottleneck'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict or None, optional, default: ``None``",
                "desc": "See the corresponding parameter in :class:`Amplitude`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "function": {
                "type": "callable, optional, default: ``numpy.max``",
                "desc": "Function used to extract a positive scalar from the collection ofamplitude vectors in :meth:`fit`. Must map 2D arrays to scalars.",
                "default": "numpy.max",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.Scaler"
        }
    },
    "gtda.diagrams.Silhouette": {
        "cls": "Block",
        "typename": "Silhouette",
        "desc": ":ref:`Power-weighted silhouettes <weighted_silhouette>` of persistence diagrams.  Based on ideas in [1]_. Given a persistence diagram consisting of birth-death-dimension triples [b, d, q], subdiagrams corresponding to distinct homology dimensions are considered separately, and their respective silhouettes are obtained by sampling the silhouette function over evenly spaced locations from appropriate ranges of the :ref:`filtration parameter <filtered_complex>`.  **Important note**:      - Input collections of persistence diagrams for this transformer must       satisfy certain requirements, see e.g. :meth:`fit`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.diagrams",
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
            "n_bins": {
                "type": "number",
                "desc": "The number of filtration parameter values, per available homologydimension, to sample during :meth:`fit`.",
                "default": "100",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.diagrams.Silhouette"
        }
    },
    "gtda.graphs.GraphGeodesicDistance": {
        "cls": "Block",
        "typename": "GraphGeodesicDistance",
        "desc": "Distance matrices arising from geodesic distances on graphs.  For each (possibly weighted and/or directed) graph in a collection, this transformer calculates the length of the shortest (directed or undirected) path between any two of its vertices, setting it to ``numpy.inf`` when two vertices cannot be connected by a path.  The graphs are represented by their adjacency matrices which can be dense arrays, sparse matrices or masked arrays. The following rules apply:  - In dense arrays of Boolean type, entries which are ``False`` represent   absent edges. - In dense arrays of integer or float type, zero entries represent edges   of length 0. Absent edges must be indicated by ``numpy.inf``. - In sparse matrices, non-stored values represent absent edges. Explicitly   stored zero or ``False`` edges represent edges of length 0.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.graphs",
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
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "directed": {
                "type": "boolean",
                "desc": "If ``True`` (default), then find the shortest path on a directed graph.If ``False``, then find the shortest path on an undirected graph.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "unweighted": {
                "type": "boolean",
                "desc": "If ``True``, then find unweighted distances. That is, rather thanfinding the path between each point such that the sum of weights isminimized, find the path such that the number of edges is minimized.",
                "default": "False",
                "dictKeyOf": "initkargs"
            },
            "method": {
                "type": "``'auto'`` | ``'FW'`` | ``'D'`` | ``'BF'`` | ``'J'``, optional,         default: ``'auto'``",
                "desc": "Algorithm to use for shortest paths. See the `scipy documentation     <https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.    csgraph.shortest_path.html>`_.",
                "default": "'auto'",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.graphs.GraphGeodesicDistance"
        }
    },
    "gtda.graphs.KNeighborsGraph": {
        "cls": "Block",
        "typename": "KNeighborsGraph",
        "desc": "Adjacency matrices of :math:`k`-nearest neighbor graphs.  Given a two-dimensional array of row vectors seen as points in high-dimensional space, the corresponding :math:`k`NN graph is a directed graph with a vertex for every vector in the array, and a directed edge from vertex :math:`i` to vertex :math:`j \\neq i` whenever vector :math:`j` is among the :math:`k` nearest neighbors of vector :math:`i`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.graphs",
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
            "n_neighbors": {
                "type": "number",
                "desc": "Number of neighbors to use. A point is not considered as its ownneighbour.",
                "default": "4",
                "dictKeyOf": "initkargs"
            },
            "mode": {
                "type": "``'connectivity'`` | ``'distance'``, optional,         default: ``'connectivity'``",
                "desc": "Type of returned matrices: ``'connectivity'`` will return the 0-1connectivity matrices, and ``'distance'`` will return the distancesbetween neighbors according to the given metric.",
                "default": "'connectivity'",
                "dictKeyOf": "initkargs"
            },
            "metric": {
                "type": "string",
                "desc": "The distance metric to use. See the documentation of:class:`sklearn.neighbors.DistanceMetric` for a list of availablemetrics. If set to ``'precomputed'``, input data is interpreted as acollection of distance matrices.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "p": {
                "type": "number",
                "desc": "Parameter for the Minkowski (i.e. :math:`\\ell^p`) metric from:func:`sklearn.metrics.pairwise.pairwise_distances`. Only relevantwhen `metric` is ``'minkowski'``. `p` = 1 is the Manhattan distance,and `p` = 2 reduces to the Euclidean distance.",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict or None, optional, default: ``None``",
                "desc": "Additional keyword arguments for the metric function.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.graphs.KNeighborsGraph"
        }
    },
    "gtda.graphs.TransitionGraph": {
        "cls": "Block",
        "typename": "TransitionGraph",
        "desc": "Undirected transition graphs from arrays of time-evolving states.  Let A be a two-dimensional array viewed as a time series (along the row axis) of one-dimensional arrays encoding the \"state\" of a system. The corresponding *undirected transition graph* (or *network*) has as vertex set the set of all unique states (rows) in A, and there is an edge between vertex i and vertex j≠i if and only if the state corresponding to vertex j immediately follows the one corresponding to vertex i, somewhere in A.  Given a collection of two-dimensional arrays, this transformer performs two tasks:      1. Optionally, it preprocesses the arrays by applying a function row by        row to them. This can be used e.g. as a \"compression\" step to reduce        the size of the state space.     2. It computes the transition graph of each array as a sparse matrix of        zeros and ones.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.graphs",
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
            "func": {
                "type": "None or callable, optional, default: ``numpy.argsort``",
                "desc": "If a callable, it is the function to be applied to each row of eacharray as a preprocessing step. Allowed callables are functions mapping1D arrays to 1D arrays of constant length, and must be compatible with:func:`numpy.apply_along_axis`. If ``None``, this function is theidentity (no preprocessing). The default is ``numpy.argsort``, whichmakes the final transition graphs *ordinal partition networks*[1]_ [2]_ [3]_.",
                "default": "numpy.argsort",
                "dictKeyOf": "initkargs"
            },
            "func_params": {
                "type": "None or dict, optional, default: ``None``",
                "desc": "Additional keyword arguments for `func`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.graphs.TransitionGraph"
        }
    },
    "gtda.homology.CubicalPersistence": {
        "cls": "Block",
        "typename": "CubicalPersistence",
        "desc": ":ref:`Persistence diagrams <persistence_diagram>` resulting from :ref:`filtered cubical complexes <cubical_complex>`.  Given a :ref:`greyscale image <cubical_chains_and_cubical_homology>`, information about the appearance and disappearance of topological features (technically, :ref:`homology classes <homology_and_cohomology>`) of various dimensions and at different scales is summarised in the corresponding persistence diagram.  **Important note**:     - Persistence diagrams produced by this class must be interpreted with       care due to the presence of padding triples which carry no       information. See :meth:`transform` for additional information.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.homology",
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
            "homology_dimensions": {
                "type": "list or tuple, optional, default: ``(0, 1)``",
                "desc": "Dimensions (non-negative integers) of the topological features to bedetected.",
                "dictKeyOf": "initkargs"
            },
            "coeff": {
                "type": "number",
                "desc": "Compute homology with coefficients in the prime field:math:`\\mathbb{F}_p = \\{ 0, \\ldots, p - 1 \\}` where :math:`p`equals `coeff`.",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "periodic_dimensions": {
                "type": "boolean",
                "desc": "Periodicity of the boundaries along each of the axes, where``n_dimensions`` is the dimension of the images of the collection. Theboolean in the `d`th position expresses whether the boundaries alongthe `d`th axis are periodic. The default ``None`` is equivalent topassing ``numpy.zeros((n_dimensions,), dtype=bool)``, i.e. none of theboundaries are periodic.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "infinity_values": {
                "type": "number",
                "desc": "Which death value to assign to features which are still alive atfiltration value ``numpy.inf``. ``None`` assigns the maximum pixelvalues within all images passed to :meth:`fit`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "reduced_homology": {
                "type": "boolean",
                "desc": "If ``True``, the earliest-born triple in homology dimension 0 which hasinfinite death is discarded from each diagram computed in:meth:`transform`.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.homology.CubicalPersistence"
        }
    },
    "gtda.homology.EuclideanCechPersistence": {
        "cls": "Block",
        "typename": "EuclideanCechPersistence",
        "desc": ":ref:`Persistence diagrams <persistence_diagram>` resulting from `Cech filtrations <cech_complex_and_cech_persistence>`_.  Given a :ref:`point cloud <distance_matrices_and_point_clouds>` in Euclidean space, information about the appearance and disappearance of topological features (technically, :ref:`homology classes <homology_and_cohomology>`) of various dimensions and at different scales is summarised in the corresponding persistence diagram.  **Important note**:      - Persistence diagrams produced by this class must be interpreted with       care due to the presence of padding triples which carry no       information. See :meth:`transform` for additional information.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.homology",
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
            "homology_dimensions": {
                "type": "list or tuple, optional, default: ``(0, 1)``",
                "desc": "Dimensions (non-negative integers) of the topological features to bedetected.",
                "dictKeyOf": "initkargs"
            },
            "coeff": {
                "type": "number",
                "desc": "Compute homology with coefficients in the prime field:math:`\\mathbb{F}_p = \\{ 0, \\ldots, p - 1 \\}` where :math:`p`equals `coeff`.",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "max_edge_length": {
                "type": "number",
                "desc": "Maximum value of the Cech filtration parameter. Topological features atscales larger than this value will not be detected.",
                "default": "numpy.inf",
                "dictKeyOf": "initkargs"
            },
            "infinity_values": {
                "type": "number",
                "desc": "Which death value to assign to features which are still alive atfiltration value `max_edge_length`. ``None`` means that this deathvalue is declared to be equal to `max_edge_length`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "reduced_homology": {
                "type": "boolean",
                "desc": "If ``True``, the earliest-born triple in homology dimension 0 which hasinfinite death is discarded in :meth:`transform`.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.homology.EuclideanCechPersistence"
        }
    },
    "gtda.homology.FlagserPersistence": {
        "cls": "Block",
        "typename": "FlagserPersistence",
        "desc": ":ref:`Persistence diagrams <persistence_diagram>` resulting from :ref:`filtrations <filtered_complex>` of :ref:`directed or undirected flag complexes <clique_and_flag_complexes>` [1]_.  Given a weighted directed or undirected graph, information about the appearance and disappearance of topological features (technically, :ref:`homology classes <homology_and_cohomology>`) of various dimension and at different scales is summarised in the corresponding persistence diagram.  **Important note**:      - Persistence diagrams produced by this class must be interpreted with       care due to the presence of padding triples which carry no       information. See :meth:`transform` for additional information.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.homology",
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
            "homology_dimensions": {
                "type": "list or tuple, optional, default: ``(0, 1)``",
                "desc": "Dimensions (non-negative integers) of the topological features to bedetected.",
                "dictKeyOf": "initkargs"
            },
            "directed": {
                "type": "boolean",
                "desc": "If ``True``, :meth:`transform` computes the persistence diagrams of thefiltered directed flag complexes arising from the input collection ofweighted directed graphs. If ``False``, :meth:`transform` computes thepersistence diagrams of the filtered undirected flag complexes obtainedby regarding all input weighted graphs as undirected, and:- if `max_edge_weight` is ``numpy.inf``, it is sufficient to pass acollection of (dense or sparse) upper-triangular matrices;- if `max_edge_weight` is finite, it is recommended to pass either acollection of symmetric dense matrices, or a collection of sparseupper-triangular matrices.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "filtration": {
                "type": "string",
                "desc": "Algorithm determining the filtration values of higher order simplicesfrom the weights of the vertices and edges. Possible values are:[\"dimension\", \"zero\", \"max\", \"max3\", \"max_plus_one\", \"product\", \"sum\",\"pmean\", \"pmoment\", \"remove_edges\", \"vertex_degree\"]",
                "default": "max",
                "dictKeyOf": "initkargs"
            },
            "coeff": {
                "type": "number",
                "desc": "Compute homology with coefficients in the prime field:math:`\\mathbb{F}_p = \\{ 0, \\ldots, p - 1 \\}` where :math:`p`equals `coeff`.",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "max_edge_weight": {
                "type": "number",
                "desc": "Maximum edge weight to be considered in the filtration. All edgeweights greater than this value will be considered as absent from thefiltration and topological features at scales larger than this valuewill not be detected.",
                "default": "numpy.inf",
                "dictKeyOf": "initkargs"
            },
            "infinity_values": {
                "type": "number",
                "desc": "Which death value to assign to features which are still alive atfiltration value `max_edge_weight`. ``None`` means that this deathvalue is declared to be equal to `max_edge_weight`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "reduced_homology": {
                "type": "boolean",
                "desc": "If ``True``, the earliest-born triple in homology dimension 0 which hasinfinite death is discarded from each diagram computed in:meth:`transform`.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "max_entries": {
                "type": "number",
                "desc": "Number controlling the degree of precision in the matrix reductionsperformed by the the backend. Corresponds to the parameter``approximation`` in :func:`pyflagser.flagser_weighted` and:func:`pyflagser.flagser_unweighted`. Increase for higher precision,decrease for faster computation. A good value is often ``100000`` inhard problems. A negative value computes highest possible precision.",
                "default": "-1",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.homology.FlagserPersistence"
        }
    },
    "gtda.homology.SparseRipsPersistence": {
        "cls": "Block",
        "typename": "SparseRipsPersistence",
        "desc": ":ref:`Persistence diagrams <persistence_diagram>` resulting from :ref:`Sparse Vietoris–Rips filtrations <vietoris-rips_complex_and_vietoris-rips_persistence>`.  Given a :ref:`point cloud <distance_matrices_and_point_clouds>` in Euclidean space, or an abstract :ref:`metric space <distance_matrices_and_point_clouds>` encoded by a distance matrix, information about the appearance and disappearance of topological features (technically, :ref:`homology classes <homology_and_cohomology>`) of various dimensions and at different scales is summarised in the corresponding persistence diagram.  **Important note**:      - Persistence diagrams produced by this class must be interpreted with       care due to the presence of padding triples which carry no       information. See :meth:`transform` for additional information.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.homology",
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
            "metric": {
                "type": "string",
                "desc": "If set to ``\"precomputed\"``, input data is to be interpreted as acollection of distance matrices. Otherwise, input data is to beinterpreted as a collection of point clouds (i.e. feature arrays), and`metric` determines a rule with which to calculate distances betweenpairs of instances (i.e. rows) in these arrays. If `metric` is astring, it must be one of the options allowed by:func:`scipy.spatial.distance.pdist` for its metric parameter, or ametric listed in :obj:`sklearn.pairwise.PAIRWISE_DISTANCE_FUNCTIONS`,including \"euclidean\", \"manhattan\", or \"cosine\". If `metric` is acallable, it is called on each pair of instances and the resultingvalue recorded. The callable should take two arrays from the entry in`X` as input, and return a value indicating the distance between them.",
                "default": "euclidean",
                "dictKeyOf": "initkargs"
            },
            "homology_dimensions": {
                "type": "list or tuple, optional, default: ``(0, 1)``",
                "desc": "Dimensions (non-negative integers) of the topological features to bedetected.",
                "dictKeyOf": "initkargs"
            },
            "coeff": {
                "type": "number",
                "desc": "Compute homology with coefficients in the prime field:math:`\\mathbb{F}_p = \\{ 0, \\ldots, p - 1 \\}` where :math:`p`equals `coeff`.",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "epsilon": {
                "type": "number",
                "desc": "Parameter controlling the approximation to the exact Vietoris–Ripsfiltration. If set to `0.`, :class:`SparseRipsPersistence` leads to thesame results as :class:`VietorisRipsPersistence` but is slower.",
                "default": "0.1",
                "dictKeyOf": "initkargs"
            },
            "max_edge_length": {
                "type": "number",
                "desc": "Maximum value of the Sparse Rips filtration parameter. Points whosedistance is greater than this value will never be connected by an edge,and topological features at scales larger than this value will not bedetected.",
                "default": "numpy.inf",
                "dictKeyOf": "initkargs"
            },
            "infinity_values": {
                "type": "number",
                "desc": "Which death value to assign to features which are still alive atfiltration value `max_edge_length`. ``None`` means that this deathvalue is declared to be equal to `max_edge_length`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "reduced_homology": {
                "type": "boolean",
                "desc": "If ``True``, the earliest-born triple in homology dimension 0 which hasinfinite death is discarded from each diagram computed in:meth:`transform`.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.homology.SparseRipsPersistence"
        }
    },
    "gtda.homology.VietorisRipsPersistence": {
        "cls": "Block",
        "typename": "VietorisRipsPersistence",
        "desc": ":ref:`Persistence diagrams <persistence_diagram>` resulting from :ref:`Vietoris–Rips filtrations <vietoris-rips_complex_and_vietoris-rips_persistence>`.  Given a :ref:`point cloud <distance_matrices_and_point_clouds>` in Euclidean space, an abstract :ref:`metric space <distance_matrices_and_point_clouds>` encoded by a distance matrix, or the adjacency matrix of a weighted undirected graph, information about the appearance and disappearance of topological features (technically, :ref:`homology classes <homology_and_cohomology>`) of various dimensions and at different scales is summarised in the corresponding persistence diagram.  **Important note**:      - Persistence diagrams produced by this class must be interpreted with       care due to the presence of padding triples which carry no       information. See :meth:`transform` for additional information.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.homology",
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
            "metric": {
                "type": "string",
                "desc": "If set to ``\"precomputed\"``, input data is to be interpreted as acollection of distance matrices or of adjacency matrices of weightedundirected graphs. Otherwise, input data is to be interpreted as acollection of point clouds (i.e. feature arrays), and `metric`determines a rule with which to calculate distances between pairs ofpoints (i.e. row vectors). If `metric` is a string, it must be one ofthe options allowed by :func:`scipy.spatial.distance.pdist` for itsmetric parameter, or a metric listed in:obj:`sklearn.pairwise.PAIRWISE_DISTANCE_FUNCTIONS`, including``\"euclidean\"``, ``\"manhattan\"`` or ``\"cosine\"``. If `metric` is acallable, it should take pairs of vectors (1D arrays) as input and, foreach two vectors in a pair, it should return a scalar indicating thedistance/dissimilarity between them.",
                "default": "euclidean",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict, optional, default: ``{}``",
                "desc": "Additional parameters to be passed to the distance function.",
                "default": "{}",
                "dictKeyOf": "initkargs"
            },
            "homology_dimensions": {
                "type": "list or tuple, optional, default: ``(0, 1)``",
                "desc": "Dimensions (non-negative integers) of the topological features to bedetected.",
                "dictKeyOf": "initkargs"
            },
            "coeff": {
                "type": "number",
                "desc": "Compute homology with coefficients in the prime field:math:`\\mathbb{F}_p = \\{ 0, \\ldots, p - 1 \\}` where :math:`p`equals `coeff`.",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "collapse_edges": {
                "type": "boolean",
                "desc": "Whether to run the edge collapse algorithm in [2]_ prior to thepersistent homology computation (see the Notes). Can reduce the runtimedramatically when the data or the maximum homology dimensions arelarge.",
                "default": "False",
                "dictKeyOf": "initkargs"
            },
            "max_edge_length": {
                "type": "number",
                "desc": "Maximum value of the Vietoris–Rips filtration parameter. Points whosedistance is greater than this value will never be connected by an edge,and topological features at scales larger than this value will not bedetected.",
                "default": "numpy.inf",
                "dictKeyOf": "initkargs"
            },
            "infinity_values": {
                "type": "number",
                "desc": "Which death value to assign to features which are still alive atfiltration value `max_edge_length`. ``None`` means that this deathvalue is declared to be equal to `max_edge_length`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "reduced_homology": {
                "type": "boolean",
                "desc": "If ``True``, the earliest-born triple in homology dimension 0 which hasinfinite death is discarded from each diagram computed in:meth:`transform`.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.homology.VietorisRipsPersistence"
        }
    },
    "gtda.homology.WeakAlphaPersistence": {
        "cls": "Block",
        "typename": "WeakAlphaPersistence",
        "desc": ":ref:`Persistence diagrams <persistence_diagram>` resulting from :ref:`weak alpha filtrations <TODO>`.  Given a :ref:`point cloud <distance_matrices_and_point_clouds>` in Euclidean space, information about the appearance and disappearance of topological features (technically, :ref:`homology classes <homology_and_cohomology>`) of various dimensions and at different scales is summarised in the corresponding persistence diagram.  The weak alpha filtration of a point cloud is defined to be the :ref:`Vietoris–Rips filtration <vietoris-rips_complex_and_vietoris-rips_persistence>` of the sparse matrix of Euclidean distances between neighbouring vertices in the Delaunay triangulation of the point cloud. In low dimensions, computing the persistent homology of this filtration can be much faster than computing Vietoris–Rips persistent homology via :class:`VietorisRipsPersistence`.  **Important note**:      - Persistence diagrams produced by this class must be interpreted with       care due to the presence of padding triples which carry no       information. See :meth:`transform` for additional information.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.homology",
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
            "homology_dimensions": {
                "type": "list or tuple, optional, default: ``(0, 1)``",
                "desc": "Dimensions (non-negative integers) of the topological features to bedetected.",
                "dictKeyOf": "initkargs"
            },
            "coeff": {
                "type": "number",
                "desc": "Compute homology with coefficients in the prime field:math:`\\mathbb{F}_p = \\{ 0, \\ldots, p - 1 \\}` where :math:`p`equals `coeff`.",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "max_edge_length": {
                "type": "number",
                "desc": "Maximum value of the Vietoris–Rips filtration parameter. Points whosedistance is greater than this value will never be connected by an edge,and topological features at scales larger than this value will not bedetected.",
                "default": "numpy.inf",
                "dictKeyOf": "initkargs"
            },
            "infinity_values": {
                "type": "number",
                "desc": "Which death value to assign to features which are still alive atfiltration value `max_edge_length`. ``None`` means that this deathvalue is declared to be equal to `max_edge_length`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "reduced_homology": {
                "type": "boolean",
                "desc": "If ``True``, the earliest-born triple in homology dimension 0 which hasinfinite death is discarded from each diagram computed in:meth:`transform`.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.homology.WeakAlphaPersistence"
        }
    },
    "gtda.homology.WeightedRipsPersistence": {
        "cls": "Block",
        "typename": "WeightedRipsPersistence",
        "desc": ":ref:`Persistence diagrams <persistence_diagram>` resulting from :ref:`weighted Vietoris–Rips filtrations <TODO>` as in [3]_.  Given a :ref:`point cloud <distance_matrices_and_point_clouds>` in Euclidean space, an abstract :ref:`metric space <distance_matrices_and_point_clouds>` encoded by a distance matrix, or the adjacency matrix of a weighted undirected graph, information about the appearance and disappearance of topological features (technically, :ref:`homology classes <homology_and_cohomology>`) of various dimensions and at different scales is summarised in the corresponding persistence diagram.  Weighted (Vietoris–)Rips filtrations can be useful to highlight topological features against outliers and noise. Among them, the distance-to-measure (DTM) filtration is particularly suited to point clouds due to several favourable properties. This implementation follows the general framework described in [3]_. The idea is that, starting from a way to compute vertex weights :math:`\\{w_i\\}_i` from an input point cloud/distance matrix/adjacency matrix, a modified adjacency matrix is determined whose diagonal entries are the :math:`\\{w_i\\}_i`, and whose edge weights are  .. math:: w_{ij} = \\begin{cases} \\max\\{ w_i, w_j \\} &\\text{if }    2\\mathrm{dist}_{ij} \\leq |w_i^p - w_j^p|^{\\frac{1}{p}}, \\\\    t &\\text{otherwise} \\end{cases}  where :math:`t` is the only positive root of  .. math:: 2 \\mathrm{dist}_{ij} = (t^p - w_i^p)^\\frac{1}{p} +    (t^p - w_j^p)^\\frac{1}{p}  and :math:`p` is a parameter (see `metric_params`). The modified adjacency matrices are then treated exactly as in :class:`VietorisRipsPersistence`.  **Important notes**:      - Vertex and edge weights are twice the ones in [3]_ so that the same       results as :class:`VietorisRipsPersistence` are obtained when all       vertex weights are zero.     - Persistence diagrams produced by this class must be interpreted with       care due to the presence of padding triples which carry no       information. See :meth:`transform` for additional information.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.homology",
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
            "metric": {
                "type": "string",
                "desc": "If set to ``\"precomputed\"``, input data is to be interpreted as acollection of distance matrices or of adjacency matrices of weightedundirected graphs. Otherwise, input data is to be interpreted as acollection of point clouds (i.e. feature arrays), and `metric`determines a rule with which to calculate distances between pairs ofpoints (i.e. row vectors). If `metric` is a string, it must be one ofthe options allowed by :func:`scipy.spatial.distance.pdist` for itsmetric parameter, or a metric listed in:obj:`sklearn.pairwise.PAIRWISE_DISTANCE_FUNCTIONS`, including``\"euclidean\"``, ``\"manhattan\"`` or ``\"cosine\"``. If `metric` is acallable, it should take pairs of vectors (1D arrays) as input and, foreach two vectors in a pair, it should return a scalar indicating thedistance/dissimilarity between them.",
                "default": "euclidean",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict, optional, default: ``{}``",
                "desc": "Additional parameters to be passed to the distance function.",
                "default": "{}",
                "dictKeyOf": "initkargs"
            },
            "homology_dimensions": {
                "type": "list or tuple, optional, default: ``(0, 1)``",
                "desc": "Dimensions (non-negative integers) of the topological features to bedetected.",
                "dictKeyOf": "initkargs"
            },
            "weights": {
                "type": "``\"DTM\"`` or callable, optional, default: ``\"DTM\"``",
                "desc": "Function that will be applied to each input point cloud/distancematrix/adjacency matrix to compute a 1D array of vertex weights for thethe modified adjacency matrices. The default ``\"DTM\"`` denotes theempirical distance-to-measure function defined, following [3]_, by.. math:: w(x) = 2\\left(\\frac{1}{n+1} \\sum_{k=1}^n\\mathrm{dist}(x, x_k)^r\\right)^{1/r}.Here, :math:`\\mathrm{dist}` is the distance metric used, :math:`x_k`is the :math:`k`-th :math:`\\mathrm{dist}`-nearest neighbour of:math:`x` (:math:`x` is not considered a neighbour of itself),:math:`n` is the number of nearest neighbors to include, and :math:`r`is a parameter (see `weight_params`). If a callable, it must returnnon-negative 1D arrays.",
                "default": "DTM",
                "dictKeyOf": "initkargs"
            },
            "weight_params": {
                "type": "dict, optional, default: ``{}``",
                "desc": "Additional parameters for the weighted filtration. ``\"p\"`` determinesthe power to be used in computing edge weights from vertex weights. Itcan be one of ``1``, ``2`` or ``np.inf`` and defaults to ``1``. If`weights` is ``\"DTM\"``, the additional keys ``\"r\"`` (default: ``2``)and ``\"n_neighbors\"`` (default: ``3``) are available (see `weights`,where the latter corresponds to :math:`n`).",
                "default": "{}",
                "dictKeyOf": "initkargs"
            },
            "coeff": {
                "type": "number",
                "desc": "Compute homology with coefficients in the prime field:math:`\\mathbb{F}_p = \\{ 0, \\ldots, p - 1 \\}` where :math:`p`equals `coeff`.",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "collapse_edges": {
                "type": "boolean",
                "desc": "Whether to run the edge collapse algorithm in [2]_ prior to thepersistent homology computation (see the Notes). Can reduce the runtimedramatically when the data or the maximum homology dimensions arelarge.",
                "default": "False",
                "dictKeyOf": "initkargs"
            },
            "max_edge_weight": {
                "type": "number",
                "desc": "Maximum value of the filtration parameter in the modified adjacencymatrix. Edges with weight greater than this value will be consideredabsent.",
                "default": "numpy.inf",
                "dictKeyOf": "initkargs"
            },
            "infinity_values": {
                "type": "number",
                "desc": "Which death value to assign to features which are still alive atfiltration value `max_edge_weight`. ``None`` means that this deathvalue is declared to be equal to `max_edge_weight`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "reduced_homology": {
                "type": "boolean",
                "desc": "If ``True``, the earliest-born triple in homology dimension 0 which hasinfinite death is discarded from each diagram computed in:meth:`transform`.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.homology.WeightedRipsPersistence"
        }
    },
    "gtda.images.Binarizer": {
        "cls": "Block",
        "typename": "Binarizer",
        "desc": "Binarize all 2D/3D greyscale images in a collection.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.images",
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
            "threshold": {
                "type": "number",
                "desc": "Fraction of the maximum pixel value `max_value_` from which tobinarize.",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.images.Binarizer"
        }
    },
    "gtda.images.DensityFiltration": {
        "cls": "Block",
        "typename": "DensityFiltration",
        "desc": "Filtrations of 2D/3D binary images based on the number of activated neighboring pixels.  The density filtration assigns to each pixel of a binary image a greyscale value equal to the number of activated pixels within a ball centered around it.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.images",
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
            "radius": {
                "type": "number",
                "desc": "The radius of the ball within which the number of activated pixels isconsidered.",
                "default": "1.",
                "dictKeyOf": "initkargs"
            },
            "metric": {
                "type": "string",
                "desc": "Determines a rule with which to calculate distances betweenpairs of pixels.If ``metric`` is a string, it must be one of the options allowed by``scipy.spatial.distance.pdist`` for its metric parameter, or a metriclisted in ``sklearn.pairwise.PAIRWISE_DISTANCE_FUNCTIONS``, including\"euclidean\", \"manhattan\", or \"cosine\".If ``metric`` is a callable function, it is called on each pair ofinstances and the resulting value recorded. The callable should taketwo arrays from the entry in `X` as input, and return a valueindicating the distance between them.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict, optional, default: ``{}``",
                "desc": "Additional keyword arguments for the metric function.",
                "default": "{}",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.images.DensityFiltration"
        }
    },
    "gtda.images.DilationFiltration": {
        "cls": "Block",
        "typename": "DilationFiltration",
        "desc": "Filtrations of 2D/3D binary images based on the dilation of activated regions.  Binary dilation is a morphological operator commonly used in image processing and relies on the `scipy.ndimage     <https://docs.scipy.org/doc/scipy/reference/ndimage.html>`_ module.  This filtration assigns to each pixel in an image a greyscale value calculated as follows. If the minimum Manhattan distance between the pixel and any activated pixel in the image is less than or equal to the parameter `n_iterations`, the assigned value is this distance – in particular, activated pixels are assigned a value of 0. Otherwise, the assigned greyscale value is the sum of the lengths along all axes of the image – equivalently, it is the maximum Manhattan distance between any two pixels in the image. The name of this filtration comes from the fact that these values can be computed by iteratively dilating activated regions, thickening them by a total amount `n_iterations`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.images",
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
            "n_iterations": {
                "type": "number",
                "desc": "Number of iterations in the dilation process. ``None`` means dilationreaches all deactivated pixels.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.images.DilationFiltration"
        }
    },
    "gtda.images.ErosionFiltration": {
        "cls": "Block",
        "typename": "ErosionFiltration",
        "desc": "Filtrations of 2D/3D binary images based on the erosion of activated regions.  Binary erosion is a morphological operator commonly used in image processing and relies on the `scipy.ndimage     <https://docs.scipy.org/doc/scipy/reference/ndimage.html>`_ module.  This filtration assigns to each pixel in an image a greyscale value calculated as follows. If the minimum Manhattan distance between the pixel and any deactivated pixel in the image is less than or equal to the parameter `n_iterations`, the assigned value is this distance – in particular, deactivated pixels are assigned a value of 0. Otherwise, the assigned greyscale value is the sum of the lengths along all axes of the image – equivalently, it is the maximum Manhattan distance between any two pixels in the image. The name of this filtration comes from the fact that these values can be computed by iteratively eroding activated regions, shrinking them by a total amount `n_iterations`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.images",
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
            "n_iterations": {
                "type": "number",
                "desc": "Number of iterations in the erosion process. ``None`` means erosionreaches all activated pixels.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.images.ErosionFiltration"
        }
    },
    "gtda.images.HeightFiltration": {
        "cls": "Block",
        "typename": "HeightFiltration",
        "desc": "Filtrations of 2D/3D binary images based on distances to lines/planes.  The height filtration assigns to each activated pixel of a binary image a greyscale value equal to the distance between the pixel and the hyperplane defined by a direction vector and the first seen edge of the image following that direction. Deactivated pixels are assigned the value of the maximum distance between any pixel of the image and the hyperplane, plus one.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.images",
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
            "direction": {
                "type": "ndarray of shape (n_dimensions,) or None, optional, default:         ``None``",
                "desc": "Direction vector of the height filtration in``n_dimensions``-dimensional space, where ``n_dimensions`` is thedimension of the images of the collection (2 or 3). ``None`` isequivalent to passing ``numpy.ones(n_dimensions)``.",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.images.HeightFiltration"
        }
    },
    "gtda.images.ImageToPointCloud": {
        "cls": "Block",
        "typename": "ImageToPointCloud",
        "desc": "Represent active pixels in 2D/3D binary images as points in 2D/3D space.  The coordinates of each point is calculated as follows. For each activated pixel, assign coordinates that are the pixel index on this image, after flipping the rows and then swapping between rows and columns.  This transformer is meant to transform a collection of images to a collection of point clouds so that persistent homology calculations can be performed.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.images",
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
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.images.ImageToPointCloud"
        }
    },
    "gtda.images.Inverter": {
        "cls": "Block",
        "typename": "Inverter",
        "desc": "Invert all 2D/3D images in a collection.  Applies an inversion function to the value of all pixels of all images in the input collection. If the images are binary, the inversion function is defined as the logical NOT function. Otherwise, it is the function :math:`f(x) = M - x`, where `x` is a pixel value and `M` is :attr:`max_value_`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.images",
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
            "max_value": {
                "type": "boolean",
                "desc": "Maximum possible pixel value in the images. It should be a boolean ifinput images are binary and an int or a float if they are greyscale.If ``None``, it is calculated from the collection of images passed in:meth:`fit`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.images.Inverter"
        }
    },
    "gtda.images.Padder": {
        "cls": "Block",
        "typename": "Padder",
        "desc": "Pad all 2D/3D images in a collection.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.images",
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
            "padding": {
                "type": "number",
                "desc": "Number of pixels to pad the images along each axis and on both side ofthe images. By default, a frame of a single pixel width is addedaround the image (``1 = padding_x = padding_y [= padding_z]``).",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "value": {
                "type": "boolean",
                "desc": "Value given to the padded pixels. It should be a boolean if the inputimages are binary and an int or float if they are greyscale.",
                "default": "0",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.images.Padder"
        }
    },
    "gtda.images.RadialFiltration": {
        "cls": "Block",
        "typename": "RadialFiltration",
        "desc": "Filtrations of 2D/3D binary images based on distances to a reference pixel.  The radial filtration assigns to each pixel of a binary image a greyscale value computed as follows in terms of a reference pixel, called the \"center\", and of a \"radius\": if the binary pixel is active and lies within a ball defined by this center and this radius, then the assigned value equals this distance. In all other cases, the assigned value equals the maximum distance between any pixel of the image and the center pixel, plus one.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.images",
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
            "center": {
                "type": "ndarray of shape (:attr:`n_dimensions_`,) or None, optional,        default: ``None``",
                "desc": "Coordinates of the center pixel, where ``n_dimensions`` is thedimension of the images of the collection (2 or 3). ``None`` isequivalent to passing ``np.zeros(n_dimensions,)```.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "radius": {
                "type": "number",
                "desc": "The radius of the ball centered in `center` inside which activatedpixels are included in the filtration.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "metric": {
                "type": "string",
                "desc": "If set to ``'precomputed'``, each entry in `X` along axis 0 isinterpreted to be a distance matrix. Otherwise, entries areinterpreted as feature arrays, and `metric` determines a rule withwhich to calculate distances between pairs of instances (i.e. rows)in these arrays.If `metric` is a string, it must be one of the options allowed by:func:`scipy.spatial.distance.pdist` for its metric parameter, or ametric listed in :obj:`sklearn.pairwise.PAIRWISE_DISTANCE_FUNCTIONS`,including \"euclidean\", \"manhattan\" or \"cosine\".If `metric` is a callable function, it is called on each pair ofinstances and the resulting value recorded. The callable should taketwo arrays from the entry in `X` as input, and return a valueindicating the distance between them.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict or None, optional, default: ``{}``",
                "desc": "Additional keyword arguments for the metric function.",
                "default": "{}",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.images.RadialFiltration"
        }
    },
    "gtda.images.SignedDistanceFiltration": {
        "cls": "Block",
        "typename": "SignedDistanceFiltration",
        "desc": "Filtrations of 2D/3D binary images based on the dilation and the erosion of activated regions.  This filtration assigns to each pixel in an image a greyscale value calculated as follows. For activated pixels, if the minimum Manhattan distance between the pixel and any deactivated pixel in the image is less than or equal to the parameter `n_iterations`, the assigned value is this distance minus 1. Otherwise, the assigned greyscale value is the sum of the lengths along all axes of the image – equivalently, it is the maximum Manhattan distance between any two pixels in the image, minus 1. For deactivated pixels, if the minimum Manhattan distance between the pixel and any activated pixel in the image is less than or equal to the parameter `n_iterations`, the assigned value is the opposite of this distance. Otherwise, the assigned greyscale value is the opposite of the maximum Manhattan distance between any two pixels in the image.  The name of this filtration comes from the fact that it is a a negatively signed dilation plus a positively signed erosion, minus 1 on the activated pixels. Therefore, pixels the activated pixels at the boundary of the activated regions always have a pixel value of 0.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.images",
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
            "n_iterations": {
                "type": "number",
                "desc": "Number of iterations in the dilation process. ``None`` means dilationover the full image.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.images.SignedDistanceFiltration"
        }
    },
    "gtda.mapper.CubicalCover": {
        "cls": "Block",
        "typename": "CubicalCover",
        "desc": "Cover of multi-dimensional data coming from overlapping hypercubes (technically, parallelopipeds) given by taking products of one-dimensional intervals.  In :meth:`fit`, :class:`OneDimensionalCover` objects are fitted independently on each column of the input array, according to the same parameters passed to the constructor. For example, if the :class:`CubicalCover` object is instantiated with ``kind='uniform'``, ``n_intervals=10`` and ``overlap_frac=0.1``, then each column of the input array is used to construct a cover of the real line by 10 equal-length intervals with fractional overlap of 0.1. Each element of the resulting multi-dimensional cover of Euclidean space is of the form :math:`I_{i, \\ldots, k} = I^{(0)}_i \\times \\cdots \\times I^{(d-1)}_k` where :math:`d` is the number of columns in the input array, and :math:`I^{(l)}_j` is the :math:`j`th cover interval constructed for feature dimension :math:`l`. In :meth:`transform`, the cover is applied to a new array `X'` to yield a cover of `X'`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper",
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
            "kind": {
                "type": "``'uniform'`` | ``'balanced'``, optional, default: ``'uniform'``",
                "desc": "The kind of cover to use.",
                "default": "'uniform'",
                "dictKeyOf": "initkargs"
            },
            "n_intervals": {
                "type": "number",
                "desc": "The number of intervals in the covers of each feature dimensioncalculated in :meth:`fit`.",
                "default": "10",
                "dictKeyOf": "initkargs"
            },
            "overlap_frac": {
                "type": "number",
                "desc": "The fractional overlap between consecutive intervals in the covers ofeach feature dimension calculated in :meth:`fit`.",
                "default": "0.1",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.CubicalCover"
        }
    },
    "gtda.mapper.Eccentricity": {
        "cls": "Block",
        "typename": "Eccentricity",
        "desc": "Eccentricities of points in a point cloud or abstract metric space.  Let `D` be a square matrix representing distances between points in a point cloud, or directly defining an abstract metric (or metric-like) space. The eccentricity of point `i` in the point cloud or abstract metric space is the `p`-norm (for some `p`) of row `i` in `D`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper",
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
            "exponent": {
                "type": "number",
                "desc": "`p`-norm exponent used to calculate eccentricities from the distancematrix.",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "metric": {
                "type": "string",
                "desc": "Metric to use to compute the distance matrix if point cloud data ispassed as input, or ``'precomputed'`` to specify that the input isalready a distance matrix. If not ``'precomputed'``, it may beanything allowed by :func:`scipy.spatial.distance.pdist`.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict, optional, default: ``{}``",
                "desc": "",
                "default": "{}",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.Eccentricity"
        }
    },
    "gtda.mapper.FirstHistogramGap": {
        "cls": "Block",
        "typename": "FirstHistogramGap",
        "desc": "Agglomerative clustering with stopping rule given by a histogram-based version of the first gap method, introduced in [1]_.  Given a frequency threshold f and an initial integer k: 1) create a histogram of k equally spaced bins of the number of merges in the dendrogram, as a function of the linkage parameter; 2) the value of linkage at which the tree is to be cut is the first one after which a bin of height no greater than f (i.e. a \"gap\") is observed; 3) if no gap is observed, increase k and repeat 1) and 2) until termination. The algorithm can be partially overridden to ensure that the final number of clusters does not exceed a certain threshold, by passing a parameter `max_fraction`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper",
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
            "linkage": {
                "type": "``'ward'`` | ``'complete'`` | ``'average'`` | ``'single'``,         optional, default: ``'single'``",
                "desc": "Which linkage criterion to use. The linkage criterion determines whichdistance to use between sets of observation. The algorithm will mergethe pairs of cluster that minimize this criterion.- ``'ward'`` minimizes the variance of the clusters being merged.- ``'average'`` uses the average of the distances of each observationof the two sets.- ``'complete'`` linkage uses the maximum distances between allobservations of the two sets.- ``'single'`` uses the minimum of the distances between allobservations of the two sets.",
                "default": "'single'",
                "dictKeyOf": "initkargs"
            },
            "affinity": {
                "type": "string",
                "desc": "Metric used to compute the linkage. Can be ``'euclidean'``, ``'l1'``,``'l2'``, ``'manhattan'``, ``'cosine'``, or ``'precomputed'``.If linkage is ``'ward'``, only ``'euclidean'`` is accepted.If ``'precomputed'``, a distance matrix (instead of a similaritymatrix) is needed as input for :meth:`fit`.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "freq_threshold": {
                "type": "number",
                "desc": "The frequency threshold for declaring that a gap in the histogram ofmerges is present.",
                "default": "0",
                "dictKeyOf": "initkargs"
            },
            "max_fraction": {
                "type": "number",
                "desc": "When not ``None``, the algorithm is constrained to produce no morethan ``max_fraction * n_samples`` clusters, even if a candidate gap isobserved in the iterative process which would produce a greater numberof clusters.",
                "default": "1.",
                "dictKeyOf": "initkargs"
            },
            "n_bins_start": {
                "type": "number",
                "desc": "The initial number of bins in the iterative process for finding a gapin the histogram of merges.",
                "default": "5",
                "dictKeyOf": "initkargs"
            },
            "memory": {
                "type": "None, str or object with the joblib.Memory interface,         optional, default: ``None``",
                "desc": "Used to cache the output of the computation of the tree. By default, nocaching is performed. If a string is given, it is the path to thecaching directory.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.FirstHistogramGap"
        }
    },
    "gtda.mapper.FirstSimpleGap": {
        "cls": "Block",
        "typename": "FirstSimpleGap",
        "desc": "Agglomerative clustering cutting the dendrogram at the first instance of a sufficiently large gap.  A simple threshold is determined as a fraction of the largest linkage value in the full dendrogram. If possible, the dendrogram is cut at the first occurrence of a gap, between the linkage values of successive merges, which exceeds this threshold. Otherwise, a single cluster is returned. The algorithm can be partially overridden to ensure that the final number of clusters does not exceed a certain threshold, by passing a parameter `max_fraction`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper",
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
            "linkage": {
                "type": "``'ward'`` | ``'complete'`` | ``'average'`` | ``'single'``,         optional, default: ``'single'``",
                "desc": "Which linkage criterion to use. The linkage criterion determines whichdistance to use between sets of observation. The algorithm will mergethe pairs of cluster that minimize this criterion.- ``'ward'`` minimizes the variance of the clusters being merged.- ``'average'`` uses the average of the distances of each observationof the two sets.- ``'complete'`` linkage uses the maximum distances betweenall observations of the two sets.- ``'single'`` uses the minimum of the distances between allobservations of the two sets.",
                "default": "'single'",
                "dictKeyOf": "initkargs"
            },
            "affinity": {
                "type": "string",
                "desc": "Metric used to compute the linkage. Can be ``'euclidean'``, ``'l1'``,``'l2'``, ``'manhattan'``, ``'cosine'``, or ``'precomputed'``.If linkage is ``'ward'``, only ``'euclidean'`` is accepted.If ``'precomputed'``, a distance matrix (instead of a similaritymatrix) is needed as input for :meth:`fit`.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "relative_gap_size": {
                "type": "number",
                "desc": "The fraction of the largest linkage in the dendrogram to be used asa threshold for determining a large enough gap.",
                "default": "0.3",
                "dictKeyOf": "initkargs"
            },
            "max_fraction": {
                "type": "number",
                "desc": "When not ``None``, the algorithm is constrained to produce no morethan ``max_fraction * n_samples`` clusters, even if a candidate gap isobserved in the iterative process which would produce a greater numberof clusters.",
                "default": "1.",
                "dictKeyOf": "initkargs"
            },
            "memory": {
                "type": "None, str or object with the joblib.Memory interface,         optional, default: ``None``",
                "desc": "Used to cache the output of the computation of the tree. By default, nocaching is performed. If a string is given, it is the path to thecaching directory.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.FirstSimpleGap"
        }
    },
    "gtda.mapper.MapperInteractivePlotter": {
        "cls": "Block",
        "typename": "MapperInteractivePlotter",
        "desc": "Plot Mapper graphs in a Jupyter session, with interactivity on pipeline parameters.  Provides functionality to interactively update parameters from the cover, clustering and graph construction steps defined in `pipeline`. An interactive widget is produced when calling :meth:`plot`. After interacting with the widget, the current state of all outputs which may have been altered can be retrieved via one of the attributes listed below.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper",
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
            "pipeline": {
                "type": ":class:`~gtda.mapper.pipeline.MapperPipeline` object",
                "desc": "Mapper pipeline to act on to data.",
                "dictKeyOf": "initkargs"
            },
            "data": {
                "type": "array-like of shape (n_samples, n_features)",
                "desc": "Data used to generate the Mapper graph. Can be a pandas dataframe.",
                "dictKeyOf": "initkargs"
            },
            "clone_pipeline": {
                "type": "boolean",
                "desc": "If ``True``, the input `pipeline` is cloned before computing theMapper graph to prevent unexpected side effects from in-placeparameter updates.",
                "default": "True",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.MapperInteractivePlotter"
        }
    },
    "gtda.mapper.Nerve": {
        "cls": "Block",
        "typename": "Nerve",
        "desc": "1-skeleton of the nerve of a refined Mapper cover, i.e. the Mapper graph.  This transformer is the final step in the :class:`gtda.mapper.pipeline.MapperPipeline` objects created by :func:`gtda.mapper.make_mapper_pipeline`. It corresponds the last two arrows in `this diagram <../../../../_images/mapper_pipeline.svg>`_.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper",
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
            "min_intersection": {
                "type": "number",
                "desc": "Minimum size of the intersection, between data subsets associated toany two Mapper nodes, required to create an edge between the nodes inthe Mapper graph. Must be positive.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "store_edge_elements": {
                "type": "boolean",
                "desc": "Whether the indices of data elements associated to Mapper edges (i.e.in the intersections allowed by `min_intersection`) should be stored inthe :class:`igraph.Graph` object output by :meth:`fit_transform`. When``True``, might lead to a large :class:`igraph.Graph` object.",
                "default": "False",
                "dictKeyOf": "initkargs"
            },
            "contract_nodes": {
                "type": "boolean",
                "desc": "If ``True``, any node representing a cluster which is a strict subsetof the cluster corresponding to another node is eliminated, and onlyone maximal node is kept.",
                "default": "False",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.Nerve"
        }
    },
    "gtda.mapper.OneDimensionalCover": {
        "cls": "Block",
        "typename": "OneDimensionalCover",
        "desc": "Cover of one-dimensional data coming from open overlapping intervals.  In :meth:`fit`, given a training array `X` representing a collection of real numbers, a cover of the real line by open intervals :math:`I_k = (a_k, b_k)` (:math:`k = 1, \\ldots, n`, :math:`a_k < a_{k+1}`, :math:`b_k < b_{k+1}`) is constructed based on the distribution of values in `X`. In :meth:`transform`, the cover is applied to a new array `X'` to yield a cover of `X'`.  All covers constructed in :meth:`fit` have :math:`a_1 = -\\infty` and :math:`b_n = + \\infty``. Two kinds of cover are currently available: \"uniform\" and \"balanced\". A uniform cover is such that :math:`b_1 - m = b_2 - a_2 = \\cdots = M - a_n` where :math:`m` and :math:`M` are the minimum and maximum values in `X` respectively. A balanced cover is such that approximately the same number of unique values from `X` is contained in each cover interval.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper",
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
            "kind": {
                "type": "``'uniform'`` | ``'balanced'``, optional, default: ``'uniform'``",
                "desc": "The kind of cover to use.",
                "default": "'uniform'",
                "dictKeyOf": "initkargs"
            },
            "n_intervals": {
                "type": "number",
                "desc": "The number of intervals in the cover calculated in :meth:`fit`.",
                "default": "10",
                "dictKeyOf": "initkargs"
            },
            "overlap_frac": {
                "type": "number",
                "desc": "If the cover is uniform, this is the ratio between the length of theintersection between consecutive intervals and the length of eachinterval. If the cover is balanced, this is the analogous fractionaloverlap for a uniform cover of the closed interval:math:`(0.5, N + 0.5)` where :math:`N` is the number of uniquevalues in the training array (see the Notes).",
                "default": "0.1",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.OneDimensionalCover"
        }
    },
    "gtda.mapper.ParallelClustering": {
        "cls": "Block",
        "typename": "ParallelClustering",
        "desc": "Employ joblib parallelism to cluster different portions of a dataset.  An arbitrary clustering class which stores a ``labels_`` attribute in ``fit`` can be passed to the constructor. Examples are most classes in ``sklearn.cluster``. The input of :meth:`fit` is of the form ``[X_tot, masks]`` where ``X_tot`` is the full dataset, and ``masks`` is a 2D boolean array, each column of which indicates the location of a portion of ``X_tot`` to cluster separately. Parallelism is achieved over the columns of ``masks``.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper",
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
            "clusterer": {
                "type": "object",
                "desc": "Clustering object derived from :class:`sklearn.base.ClusterMixin`.",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "parallel_backend_prefer": {
                "type": "``\"processes\"`` | ``\"threads\"`` | ``None``,         optional, default: ``None``",
                "desc": "Soft hint for the selection of the default joblib backend. The defaultprocess-based backend is 'loky' and the default thread-based backend is'threading'. See [1]_.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.ParallelClustering"
        }
    },
    "gtda.mapper.Projection": {
        "cls": "Block",
        "typename": "Projection",
        "desc": "Projection onto specified columns.  In practice, this simply means returning a selection of columns of the data.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper",
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
            "columns": {
                "type": "number",
                "desc": "",
                "default": "0",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.Projection"
        }
    },
    "gtda.mapper.cover.CubicalCover": {
        "cls": "Block",
        "typename": "CubicalCover",
        "desc": "Cover of multi-dimensional data coming from overlapping hypercubes (technically, parallelopipeds) given by taking products of one-dimensional intervals.  In :meth:`fit`, :class:`OneDimensionalCover` objects are fitted independently on each column of the input array, according to the same parameters passed to the constructor. For example, if the :class:`CubicalCover` object is instantiated with ``kind='uniform'``, ``n_intervals=10`` and ``overlap_frac=0.1``, then each column of the input array is used to construct a cover of the real line by 10 equal-length intervals with fractional overlap of 0.1. Each element of the resulting multi-dimensional cover of Euclidean space is of the form :math:`I_{i, \\ldots, k} = I^{(0)}_i \\times \\cdots \\times I^{(d-1)}_k` where :math:`d` is the number of columns in the input array, and :math:`I^{(l)}_j` is the :math:`j`th cover interval constructed for feature dimension :math:`l`. In :meth:`transform`, the cover is applied to a new array `X'` to yield a cover of `X'`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper.cover",
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
            "kind": {
                "type": "``'uniform'`` | ``'balanced'``, optional, default: ``'uniform'``",
                "desc": "The kind of cover to use.",
                "default": "'uniform'",
                "dictKeyOf": "initkargs"
            },
            "n_intervals": {
                "type": "number",
                "desc": "The number of intervals in the covers of each feature dimensioncalculated in :meth:`fit`.",
                "default": "10",
                "dictKeyOf": "initkargs"
            },
            "overlap_frac": {
                "type": "number",
                "desc": "The fractional overlap between consecutive intervals in the covers ofeach feature dimension calculated in :meth:`fit`.",
                "default": "0.1",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.cover.CubicalCover"
        }
    },
    "gtda.mapper.cover.Interval": {
        "cls": "Block",
        "typename": "Interval",
        "desc": "Immutable object implementing an interval.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper.cover",
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
            "left": {
                "type": "real scalar, required",
                "desc": "Left bound for the interval.",
                "dictKeyOf": "initkargs"
            },
            "right": {
                "type": "real scalar, required",
                "desc": "Right bound for the interval.",
                "dictKeyOf": "initkargs"
            },
            "closed": {
                "type": "``'right'`` | ``'left'`` | ``'both'`` | ``'neither'``, required",
                "desc": "Whether the interval is closed on the left-side, right-side, both or",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.cover.Interval"
        }
    },
    "gtda.mapper.cover.OneDimensionalCover": {
        "cls": "Block",
        "typename": "OneDimensionalCover",
        "desc": "Cover of one-dimensional data coming from open overlapping intervals.  In :meth:`fit`, given a training array `X` representing a collection of real numbers, a cover of the real line by open intervals :math:`I_k = (a_k, b_k)` (:math:`k = 1, \\ldots, n`, :math:`a_k < a_{k+1}`, :math:`b_k < b_{k+1}`) is constructed based on the distribution of values in `X`. In :meth:`transform`, the cover is applied to a new array `X'` to yield a cover of `X'`.  All covers constructed in :meth:`fit` have :math:`a_1 = -\\infty` and :math:`b_n = + \\infty``. Two kinds of cover are currently available: \"uniform\" and \"balanced\". A uniform cover is such that :math:`b_1 - m = b_2 - a_2 = \\cdots = M - a_n` where :math:`m` and :math:`M` are the minimum and maximum values in `X` respectively. A balanced cover is such that approximately the same number of unique values from `X` is contained in each cover interval.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper.cover",
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
            "kind": {
                "type": "``'uniform'`` | ``'balanced'``, optional, default: ``'uniform'``",
                "desc": "The kind of cover to use.",
                "default": "'uniform'",
                "dictKeyOf": "initkargs"
            },
            "n_intervals": {
                "type": "number",
                "desc": "The number of intervals in the cover calculated in :meth:`fit`.",
                "default": "10",
                "dictKeyOf": "initkargs"
            },
            "overlap_frac": {
                "type": "number",
                "desc": "If the cover is uniform, this is the ratio between the length of theintersection between consecutive intervals and the length of eachinterval. If the cover is balanced, this is the analogous fractionaloverlap for a uniform cover of the closed interval:math:`(0.5, N + 0.5)` where :math:`N` is the number of uniquevalues in the training array (see the Notes).",
                "default": "0.1",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.cover.OneDimensionalCover"
        }
    },
    "gtda.mapper.filter.Eccentricity": {
        "cls": "Block",
        "typename": "Eccentricity",
        "desc": "Eccentricities of points in a point cloud or abstract metric space.  Let `D` be a square matrix representing distances between points in a point cloud, or directly defining an abstract metric (or metric-like) space. The eccentricity of point `i` in the point cloud or abstract metric space is the `p`-norm (for some `p`) of row `i` in `D`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper.filter",
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
            "exponent": {
                "type": "number",
                "desc": "`p`-norm exponent used to calculate eccentricities from the distancematrix.",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "metric": {
                "type": "string",
                "desc": "Metric to use to compute the distance matrix if point cloud data ispassed as input, or ``'precomputed'`` to specify that the input isalready a distance matrix. If not ``'precomputed'``, it may beanything allowed by :func:`scipy.spatial.distance.pdist`.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict, optional, default: ``{}``",
                "desc": "",
                "default": "{}",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.filter.Eccentricity"
        }
    },
    "gtda.mapper.filter.Projection": {
        "cls": "Block",
        "typename": "Projection",
        "desc": "Projection onto specified columns.  In practice, this simply means returning a selection of columns of the data.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper.filter",
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
            "columns": {
                "type": "number",
                "desc": "",
                "default": "0",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.filter.Projection"
        }
    },
    "gtda.mapper.nerve.Nerve": {
        "cls": "Block",
        "typename": "Nerve",
        "desc": "1-skeleton of the nerve of a refined Mapper cover, i.e. the Mapper graph.  This transformer is the final step in the :class:`gtda.mapper.pipeline.MapperPipeline` objects created by :func:`gtda.mapper.make_mapper_pipeline`. It corresponds the last two arrows in `this diagram <../../../../_images/mapper_pipeline.svg>`_.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper.nerve",
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
            "min_intersection": {
                "type": "number",
                "desc": "Minimum size of the intersection, between data subsets associated toany two Mapper nodes, required to create an edge between the nodes inthe Mapper graph. Must be positive.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "store_edge_elements": {
                "type": "boolean",
                "desc": "Whether the indices of data elements associated to Mapper edges (i.e.in the intersections allowed by `min_intersection`) should be stored inthe :class:`igraph.Graph` object output by :meth:`fit_transform`. When``True``, might lead to a large :class:`igraph.Graph` object.",
                "default": "False",
                "dictKeyOf": "initkargs"
            },
            "contract_nodes": {
                "type": "boolean",
                "desc": "If ``True``, any node representing a cluster which is a strict subsetof the cluster corresponding to another node is eliminated, and onlyone maximal node is kept.",
                "default": "False",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.nerve.Nerve"
        }
    },
    "gtda.mapper.visualization.MapperInteractivePlotter": {
        "cls": "Block",
        "typename": "MapperInteractivePlotter",
        "desc": "Plot Mapper graphs in a Jupyter session, with interactivity on pipeline parameters.  Provides functionality to interactively update parameters from the cover, clustering and graph construction steps defined in `pipeline`. An interactive widget is produced when calling :meth:`plot`. After interacting with the widget, the current state of all outputs which may have been altered can be retrieved via one of the attributes listed below.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.mapper.visualization",
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
            "pipeline": {
                "type": ":class:`~gtda.mapper.pipeline.MapperPipeline` object",
                "desc": "Mapper pipeline to act on to data.",
                "dictKeyOf": "initkargs"
            },
            "data": {
                "type": "array-like of shape (n_samples, n_features)",
                "desc": "Data used to generate the Mapper graph. Can be a pandas dataframe.",
                "dictKeyOf": "initkargs"
            },
            "clone_pipeline": {
                "type": "boolean",
                "desc": "If ``True``, the input `pipeline` is cloned before computing theMapper graph to prevent unexpected side effects from in-placeparameter updates.",
                "default": "True",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.mapper.visualization.MapperInteractivePlotter"
        }
    },
    "gtda.metaestimators.CollectionTransformer": {
        "cls": "Block",
        "typename": "CollectionTransformer",
        "desc": "Meta-transformer for applying a fit-transformer to each input in a collection.  If `transformer` possesses a ``fit_transform`` method, ``CollectionTransformer(transformer)`` also possesses a :meth:`fit_transform` method which, on each entry in its input ``X``, fit-transforms a clone of `transformer`. A collection (list or ndarray) of outputs is returned.  Note: to have compatibility with scikit-learn and giotto-tda pipelines, a :meth:`transform` method is also present but it is simply an alias for :meth:`fit_transform`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.metaestimators",
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
            "transformer": {
                "type": "object",
                "desc": "The fit-transformer instance from which the transformer acting oncollections is built. Should implement ``fit_transform``.",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use in a joblib-parallel application of`transformer`'s ``fit_transform`` to each input. ``None`` means 1unless in a :obj:`joblib.parallel_backend` context. ``-1`` means usingall processors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "parallel_backend_prefer": {
                "type": " ``\"processes\"`` | ``\"threads\"`` | ``None``,         optional, default: ``None``",
                "desc": "Soft hint for the default joblib backend to use in a joblib-parallelapplication of `transformer`'s ``fit_transform`` to each input. See[1]_.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "parallel_backend_require": {
                "type": "``\"sharedmem\"`` or None, optional, default:         ``None``",
                "desc": "Hard constraint to select the backend. If set to ``'sharedmem'``, theselected backend will be single-host and thread-based even if the userasked for a non-thread based backend with parallel_backend.",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.metaestimators.CollectionTransformer"
        }
    },
    "gtda.point_clouds.ConsecutiveRescaling": {
        "cls": "Block",
        "typename": "ConsecutiveRescaling",
        "desc": "Rescaling of distances between consecutive pairs of points by a fixed factor.  The computation during :meth:`transform` depends on the nature of the array `X`. If each entry in `X` along axis 0 represents a distance matrix :math:`D`, then the corresponding entry in the transformed array is the distance matrix :math:`D'_{i,i+1} = \\alpha D_{i,i+1}` where :math:`\\alpha` is a positive factor. If the entries in `X` represent point clouds, their distance matrices are first computed, and then rescaled according to the same formula.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.point_clouds",
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
            "metric": {
                "type": "string",
                "desc": "If set to ``'precomputed'``, each entry in `X` along axis 0 isinterpreted to be a distance matrix. Otherwise, entries areinterpreted as feature arrays, and `metric` determines a rule withwhich to calculate distances between pairs of instances (i.e. rows)in these arrays.If `metric` is a string, it must be one of the options allowed by:func:`scipy.spatial.distance.pdist` for its metric parameter, or ametric listed in :obj:`sklearn.pairwise.PAIRWISE_DISTANCE_FUNCTIONS`,including \"euclidean\", \"manhattan\" or \"cosine\".If `metric` is a callable function, it is called on each pair ofinstances and the resulting value recorded. The callable should taketwo arrays from the entry in `X` as input, and return a valueindicating the distance between them.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict or None, optional, default: ``None``",
                "desc": "Additional keyword arguments for the metric function.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "factor": {
                "type": "number",
                "desc": "Factor by which to multiply the distance between consecutivepoints.",
                "default": "0.",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.point_clouds.ConsecutiveRescaling"
        }
    },
    "gtda.point_clouds.ConsistentRescaling": {
        "cls": "Block",
        "typename": "ConsistentRescaling",
        "desc": "Rescaling of distances between pairs of points by the geometric mean of the distances to the respective :math:`k`-th nearest neighbours.  Based on ideas in [1]_. The computation during :meth:`transform` depends on the nature of the array `X`. If each entry in `X` along axis 0 represents a distance matrix :math:`D`, then the corresponding entry in the transformed array is the distance matrix :math:`D'_{i,j} = D_{i,j}/\\sqrt{D_{i,k_i}D_{j,k_j}}`, where :math:`k_i` is the index of the :math:`k`-th largest value in row :math:`i` (and similarly for :math:`j`). If the entries in `X` represent point clouds, their distance matrices are first computed, and then rescaled according to the same formula.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.point_clouds",
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
            "metric": {
                "type": "string",
                "desc": "If set to ``'precomputed'``, each entry in `X` along axis 0 isinterpreted to be a distance matrix. Otherwise, entries areinterpreted as feature arrays, and `metric` determines a rule withwhich to calculate distances between pairs of instances (i.e. rows)in these arrays.If `metric` is a string, it must be one of the options allowed by:func:`scipy.spatial.distance.pdist` for its metric parameter, or ametric listed in :obj:`sklearn.pairwise.PAIRWISE_DISTANCE_FUNCTIONS`,including \"euclidean\", \"manhattan\" or \"cosine\".If `metric` is a callable function, it is called on each pair ofinstances and the resulting value recorded. The callable should taketwo arrays from the entry in `X` as input, and return a valueindicating the distance between them.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict or None, optional, default: ``None``",
                "desc": "Additional keyword arguments for the metric function.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "neighbor_rank": {
                "type": "number",
                "desc": "Rank of the neighbors used to modify the metric structure accordingto the \"consistent rescaling\" procedure.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.point_clouds.ConsistentRescaling"
        }
    },
    "gtda.point_clouds.rescaling.ConsecutiveRescaling": {
        "cls": "Block",
        "typename": "ConsecutiveRescaling",
        "desc": "Rescaling of distances between consecutive pairs of points by a fixed factor.  The computation during :meth:`transform` depends on the nature of the array `X`. If each entry in `X` along axis 0 represents a distance matrix :math:`D`, then the corresponding entry in the transformed array is the distance matrix :math:`D'_{i,i+1} = \\alpha D_{i,i+1}` where :math:`\\alpha` is a positive factor. If the entries in `X` represent point clouds, their distance matrices are first computed, and then rescaled according to the same formula.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.point_clouds.rescaling",
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
            "metric": {
                "type": "string",
                "desc": "If set to ``'precomputed'``, each entry in `X` along axis 0 isinterpreted to be a distance matrix. Otherwise, entries areinterpreted as feature arrays, and `metric` determines a rule withwhich to calculate distances between pairs of instances (i.e. rows)in these arrays.If `metric` is a string, it must be one of the options allowed by:func:`scipy.spatial.distance.pdist` for its metric parameter, or ametric listed in :obj:`sklearn.pairwise.PAIRWISE_DISTANCE_FUNCTIONS`,including \"euclidean\", \"manhattan\" or \"cosine\".If `metric` is a callable function, it is called on each pair ofinstances and the resulting value recorded. The callable should taketwo arrays from the entry in `X` as input, and return a valueindicating the distance between them.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict or None, optional, default: ``None``",
                "desc": "Additional keyword arguments for the metric function.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "factor": {
                "type": "number",
                "desc": "Factor by which to multiply the distance between consecutivepoints.",
                "default": "0.",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.point_clouds.rescaling.ConsecutiveRescaling"
        }
    },
    "gtda.point_clouds.rescaling.ConsistentRescaling": {
        "cls": "Block",
        "typename": "ConsistentRescaling",
        "desc": "Rescaling of distances between pairs of points by the geometric mean of the distances to the respective :math:`k`-th nearest neighbours.  Based on ideas in [1]_. The computation during :meth:`transform` depends on the nature of the array `X`. If each entry in `X` along axis 0 represents a distance matrix :math:`D`, then the corresponding entry in the transformed array is the distance matrix :math:`D'_{i,j} = D_{i,j}/\\sqrt{D_{i,k_i}D_{j,k_j}}`, where :math:`k_i` is the index of the :math:`k`-th largest value in row :math:`i` (and similarly for :math:`j`). If the entries in `X` represent point clouds, their distance matrices are first computed, and then rescaled according to the same formula.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.point_clouds.rescaling",
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
            "metric": {
                "type": "string",
                "desc": "If set to ``'precomputed'``, each entry in `X` along axis 0 isinterpreted to be a distance matrix. Otherwise, entries areinterpreted as feature arrays, and `metric` determines a rule withwhich to calculate distances between pairs of instances (i.e. rows)in these arrays.If `metric` is a string, it must be one of the options allowed by:func:`scipy.spatial.distance.pdist` for its metric parameter, or ametric listed in :obj:`sklearn.pairwise.PAIRWISE_DISTANCE_FUNCTIONS`,including \"euclidean\", \"manhattan\" or \"cosine\".If `metric` is a callable function, it is called on each pair ofinstances and the resulting value recorded. The callable should taketwo arrays from the entry in `X` as input, and return a valueindicating the distance between them.",
                "default": "'euclidean'",
                "dictKeyOf": "initkargs"
            },
            "metric_params": {
                "type": "dict or None, optional, default: ``None``",
                "desc": "Additional keyword arguments for the metric function.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "neighbor_rank": {
                "type": "number",
                "desc": "Rank of the neighbors used to modify the metric structure accordingto the \"consistent rescaling\" procedure.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.point_clouds.rescaling.ConsistentRescaling"
        }
    },
    "gtda.point_clouds.rescaling.Interval": {
        "cls": "Block",
        "typename": "Interval",
        "desc": "Immutable object implementing an interval.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.point_clouds.rescaling",
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
            "left": {
                "type": "real scalar, required",
                "desc": "Left bound for the interval.",
                "dictKeyOf": "initkargs"
            },
            "right": {
                "type": "real scalar, required",
                "desc": "Right bound for the interval.",
                "dictKeyOf": "initkargs"
            },
            "closed": {
                "type": "``'right'`` | ``'left'`` | ``'both'`` | ``'neither'``, required",
                "desc": "Whether the interval is closed on the left-side, right-side, both or",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.point_clouds.rescaling.Interval"
        }
    },
    "gtda.point_clouds.rescaling.Parallel": {
        "cls": "Block",
        "typename": "Parallel",
        "desc": "Helper class for readable parallel mapping.  Read more in the :ref:`User Guide <parallel>`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.point_clouds.rescaling",
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
            }
        },
        "defaults": {
            "cls": "gtda.point_clouds.rescaling.Parallel"
        }
    },
    "gtda.time_series.Labeller": {
        "cls": "Block",
        "typename": "Labeller",
        "desc": "Target creation from sliding windows over a univariate time series.  Useful to define a time series forecasting task in which labels are obtained from future values of the input time series, via the application of a function to time windows.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series",
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
            "size": {
                "type": "number",
                "desc": "Size of each sliding window.",
                "default": "10",
                "dictKeyOf": "initkargs"
            },
            "func": {
                "type": "callable, optional, default: ``numpy.std``",
                "desc": "Function to be applied to each window.",
                "default": "numpy.std",
                "dictKeyOf": "initkargs"
            },
            "func_params": {
                "type": "dict or None, optional, default: ``None``",
                "desc": "Additional keyword arguments for `func`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "percentiles": {
                "type": "list of real numbers between 0 and 100 inclusive, or         None, optional, default: ``None``",
                "desc": "If ``None``, creates a target for a regression task. Otherwise, createsa target for an n-class classification task where``n = len(percentiles) + 1``.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_steps_future": {
                "type": "number",
                "desc": "Number of steps in the future for the predictive task.",
                "default": "1",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.Labeller"
        }
    },
    "gtda.time_series.PearsonDissimilarity": {
        "cls": "Block",
        "typename": "PearsonDissimilarity",
        "desc": "Pearson dissimilarities from collections of multivariate time series.  The sample Pearson correlation coefficients between pairs of components of an :math:`N`-variate time series form an :math:`N \\times N` matrix :math:`R` with entries  .. math:: R_{ij} = \\frac{ C_{ij} }{ \\sqrt{ C_{ii} C_{jj} } },  where :math:`C` is the covariance matrix. Setting :math:`D_{ij} = (1 - R_{ij})/2` or :math:`D_{ij} = 1 - |R_{ij}|` we obtain a dissimilarity matrix with entries between 0 and 1.  This transformer computes one dissimilarity matrix per multivariate time series in a collection. Examples of such collections are the outputs of :class:`SlidingWindow`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series",
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
            "absolute_value": {
                "type": "boolean",
                "desc": "Whether absolute values of the Pearson correlation coefficients shouldbe taken. Doing so makes pairs of strongly anti-correlated variables assimilar as pairs of strongly correlated ones.",
                "default": "False",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.PearsonDissimilarity"
        }
    },
    "gtda.time_series.PermutationEntropy": {
        "cls": "Block",
        "typename": "PermutationEntropy",
        "desc": "Entropies from sets of permutations arg-sorting rows in arrays.  Given a two-dimensional array `A`, another array `A'` of the same size is computed by arg-sorting each row in `A`. The permutation entropy [1]_ of `A` is the (base 2) Shannon entropy of the probability distribution given by the relative frequencies of each arg-sorting permutation in `A'`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series",
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
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.PermutationEntropy"
        }
    },
    "gtda.time_series.Resampler": {
        "cls": "Block",
        "typename": "Resampler",
        "desc": "Time series resampling at regular intervals.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series",
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
            "period": {
                "type": "number",
                "desc": "The sampling period, i.e. one point every period will be kept.",
                "default": "2",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.Resampler"
        }
    },
    "gtda.time_series.SingleTakensEmbedding": {
        "cls": "Block",
        "typename": "SingleTakensEmbedding",
        "desc": "Representation of a single univariate time series as a point cloud.  Based on a time-delay embedding technique named after F. Takens [1]_ [2]_. Given a discrete time series :math:`(X_0, X_1, \\ldots)` and a sequence of evenly sampled times :math:`t_0, t_1, \\ldots`, one extracts a set of :math:`d`-dimensional vectors of the form :math:`(X_{t_i}, X_{t_i + \\tau}, \\ldots , X_{t_i + (d-1)\\tau})` for :math:`i = 0, 1, \\ldots`. This set is called the :ref:`Takens embedding <takens_embedding>` of the time series and can be interpreted as a point cloud.  The difference between :math:`t_{i+1}` and :math:`t_i` is called the stride, :math:`\\tau` is called the time delay, and :math:`d` is called the (embedding) dimension.  If :math:`d` and :math:`\\tau` are not explicitly set, suitable values are searched for during :meth:`fit` [3]_ [4]_.  To compute time-delay embeddings of several time series simultaneously, use :class:`TakensEmbedding` instead.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series",
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
            "parameters_type": {
                "type": "``'search'`` | ``'fixed'``, optional, default:         ``'search'``",
                "desc": "If set to ``'fixed'``, the values of `time_delay` and `dimension` areused directly in :meth:`transform`. If set to ``'search'``,:func:`takens_embedding_optimal_parameter` is run in :meth:`fit` toestimate optimal values for these quantities and store them as:attr:`time_delay_` and :attr:`dimension_`.",
                "dictKeyOf": "initkargs"
            },
            "time_delay": {
                "type": "number",
                "desc": "Time delay between two consecutive values for constructing one embeddedpoint. If `parameters_type` is ``'search'``, it corresponds to themaximum time delay that will be considered.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "dimension": {
                "type": "number",
                "desc": "Dimension of the embedding space. If `parameters_type` is ``'search'``,it corresponds to the maximum embedding dimension that will beconsidered.",
                "default": "5",
                "dictKeyOf": "initkargs"
            },
            "stride": {
                "type": "number",
                "desc": "Stride duration between two consecutive embedded points. It defaults to1 as this is the usual value in the statement of Takens's embeddingtheorem.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.SingleTakensEmbedding"
        }
    },
    "gtda.time_series.SlidingWindow": {
        "cls": "Block",
        "typename": "SlidingWindow",
        "desc": "Sliding windows onto the data.  Useful in time series analysis to convert a sequence of objects (scalar or array-like) into a sequence of windows on the original sequence. Each window stacks together consecutive objects, and consecutive windows are separated by a constant stride.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series",
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
            "size": {
                "type": "number",
                "desc": "Size of each sliding window.",
                "default": "10",
                "dictKeyOf": "initkargs"
            },
            "stride": {
                "type": "number",
                "desc": "Stride between consecutive windows.",
                "default": "1",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.SlidingWindow"
        }
    },
    "gtda.time_series.Stationarizer": {
        "cls": "Block",
        "typename": "Stationarizer",
        "desc": "Methods for stationarizing time series data.  Time series may be stationarized to remove or reduce linear or exponential trends.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series",
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
            "operation": {
                "type": "``'return'`` | ``'log-return'``, default: ``'return'``",
                "desc": "The type of stationarization operation to perform. It can have twovalues:- ``'return'``:This option transforms the time series :math:`{X_t}_t` into thetime series of relative returns, i.e. the ratio :math:`(X_t-X_{t-1})/X_t`.- ``'log-return'``:This option transforms the time series :math:`{X_t}_t` into thetime series of relative log-returns, i.e. :math:`\\log(X_t/X_{t-1})`.",
                "default": "'return'",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.Stationarizer"
        }
    },
    "gtda.time_series.TakensEmbedding": {
        "cls": "Block",
        "typename": "TakensEmbedding",
        "desc": "Point clouds from collections of time series via independent Takens embeddings.  This transformer takes collections of (possibly multivariate) time series as input, applies the Takens embedding algorithm described in :class:`SingleTakensEmbedding` to each independently, and returns a corresponding collection of point clouds in Euclidean space (or possibly higher-dimensional structures, see `flatten`).",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series",
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
            "time_delay": {
                "type": "number",
                "desc": "Time delay between two consecutive values for constructing one embeddedpoint.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "dimension": {
                "type": "number",
                "desc": "Dimension of the embedding space (per variable, in the multivariatecase).",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "stride": {
                "type": "number",
                "desc": "Stride duration between two consecutive embedded points.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "flatten": {
                "type": "boolean",
                "desc": "Only relevant when the input of :meth:`transform` represents acollection of multivariate or tensor-valued time series. If ``True``,ensures that the output is a 3D ndarray or list of 2D arrays. If``False``, each entry of the input collection leads to an array ofdimension one higher than the entry's dimension. See Examples.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "ensure_last_value": {
                "type": "boolean",
                "desc": "Whether the value(s) representing the last measurement(s) must bebe present in the output as the last coordinate(s) of the lastembedding vector(s). If ``False``, the first measurement(s) is (are)present as the 0-th coordinate(s) of the 0-th vector(s) instead.",
                "default": "True",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.TakensEmbedding"
        }
    },
    "gtda.time_series.embedding.Interval": {
        "cls": "Block",
        "typename": "Interval",
        "desc": "Immutable object implementing an interval.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series.embedding",
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
            "left": {
                "type": "real scalar, required",
                "desc": "Left bound for the interval.",
                "dictKeyOf": "initkargs"
            },
            "right": {
                "type": "real scalar, required",
                "desc": "Right bound for the interval.",
                "dictKeyOf": "initkargs"
            },
            "closed": {
                "type": "``'right'`` | ``'left'`` | ``'both'`` | ``'neither'``, required",
                "desc": "Whether the interval is closed on the left-side, right-side, both or",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.embedding.Interval"
        }
    },
    "gtda.time_series.embedding.Parallel": {
        "cls": "Block",
        "typename": "Parallel",
        "desc": "Helper class for readable parallel mapping.  Read more in the :ref:`User Guide <parallel>`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series.embedding",
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
            }
        },
        "defaults": {
            "cls": "gtda.time_series.embedding.Parallel"
        }
    },
    "gtda.time_series.embedding.SingleTakensEmbedding": {
        "cls": "Block",
        "typename": "SingleTakensEmbedding",
        "desc": "Representation of a single univariate time series as a point cloud.  Based on a time-delay embedding technique named after F. Takens [1]_ [2]_. Given a discrete time series :math:`(X_0, X_1, \\ldots)` and a sequence of evenly sampled times :math:`t_0, t_1, \\ldots`, one extracts a set of :math:`d`-dimensional vectors of the form :math:`(X_{t_i}, X_{t_i + \\tau}, \\ldots , X_{t_i + (d-1)\\tau})` for :math:`i = 0, 1, \\ldots`. This set is called the :ref:`Takens embedding <takens_embedding>` of the time series and can be interpreted as a point cloud.  The difference between :math:`t_{i+1}` and :math:`t_i` is called the stride, :math:`\\tau` is called the time delay, and :math:`d` is called the (embedding) dimension.  If :math:`d` and :math:`\\tau` are not explicitly set, suitable values are searched for during :meth:`fit` [3]_ [4]_.  To compute time-delay embeddings of several time series simultaneously, use :class:`TakensEmbedding` instead.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series.embedding",
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
            "parameters_type": {
                "type": "``'search'`` | ``'fixed'``, optional, default:         ``'search'``",
                "desc": "If set to ``'fixed'``, the values of `time_delay` and `dimension` areused directly in :meth:`transform`. If set to ``'search'``,:func:`takens_embedding_optimal_parameter` is run in :meth:`fit` toestimate optimal values for these quantities and store them as:attr:`time_delay_` and :attr:`dimension_`.",
                "dictKeyOf": "initkargs"
            },
            "time_delay": {
                "type": "number",
                "desc": "Time delay between two consecutive values for constructing one embeddedpoint. If `parameters_type` is ``'search'``, it corresponds to themaximum time delay that will be considered.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "dimension": {
                "type": "number",
                "desc": "Dimension of the embedding space. If `parameters_type` is ``'search'``,it corresponds to the maximum embedding dimension that will beconsidered.",
                "default": "5",
                "dictKeyOf": "initkargs"
            },
            "stride": {
                "type": "number",
                "desc": "Stride duration between two consecutive embedded points. It defaults to1 as this is the usual value in the statement of Takens's embeddingtheorem.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.embedding.SingleTakensEmbedding"
        }
    },
    "gtda.time_series.embedding.SlidingWindow": {
        "cls": "Block",
        "typename": "SlidingWindow",
        "desc": "Sliding windows onto the data.  Useful in time series analysis to convert a sequence of objects (scalar or array-like) into a sequence of windows on the original sequence. Each window stacks together consecutive objects, and consecutive windows are separated by a constant stride.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series.embedding",
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
            "size": {
                "type": "number",
                "desc": "Size of each sliding window.",
                "default": "10",
                "dictKeyOf": "initkargs"
            },
            "stride": {
                "type": "number",
                "desc": "Stride between consecutive windows.",
                "default": "1",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.embedding.SlidingWindow"
        }
    },
    "gtda.time_series.embedding.TakensEmbedding": {
        "cls": "Block",
        "typename": "TakensEmbedding",
        "desc": "Point clouds from collections of time series via independent Takens embeddings.  This transformer takes collections of (possibly multivariate) time series as input, applies the Takens embedding algorithm described in :class:`SingleTakensEmbedding` to each independently, and returns a corresponding collection of point clouds in Euclidean space (or possibly higher-dimensional structures, see `flatten`).",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series.embedding",
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
            "time_delay": {
                "type": "number",
                "desc": "Time delay between two consecutive values for constructing one embeddedpoint.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "dimension": {
                "type": "number",
                "desc": "Dimension of the embedding space (per variable, in the multivariatecase).",
                "default": "2",
                "dictKeyOf": "initkargs"
            },
            "stride": {
                "type": "number",
                "desc": "Stride duration between two consecutive embedded points.",
                "default": "1",
                "dictKeyOf": "initkargs"
            },
            "flatten": {
                "type": "boolean",
                "desc": "Only relevant when the input of :meth:`transform` represents acollection of multivariate or tensor-valued time series. If ``True``,ensures that the output is a 3D ndarray or list of 2D arrays. If``False``, each entry of the input collection leads to an array ofdimension one higher than the entry's dimension. See Examples.",
                "default": "True",
                "dictKeyOf": "initkargs"
            },
            "ensure_last_value": {
                "type": "boolean",
                "desc": "Whether the value(s) representing the last measurement(s) must bebe present in the output as the last coordinate(s) of the lastembedding vector(s). If ``False``, the first measurement(s) is (are)present as the 0-th coordinate(s) of the 0-th vector(s) instead.",
                "default": "True",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.embedding.TakensEmbedding"
        }
    },
    "gtda.time_series.multivariate.PearsonDissimilarity": {
        "cls": "Block",
        "typename": "PearsonDissimilarity",
        "desc": "Pearson dissimilarities from collections of multivariate time series.  The sample Pearson correlation coefficients between pairs of components of an :math:`N`-variate time series form an :math:`N \\times N` matrix :math:`R` with entries  .. math:: R_{ij} = \\frac{ C_{ij} }{ \\sqrt{ C_{ii} C_{jj} } },  where :math:`C` is the covariance matrix. Setting :math:`D_{ij} = (1 - R_{ij})/2` or :math:`D_{ij} = 1 - |R_{ij}|` we obtain a dissimilarity matrix with entries between 0 and 1.  This transformer computes one dissimilarity matrix per multivariate time series in a collection. Examples of such collections are the outputs of :class:`SlidingWindow`.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series.multivariate",
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
            "absolute_value": {
                "type": "boolean",
                "desc": "Whether absolute values of the Pearson correlation coefficients shouldbe taken. Doing so makes pairs of strongly anti-correlated variables assimilar as pairs of strongly correlated ones.",
                "default": "False",
                "dictKeyOf": "initkargs"
            },
            "n_jobs": {
                "type": "number",
                "desc": "The number of jobs to use for the computation. ``None`` means 1 unlessin a :obj:`joblib.parallel_backend` context. ``-1`` means using allprocessors.",
                "default": "None",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.multivariate.PearsonDissimilarity"
        }
    },
    "gtda.time_series.target.Interval": {
        "cls": "Block",
        "typename": "Interval",
        "desc": "Immutable object implementing an interval.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series.target",
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
            "left": {
                "type": "real scalar, required",
                "desc": "Left bound for the interval.",
                "dictKeyOf": "initkargs"
            },
            "right": {
                "type": "real scalar, required",
                "desc": "Right bound for the interval.",
                "dictKeyOf": "initkargs"
            },
            "closed": {
                "type": "``'right'`` | ``'left'`` | ``'both'`` | ``'neither'``, required",
                "desc": "Whether the interval is closed on the left-side, right-side, both or",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.target.Interval"
        }
    },
    "gtda.time_series.target.Labeller": {
        "cls": "Block",
        "typename": "Labeller",
        "desc": "Target creation from sliding windows over a univariate time series.  Useful to define a time series forecasting task in which labels are obtained from future values of the input time series, via the application of a function to time windows.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series.target",
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
            "size": {
                "type": "number",
                "desc": "Size of each sliding window.",
                "default": "10",
                "dictKeyOf": "initkargs"
            },
            "func": {
                "type": "callable, optional, default: ``numpy.std``",
                "desc": "Function to be applied to each window.",
                "default": "numpy.std",
                "dictKeyOf": "initkargs"
            },
            "func_params": {
                "type": "dict or None, optional, default: ``None``",
                "desc": "Additional keyword arguments for `func`.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "percentiles": {
                "type": "list of real numbers between 0 and 100 inclusive, or         None, optional, default: ``None``",
                "desc": "If ``None``, creates a target for a regression task. Otherwise, createsa target for an n-class classification task where``n = len(percentiles) + 1``.",
                "default": "None",
                "dictKeyOf": "initkargs"
            },
            "n_steps_future": {
                "type": "number",
                "desc": "Number of steps in the future for the predictive task.",
                "default": "1",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.target.Labeller"
        }
    },
    "gtda.time_series.target.SlidingWindow": {
        "cls": "Block",
        "typename": "SlidingWindow",
        "desc": "Sliding windows onto the data.  Useful in time series analysis to convert a sequence of objects (scalar or array-like) into a sequence of windows on the original sequence. Each window stacks together consecutive objects, and consecutive windows are separated by a constant stride.",
        "childof": "libretto.plugin.sklearn.block.SklClass",
        "pytype": "libretto.plugin.sklearn.block.SklClass",
        "group": "gtda.time_series.target",
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
            "size": {
                "type": "number",
                "desc": "Size of each sliding window.",
                "default": "10",
                "dictKeyOf": "initkargs"
            },
            "stride": {
                "type": "number",
                "desc": "Stride between consecutive windows.",
                "default": "1",
                "dictKeyOf": "initkargs"
            }
        },
        "defaults": {
            "cls": "gtda.time_series.target.SlidingWindow"
        }
    }
}
export default gtda;