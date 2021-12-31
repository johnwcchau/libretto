import {ColumnSelector} from "./ColumnSelector.mjs";

class EditDialog {
    createLabel(for_id, desc) {
        return $(`<label class="editlabel" for="${for_id}">`).html(desc);
    }
    createJsonRow(layer, name, prop) {
        const $row = $("<li>").addClass("editrow");
        this.createLabel(`edit_${name}`, name).appendTo($row);
        this.createLabel(`edit_${name}`, prop.desc).appendTo($row);
        $(`<textarea name="edit_${name}" id="edit_${name}" placeholder="${prop.desc}">`)
            .addClass("edittextarea")
            .data("id", name)
            .val(JSON.stringify(layer[name], null, 2))
            .prop("disabled", !prop.enabled)
            .appendTo($row);
        return $row;
    }
    createColumnListRow(layer, name, prop, multiple) {
        const $row = $("<li>").addClass("editrow");
        const mode = (prop.type == "list(datatype)") ? "datatype" : "column";
        this.createLabel(`edit_${name}`, name).appendTo($row);
        this.createLabel(`edit_${name}`, prop.desc).appendTo($row);
        new ColumnSelector(layer, layer[name], mode, multiple).panel
            .attr("id", `edit_${name}`)
            .attr("name", `edit_${name}`)
            .data("id", name)
            .prop("disabled", !prop.enabled)
            .appendTo($row);
        return $row;
    }
    createTextRow(layer, name, prop) {
        const $row = $("<li>").addClass("editrow");
        this.createLabel(`edit_${name}`, name).appendTo($row);
        this.createLabel(`edit_${name}`, prop.desc).appendTo($row);
        $(`<input type="text" name="edit_${name}" id="edit_${name}" placeholder="${prop.desc}">`)
            .addClass("edittext")
            .data("id", name)
            .val(layer[name])
            .prop("disabled", !prop.enabled)
            .appendTo($row);
        return $row;
    }
    createNumberRow(layer, name, prop) {
        const $row = $("<li>").addClass("editrow");
        this.createLabel(`edit_${name}`, name).appendTo($row);
        this.createLabel(`edit_${name}`, prop.desc).appendTo($row);
        $(`<input type="number" name="edit_${name}" id="edit_${name}" placeholder="${prop.desc}">`)
            .addClass("editnum")
            .data("id", name)
            .val(layer[name])
            .prop("disabled", !prop.enabled)
            .appendTo($row);
        return $row;
    }
    createBooleanRow(layer, name, prop) {
        const $row = $("<li>").addClass("editrow");
        this.createLabel(`edit_${name}`, name).appendTo($row);
        this.createLabel(`edit_${name}`, prop.desc).appendTo($row);
        $(`<input type="checkbox" name="edit_${name}" id="edit_${name}">`)
            .addClass("editchk")
            .data("id", name)
            .prop("checked", layer[name])
            .prop("disabled", !prop.enabled)
            .appendTo($row);
        return $row;
    }
    createMCRow(layer, name, prop) {
        const $row = $("<li>").addClass("editrow");
        this.createLabel(`edit_${name}`, name).appendTo($row);
        this.createLabel(`edit_${name}`, prop.desc).appendTo($row);
        const $fields = $(`<span>`).addClass("editmcs").appendTo($row);
        var choices = prop.type.split('(', 2);
        if (choices.length > 1) {
            choices = choices[1];
            choices = choices.substring(0, choices.length - 1).split(",");
            choices.forEach((v, i)=>{
                $(`<input type="checkbox" name="edit_${name}[${v}]" id="edit_${name}_${v}">`)
                .addClass(`editchk editchk_${name}`)
                .data("id", name)
                .data("val", v)
                .prop("checked", layer[name] && (layer[name].indexOf(v) != -1))
                .prop("disabled", !prop.enabled)
                .appendTo($fields);
                this.createLabel(`edit_${name}[${v}]`, v).appendTo($fields);
            });
        }
        return $row;
    }
    createToolbar() {
        return $("<div>").addClass("toolbar");
    }
    createEditDialog(layer) {
        const $dialog = this._dialog.html("").data("layer", layer);
        const $toolbar = this.createToolbar().appendTo($dialog);
        $("<a href='#'>").addClass("edit-apply").html("Apply").on("click", {thiz: layer, dialog: this}, (e)=> {
            let res = true;
            Object.entries(layer._properties).forEach(([name, v]) => {
                if (!v.enabled) return;
                switch(v.type.split("(")[0]) {
                    case "list":
                    case "dict":
                        if ((v.type=="list(column)")||(v.type == "list(datatype)")) {
                            layer[name] = $(`#edit_${name}`).data("thiz").json();
                        } else {
                            try {
                                const t = $(`#edit_${name}`).removeClass("invalid-val").val();
                                const val = JSON.parse(t == "" ? null : t);
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
                        break;
                    case "boolean":
                        layer[name] = $(`#edit_${name}`).prop("checked");
                        break;
                    case "mc":
                        let r = [];
                        $(`.editchk_${name}`).each((i, v) => {
                            if ($(v).prop("checked")) r.push($(v).data("val"));
                        })
                        layer[name] = r;
                        break;
                    case "number":
                        try {
                            layer[name] = parseFloat($(`#edit_${name}`).removeClass("invalid-val").val());
                        } catch (e) {
                            console.log(e);
                            $(`#edit_${name}`).addClass("invalid-val");
                            res = false;
                            return;
                        }
                    case "string":
                    default:
                        layer[name] = $(`#edit_${name}`).val();
                        break;
                }
            });
            if (!res) return;
            e.data.dialog._dialog.removeClass("shown");
            e.data.thiz.onEditApplied();
            
        }).appendTo($toolbar);
        $("<a href='#'>").addClass("edit-cancel").html("Cancel").on("click", {thiz: this}, (e)=> {
            e.data.thiz._dialog.removeClass("shown");
        }).appendTo($toolbar);
        $("<h2>").html(layer._typename ? layer._typename : layer._type).appendTo($dialog);
        const $root = $("<ul>").addClass("editgroup").appendTo($dialog);
        Object.entries(layer._properties).forEach(([name, v]) => {

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
                default:
                    this.createTextRow(layer, name, v).appendTo($root);
                    break;
            }
        });
        return $dialog;
    }
    constructor() {
        if (EditDialog.instance) {
            return EditDialog.instance;
        }

        this._dialog = $("<dialog>")
            .attr("id", "edit_dialog");
        EditDialog.instance = this;
    }
    get dialog() {
        return this._dialog;
    }
}

const instance = new EditDialog();
Object.seal(instance);
export default instance;