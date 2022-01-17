import {Trash} from './modules/BaseBlock.mjs';
import { LogPanel } from './modules/LogPanel.mjs';
import TabView from "./modules/TabView.mjs";
import EditDialog from "./modules/EditDialog.mjs";
import FileBrowser from "./modules/FileBrowser.mjs";
import MethodBrowser from "./modules/MethodBrowser.mjs";
import getCurrentSession from "./modules/Session.mjs";
import MainToolbar from './modules/Toolbar.mjs';
import PlotDialog from "./modules/PlotDialog.mjs";
import {} from "./modules/pyjs.mjs";
import plugin_css from "/plugin/plugins.mjs";


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
    plugin_css();
    $("body").html("");
    $(`
        <div id="root" class="flex-column">
            <div class="flex-row" id="main-pane">
            </div>
        </div>
    `).appendTo("body");
    MainToolbar.init().panel.prependTo("#root");
    const toolbox = new TabView();
    toolbox.panel.attr("id", "toolbox").appendTo("#main-pane");
    toolbox.addTab("Files", "/static/img/attachment_black_24dp.svg", FileBrowser.panel, false);
    toolbox.addTab("Blocks", "/static/img/functions_black_24dp.svg", MethodBrowser.refresh().panel, false);
    const container = $('<div id="option-container" class="option-container">').data("tabView", toolbox);
    toolbox.addTab("Options", "/static/img/settings_black_24dp.svg", container, false);
    EditDialog.container = container;
    PlotDialog.container = container;
    toolbox.showTab(FileBrowser.panel.attr("id"));

    getCurrentSession().panel.appendTo(".flex-row");
    setTimeout(()=>{
        $("#tb_methods").click();
        $("#tb_files").click();
    }, 1);
    
    new Trash().render().appendTo("body");

    $(document).trigger("plugin.load");
}

$(document).ready(() => {
    init();
});