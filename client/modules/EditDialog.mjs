import {ColumnSelector} from "./ColumnSelector.mjs";

class EditDialog {
    createLabel(for_id, desc, cls="label") {
        return $(`<label class="${cls}" for="${for_id}">`).html(desc);
    }
    createRow(name, prop) {
        const $row = $("<li>").addClass("editrow");
        this.createLabel(`edit_${name}`, name, "name-label").appendTo($row);
        this.createLabel(`edit_${name}`, prop.desc, "desc-label").appendTo($row);
        return $row;
    }
    createJsonRow(layer, name, prop) {
        const $row = this.createRow(name, prop);
        $(`<textarea name="edit_${name}" id="edit_${name}" placeholder="null">`)
            .addClass("edittextarea")
            .val((layer[name] === null) ? "" : JSON.stringify(layer[name], null, 2))
            .prop("disabled", prop.disabled)
            .appendTo($row);
        return $row;
    }
    createColumnListRow(layer, name, prop, multiple) {
        const $row = this.createRow(name, prop);
        const mode = (prop.type == "list(datatype)") ? "datatype" : "column";
        const selector = new ColumnSelector(layer[name], mode, multiple);
        this.colsels.push(selector);
        selector.panel
            .attr("id", `edit_${name}`)
            .attr("name", `edit_${name}`)
            .prop("disabled", prop.disabled)
            .appendTo($row);
        return $row;
    }
    createTextRow(layer, name, prop) {
        const $row = this.createRow(name, prop);
        $(`<input type="text" name="edit_${name}" id="edit_${name}">`)
            .addClass("edittext")
            .val(layer[name])
            .attr("placeholder", prop.default)
            .prop("disabled", prop.disabled)
            .appendTo($row);
        return $row;
    }
    createNumberRow(layer, name, prop) {
        const $row = this.createRow(name, prop);
        $(`<input type="number" name="edit_${name}" id="edit_${name}">`)
            .addClass("editnum")
            .val(layer[name])
            .attr("placeholder", prop.default)
            .prop("disabled", prop.disabled)
            .appendTo($row);
        return $row;
    }
    createBooleanRow(layer, name, prop) {
        const $row = this.createRow(name, prop);
        // $(`<input type="checkbox" name="edit_${name}" id="edit_${name}">`)
        //     .addClass("editchk")
        //     .prop("checked", layer[name])
        //     .prop("disabled", prop.disabled)
        //     .appendTo($row);
        const $select = $(`<select name="edit_${name}" id="edit_${name}">`)
            .addClass("edit-select")
            .prop("disabled", prop.disabled)
            .appendTo($row);
        const $none = $(`<option value="">(None)</option>`).appendTo($select);
        const $false = $(`<option value="false">False</option>`).appendTo($select);
        const $true = $(`<option value="true">True</option>`).appendTo($select);
        switch (layer[name]) {
            case true:
                $true.prop("selected", true);
                break;
            case false:
                $false.prop("selected", true);
                break;
            case undefined:
                $none.prop("selected", true);
                break;
        }
        return $row;
    }
    createMCRow(layer, name, prop) {
        const $row = this.createRow(name, prop);
        const $fields = $(`<span>`).addClass("editmcs").appendTo($row);
        var choices = prop.type.split('(', 2);
        if (choices.length > 1) {
            choices = choices[1];
            choices = choices.substring(0, choices.length - 1).split(",");
            choices.forEach((v, i)=>{
                $(`<input type="checkbox" name="edit_${name}[${v}]" id="edit_${name}_${v}">`)
                .addClass(`editchk editchk_${name}`)
                .prop("value", v)
                .prop("checked", layer[name] && (layer[name].indexOf(v) != -1))
                .prop("disabled", prop.disabled)
                .appendTo($fields);
                this.createLabel(`edit_${name}[${v}]`, v).appendTo($fields);
            });
        }
        return $row;
    }
    createOptionRow(layer, name, prop) {
        const $row = this.createRow(name, prop);
        const $select = $(`<select name="edit_${name}" id="edit_${name}">`)
            .addClass("edit-select")
            .prop("disabled", prop.disabled)
            .appendTo($row);
        $(`<option value="">(None)</option>`).appendTo($select);
        var choices = prop.type.split('(', 2);
        if (choices.length > 1) {
            choices = choices[1];
            choices = choices.substring(0, choices.length - 1).split(",");
            choices.forEach((v, i)=>{
                v = v.trim();
                $(`<option value="${v}">${v}</option>`)
                .prop("selected", layer[name] && (layer[name] == v))
                .appendTo($select);
            });
        }
        return $row;
    }
    createToolbar() {
        return $("<div>").addClass("toolbar");
    }
    async #resolveColumnNames(layer) {
        layer.session.run("COLUMNS", layer, "columns").then((r) => {
            if (!r) return;
            this.colsels.forEach(v => {
                v.render(r.columns);
            });
        });
    }
    static #applyHandler(e) {
        let res = true;
        const layer = e.data.thiz;
        const dialog = e.data.dialog;
        let val;
        Object.entries(layer._properties).forEach(([name, v]) => {
            if (v.disabled || v.hidden) return;
            switch(v.type.split("(")[0]) {
                case "list":
                case "dict":
                    if ((v.type=="list(column)")||(v.type == "list(datatype)")) {
                        layer[name] = $(`#edit_${name}`).data("thiz").json();
                    } else {
                        try {
                            const t = $(`#edit_${name}`).removeClass("invalid-val").val();
                            val = JSON.parse(t == "" ? null : t);
                            layer[name] = val;
                        } catch (e) {
                            console.log(e);
                            $(`#edit_${name}`).addClass("invalid-val");
                            res = false;
                            return;
                        }
                    }
                    break;
                case "column":
                    layer[name] = $(`#edit_${name}`).val();
                    break;
                case "boolean":
                    val = $(`#edit_${name}`).val();
                    switch(val) {
                        case "true":
                            layer[name] = true;
                            break;
                        case "false":
                            layer[name] = false;
                            break;
                        default:
                            layer[name] = null;
                    }
                    break;
                case "option":
                    val = $(`#edit_${name}`).val();
                    if (val == "") val = null;
                    layer[name] = val;
                    break;
                case "mc":
                    let r = [];
                    $(`.editchk_${name}`).each((i, v) => {
                        if ($(v).prop("checked")) r.push($(v).prop("value"));
                    })
                    layer[name] = r;
                    break;
                case "number":
                    try {
                        val = $(`#edit_${name}`).val();
                        if (val == "") val = null;
                        else val = parseFloat($(`#edit_${name}`).removeClass("invalid-val").val());
                        layer[name] = val;
                    } catch (e) {
                        console.log(e);
                        $(`#edit_${name}`).addClass("invalid-val");
                        res = false;
                        return;
                    }
                case "string":
                    val = $(`#edit_${name}`).val();
                    if (val == "") val = null;
                    layer[name] = val;
                    break;
                default:
                    try {
                        const t = $(`#edit_${name}`).removeClass("invalid-val").val();
                        val = JSON.parse(t == "" ? null : t);
                        layer[name] = val;
                    } catch (e) {
                        console.log(e);
                        $(`#edit_${name}`).addClass("invalid-val");
                        res = false;
                    }
                    break;
            }
        });
        if (!res) return;
        //dialog._dialog.removeClass("shown");
        dialog._dialog.html("");
        layer.onEditApplied();
    }
    cancel() {
        this.dialog.html("").detach();
    }
    createEditDialog(layer) {
        if (!this.container) return;
        this.container.html("");
        const $dialog = this._dialog.html("").data("layer", layer);
        const $toolbar = this.createToolbar().appendTo($dialog);
        this.colsels = [];
        layer.displaySelected();
        $("<a href='#'>").addClass("edit-apply").html("Apply").on("click", {thiz: layer, dialog: this}, EditDialog.#applyHandler).appendTo($toolbar);
        $("<a href='#'>").addClass("edit-cancel").html("Cancel").on("click", {thiz: this}, (e)=> {
            layer.displayUnselected(null);
            e.data.thiz.cancel();
        }).appendTo($toolbar);
        $("<h2>").html(layer.name).appendTo($dialog);
        $("<h3>").html(layer._typename ? layer._typename : layer._type).appendTo($dialog);
        const $root = $("<ul>").addClass("editgroup").appendTo($dialog);
        Object.entries(layer._properties).forEach(([name, v]) => {
            if (v.hidden) return;

            switch(v.type.split("(")[0]) {
                case "number":
                    this.createNumberRow(layer, name, v).appendTo($root);
                    break;
                case "boolean":
                    this.createBooleanRow(layer, name, v).appendTo($root);
                    break;
                case "mc":
                    this.createMCRow(layer, name, v).appendTo($root);
                    break;
                case "option":
                    this.createOptionRow(layer, name, v).appendTo($root);
                    break;
                case "column":
                    this.createColumnListRow(layer, name, v, false).appendTo($root);
                    break;
                case "list":
                case "dict":
                    if ((v.type=="list(column)")||(v.type=="list(datatype)")) {
                        this.createColumnListRow(layer, name, v, true).appendTo($root);
                    } else
                        this.createJsonRow(layer, name, v).appendTo($root);
                    break;
                case "string":
                    this.createTextRow(layer, name, v).appendTo($root);
                    break;
                default:
                    this.createJsonRow(layer, name, v).appendTo($root);
                    break;
            }
        });
        if (this.colsels.length) {
            this.#resolveColumnNames(layer);
        }
        $dialog.appendTo(this.container);
        this.container.data("tabView").showTab(this.container.attr("id"));
        return $dialog;
    }
    constructor() {
        if (EditDialog.instance) {
            return EditDialog.instance;
        }
        this.container = null;
        this.colsels = [];
        this._dialog = $("<div>").addClass("edit-dialog");
        EditDialog.instance = this;
    }
    get dialog() {
        return this._dialog;
    }
}

const instance = new EditDialog();
Object.seal(instance);
export default instance;