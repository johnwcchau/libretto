import Session from "./session.mjs";

export default function addbtn(spec) {
    const $li = $("<li>").appendTo("#toolbar");
    const $a = $('<a href="#">').appendTo($li);
    if (spec.img) $(`<img src="${img}" alt="${name}">`).appendTo($a);
    else if (spec.text) $a.html(spec.text);
    if (spec.click) $a.on("click", spec.click);
}

addbtn({
    text: "New model",
    click: () => {
        Session.reset();
    },
});
addbtn({
    text: "Read from runtime",
    click: () => {
        Session.load();
    },
});
addbtn({
    text: "Upload to runtime",
    click: () => {
        Session.dump();
    }
});
addbtn({
    text: "Save local",
    click: () => {
        Session.saveLocal();
    }
});