import {Block, Parent, Split} from './modules/BaseBlock.mjs';
import {DataFrame} from "./modules/DataFrame.mjs"
import Log from "./modules/Log.mjs"
import EditDialog from "./modules/EditDialog.mjs"
import FileBrowser from "./modules/FileBrowser.mjs"
import WsClient from "./modules/WsClient.mjs"

var input = {
    "_type": "skll.block.input.Input",
    "name": "input",
    "disable_mask": [],
    "next": {
        "_type": "skll.block.splitter.XyidSplit",
        "name": "idsplit",
        "disable_mask": [],
        "ycol": "SalePrice",
        "idcol": "Id",
        "next": {
            "_type": "skll.block.splitter.TypeSplit",
            "name": "typesplit",
            "disable_mask": [],
            "splits": [
              [
                "int32",
                "int64",
                "float64"
              ],
              []
            ],            
            "out_y": "inherit",
            "out_id": "inherit",
            "_children": {
                "1": {
                  "_type": "skll.block.splitter.ColumnWise",
                  "_next": null,
                  "name": "columnwise",
                  "disable_mask": [],
                  "_children": {
                    "1": {
                      "_type": "skll.block.sklwrapper.Method",
                      "_next": null,
                      "name": "boxcox1p",
                      "disable_mask": [],
                      "method": "scipy.special.boxcox1p",
                      "xname": 0,
                      "yname": null,
                      "args": [
                        null,
                        0.15
                      ],
                      "kargs": {}
                    }
                  }
                },
                "2": {
                    "_type": "skll.block.sklwrapper.SklClass",
                    "_next": null,
                    "name": "ordinal",
                    "disable_mask": [],
                    "cls": "sklearn.preprocessing.OrdinalEncoder",
                    "trainmethod": null,
                    "testmethod": null,
                    "scoremethod": null,
                    "initargs": [],
                    "initkargs": {}
                }
            },
            "next": {
                "_type": "skll.block.sklwrapper.SklClass",
                "_next": null,
                "name": "randf",
                "disable_mask": [],
                "cls": "sklearn.ensemble.RandomForestRegressor",
                "trainmethod": null,
                "testmethod": null,
                "scoremethod": null,
                "initargs": [],
                "initkargs": {
                  "n_estimators": 100,
                  "random_state": 0
                }
            }
        }
    }
}

var model = new Parent({
    name: "root",
    children: [
        new DataFrame({name: "input"}),
        new Split({
            name: "ct1", 
            children: [
                {
                    name: "text1, text2",
                    children: [
                        new Block({
                            name: "OHE1",
                            type: "onehotencoder"
                        }),
                    ],
                },
                {
                    name: "num1, num2, num3",
                    children: [
                        new Block({
                            name: "IMP1",
                            type: "imputer"
                        }),
                        new Block({
                            name: "SCL1",
                            type: "scaler"
                        }),
                    ],
                }
            ]
        }),
        new Block({
            name: "SVC1",
            type: "svc"
        }),
    ]
});

// var model = new Parent({
//     name: "model1",
//     blocks: [
//         new DataFrame({name: "input"}),
//         new Split({
//             name: "ct1", 
//             children: [
//                 {
//                     name: "text1, text2",
//                     blocks: [
//                         new Block({
//                             name: "OHE1",
//                             type: "onehotencoder"
//                         }),
//                     ],
//                 },
//                 {
//                     name: "num1, num2, num3",
//                     blocks: [
//                         new Block({
//                             name: "IMP1",
//                             type: "imputer"
//                         }),
//                         new Block({
//                             name: "SCL1",
//                             type: "scaler"
//                         }),
//                     ],
//                 }
//             ]
//         }),
//         new Block({
//             name: "SVC1",
//             type: "svc"
//         }),
//     ]
// });
window.model = model;
const dropzones = () => {
    const ondragexit = (e) => {
        if (e.target != e.currentTarget) return;
        $(".newobj").remove();
        $(".mainblock").off("dragleave").off("dragend").off("drop");
        $(document).data("droptarget", false);
        $(".droptarget").removeClass("droptarget");
    }
    document.querySelectorAll("main").forEach((inputElement) => {
        ["dragleave", "dragend"].forEach((type) => {
            inputElement.addEventListener(type, ondragexit);
        });
    });

    document.querySelectorAll(".mainblock").forEach((inputElement) => {
        inputElement.addEventListener("dragover", (e) => {
            if (!e.dataTransfer) return;
            if (e.dataTransfer.items[0].kind != "file") return;
            e.preventDefault();
            if ($(".newobj").length) {
                return;
            }
            const layer = new DataFrame();
            layer.render();
            layer.$div.addClass("newobj").appendTo($("body"));
            layer.begindrag();
        });
        inputElement.addEventListener("drop", (e) => {
            e.preventDefault();
            $("main").off("dragleave").off("dragend");
            $(".mainblock").off("drop");
            if (e.dataTransfer && e.dataTransfer.files.length) {
                const file = e.dataTransfer.files[0];
                const ext = file.name.split(".").pop();
                if (DataFrame.canHandleType(ext)) {
                    Block.setfiledrop(file);
                    Block.onmouseup(e);
                    return;
                }
            }
            e.preventDefault();
            ondragexit(e);
        })
    });
}
const init = () => {
    $(".tabView").tabs();
    Log.panel.appendTo("body");
    Log.prompt.appendTo("body");
    EditDialog.dialog.appendTo("body");
    FileBrowser.panel.attr("id", "filesPane").addClass("tabPanel").appendTo("#toolbox");
    
    model.render().appendTo("main");
    model.$div.addClass("mainblock");
    //dropzones();
    const $toolbox = $("#methodsPane");
    ["Input", "OneHotEncoder", "SimpleImputer", "StandardScaler", "DBSCAN", "LinearRegression", "LogisticRegression"].forEach(v => {
        $("<a href='#'>").addClass("layertools").data("type", v).html(v).appendTo($toolbox);
    });
    $(".layertools").on("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = $(e.delegateTarget).data("type");
        const layer = new Block({
            name: type,
            type: type
        });
        layer.render();
        layer.$div.addClass("newobj").appendTo($("body"));
        layer.begindrag();
    });
    $("#trash").on("mouseover", () => {
        const oldtgt = $(document).data("droptarget");
        if (oldtgt) oldtgt.$div.removeClass("dropafter dropinto");
        $(document).data("droptarget", "trash");
        $("#trash").addClass("dropinto");
    }).on("mouseout", () => {
        $("#trash").removeClass("dropinto");
        if ($(document).data("droptarget") == "trash") {
            $(document).data("droptarget", false);
        }
    })
}

$(document).ready(() => {
    init();
});