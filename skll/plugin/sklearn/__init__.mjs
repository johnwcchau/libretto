import { Parent, Block, BlockTypes } from "/static/modules/BaseBlock.mjs";
import baseObjects from "./baseObjects.mjs";
import sklearn from "./sklearn.mjs";
import hdbscan from "./hdbscan.mjs";
import lightgbm from "./lightgbm.mjs";
import xgboost from "./xgboost.mjs";
import gtda from "./gtda.mjs";
export default null;

const bts = new BlockTypes();
function addToBts(types) {
    Object.keys(types).forEach(k=>{
        const v = types[k];
        switch (v.cls) {
            case "Block":
                v.cls = Block;
                break;
            case "Parent":
                v.cls = Parent;
                break;
            default:
                v.cls = Block;
        }
    });
    bts.add(types);
}
addToBts(baseObjects);
addToBts(sklearn);
addToBts(hdbscan);
addToBts(lightgbm);
addToBts(xgboost);
addToBts(gtda);
