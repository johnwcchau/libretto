import Session from "./Session.mjs";
import TableDialog from "./TableDialog.mjs";

export default function addbtn(spec) {
    const $li = $("<li>").appendTo("#toolbar");
    const $a = $('<a href="#">').appendTo($li);
    if (spec.icon) $(`<img src="${spec.icon}" alt="${spec.title}">`).appendTo($a);
    else if (spec.title) $a.html(spec.title);
    if (spec.click) $a.on("click", spec.click);
}
function addObj($obj) {
    const $li = $("<li>").appendTo("#toolbar");
    $obj.appendTo($li);
}

addbtn({
    title: "New model",
    click: () => {
        Session.reset();
    },
});
addbtn({
    title: "Read from runtime",
    click: () => {
        Session.load();
    },
});
addbtn({
    title: "Upload to runtime",
    click: () => {
        Session.dump();
    }
});
addbtn({
    title: "Save local",
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
    click: () => {
        Session.run($("#runmode").val(), null, "table").then(r=>{
            const data = r.data;
            const dialog = TableDialog.render(data);
            setTimeout(()=> {
                dialog.modal();
            }, 1);
        });
    }
})