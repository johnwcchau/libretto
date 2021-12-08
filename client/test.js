import {Block, BlockSet, BlockSplit} from './modules/BaseBlock.mjs';
import {DataFrame} from "./modules/DataFrame.mjs"
import Log from "./modules/Log.mjs"
import EditDialog from "./modules/EditDialog.mjs"
import FileBrowser from "./modules/FileBrowser.mjs"
import WsClient from "./modules/WsClient.mjs"

var model = new BlockSet({
    name: "model1",
    blocks: [
        new Block({name: "input", type: "input"}),
        new BlockSplit({
            name: "ct1", 
            splits: [
                {
                    name: "text1, text2",
                    blocks: [
                        new Block({
                            name: "OHE1",
                            type: "onehotencoder"
                        }),
                    ],
                },
                {
                    name: "num1, num2, num3",
                    blocks: [
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
    Log.panel.appendTo("body");
    Log.prompt.appendTo("body");
    EditDialog.dialog.appendTo("body");
    FileBrowser.panel.appendTo("body");
    
    model.render().appendTo("main");
    model.$div.addClass("mainblock");
    dropzones();
    const $toolbox = $("#toolbox");
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
        if (oldtgt) oldtgt.$div.removeClass("droptarget");
        $(document).data("droptarget", "trash");
        $("#trash").addClass("droptarget");
    }).on("mouseout", () => {
        $("#trash").removeClass("droptarget");
        if ($(document).data("droptarget") == "trash") {
            $(document).data("droptarget", false);
        }
    })
}

$(document).ready(() => {
    init();
});