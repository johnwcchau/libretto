import {Trash} from './modules/BaseBlock.mjs';
import {} from "./modules/pyjs.mjs";
import Log from "./modules/Log.mjs";
import EditDialog from "./modules/EditDialog.mjs";
import TableDialog from "./modules/TableDialog.mjs";
import FileBrowser from "./modules/FileBrowser.mjs";
import MethodBrowser from "./modules/MethodBrowser.mjs";
import addbtn from './modules/maintoolbar.mjs';
import Session from "./modules/Session.mjs";

window.Session = Session;

// const dropzones = () => {
//     const ondragexit = (e) => {
//         if (e.target != e.currentTarget) return;
//         $(".newobj").remove();
//         $(".rootblock").off("dragleave").off("dragend").off("drop");
//         $(document).data("droptarget", false);
//         $(".droptarget").removeClass("droptarget");
//     }
//     document.querySelectorAll("main").forEach((inputElement) => {
//         ["dragleave", "dragend"].forEach((type) => {
//             inputElement.addEventListener(type, ondragexit);
//         });
//     });

//     document.querySelectorAll(".rootblock").forEach((inputElement) => {
//         inputElement.addEventListener("dragover", (e) => {
//             if (!e.dataTransfer) return;
//             if (e.dataTransfer.items[0].kind != "file") return;
//             e.preventDefault();
//             if ($(".newobj").length) {
//                 return;
//             }
//             const layer = new DataFrame();
//             layer.render();
//             layer.$div.addClass("newobj").appendTo($("body"));
//             layer.begindrag();
//         });
//         inputElement.addEventListener("drop", (e) => {
//             e.preventDefault();
//             $("main").off("dragleave").off("dragend");
//             $(".rootblock").off("drop");
//             if (e.dataTransfer && e.dataTransfer.files.length) {
//                 const file = e.dataTransfer.files[0];
//                 const ext = file.name.split(".").pop();
//                 if (DataFrame.canHandleType(ext)) {
//                     Block.setfiledrop(file);
//                     Block.onmouseup(e);
//                     return;
//                 }
//             }
//             e.preventDefault();
//             ondragexit(e);
//         })
//     });
// }
const init = () => {
    $(".tabView").tabs();
    Log.panel.appendTo("body");
    Log.prompt.appendTo("body");
    EditDialog.dialog.appendTo("body");
    TableDialog.dialog.appendTo("body");
    FileBrowser.panel.attr("id", "filesPane").addClass("tabPanel").appendTo("#toolbox");
    MethodBrowser.panel.attr("id", "methodsPane").addClass("tabPanel").appendTo("#toolbox");
    setTimeout(()=>{
        $("#tb_methods").click();
        $("#tb_files").click();
    }, 1);
    
    new Trash().render().appendTo("body");

    Session.$dom = $("main");
}

$(document).ready(() => {
    init();
});