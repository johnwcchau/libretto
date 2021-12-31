import Session from "./Session.mjs";
import TableDialog from "./TableDialog.mjs";

export default function addbtn(spec) {
    const $li = $("<li>").appendTo("#toolbar");
    const $a = $('<a href="#">').appendTo($li);
    if (spec.icon) $(`<img src="${spec.icon}" title="${spec.title}">`).appendTo($a);
    else if (spec.title) $a.html(spec.title);
    if (spec.click) $a.on("click", spec.click);
}
function addObj($obj) {
    const $li = $('<li class="no-border">').appendTo("#toolbar");
    $obj.appendTo($li);
}

addObj($("<h3>SK-ll Editor</h3>"));
addbtn({
    title: "New model",
    icon: "/static/img/clear_black_24dp.svg",
    click: () => {
        Session.reset();
    },
});
addbtn({
    title: "Read from runtime",
    icon: "/static/img/cloud_download_black_24dp.svg",
    click: () => {
        Session.load();
    },
});
addbtn({
    title: "Upload to runtime",
    icon: "/static/img/cloud_upload_black_24dp.svg",
    click: () => {
        Session.dump();
    }
});
addbtn({
    title: "Save",
    icon: "/static/img/save_black_24dp.svg",
    click: () => {
        Session.save();
    }
})
addbtn({
    title: "Save local",
    icon: "/static/img/file_download_black_24dp.svg",
    click: () => {
        Session.saveLocal();
    }
});
addObj($(`
    <select id="runmode">
        <option value="PREVIEW">Preview</option>
        <option value="TRAIN">Train</option>
        <option value="TEST">Test</option>
        <option value="RUN">Run</option>
    </select>
`));
addbtn({
    title: "Run",
    icon: "/static/img/play_arrow_black_24dp.svg",
    click: () => {
        Session.run($("#runmode").val(), null, "table").then(r=>{
            if (!r) return;
            const data = r.data;
            const score = r.score;
            const dialog = TableDialog.render(data, score);
            setTimeout(()=> {
                dialog.modal();
            }, 1);
        });
    }
})