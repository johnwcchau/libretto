import { Block, BlockTypes } from "/static/modules/BaseBlock.mjs";

export default null;

new BlockTypes().add({
    "libretto.plugin.transformer.block.TransformerBlock": {
        cls: Block,
        typename: "Transformer",
        group: "text transformer",
        desc: "Convert string into embeddings using hugging face transformer",
        childof: "libretto.baseblock.Block",
        properties: {
            "model": {
                desc: "Which model to use",
                type: "option(paraphrase-multilingual-MiniLM-L12-v2,paraphrase-multilingual-mpnet-base-v2,all-MiniLM-L6-v2,all-MiniLM-L12-v2,all-mpnet-base-v2)",
            },
        },
    },
    "libretto.plugin.transformer.block.UMAPBlock": {
        cls: Block,
        typename: "UMAP",
        group: "text transformer",
        desc: "Dimension reduction by UMAP",
        childof: "libretto.baseblock.Block",
        properties: {
            "n_components": {
                desc: "n_components",
                type: "number",
                dictKeyOf: "umap_param",
            },
            "transform_seed": {
                desc: "transform_seed",
                type: "number",
                dictKeyOf: "umap_param",
            },
            "n_neighbors": {
                desc: "n_neighbors",
                type: "number",
                dictKeyOf: "umap_param",
            },
            "min_dist": {
                desc: "lower limit of distances between points",
                type: "number",
                dictKeyOf: "umap_param",
            },
            "metric": {
                desc: "metric for similarity",
                type: "option(euclidean,manhattan,chebyshev,minkowski,canberra,braycurtis,haversine,mahalanobis,wminkowski,seuclidean,cosine,correlation)",
                dictKeyOf: "umap_param",
            },
            "target_metric": {
                desc: "target_metric",
                type: "string",
                dictKeyOf: "umap_param",
            },
            "target_weight": {
                desc: "target_weight",
                type: "number",
                dictKeyOf: "umap_param",
            },
        },
    },
});