class EditDialog {
    createLabel(for_id, desc) {
        return $(`<label class="editlabel" for="${for_id}">`).html(desc);
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
                .addClass("editchk")
                .data("id", name)
                .data("val", v)
                .prop("checked", layer[name].indexOf(v) != -1)
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
        $("<a href='#'>").addClass("editapply").html("Apply").on("click", {thiz: layer}, (e)=> {
            $.modal.close();
            e.data.thiz.onEditApplied();
        }).appendTo($toolbar);
        $("<h2>").html(layer._type).appendTo($dialog);
        const $root = $("<ul>").addClass("editgroup").appendTo($dialog);
        Object.keys(layer._properties).forEach(name => {
            const v = layer._properties[name];
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
            .attr("id", "edit_dialog")
            .addClass("modal");
        EditDialog.instance = this;
    }
    get dialog() {
        return this._dialog;
    }
}

const instance = new EditDialog();
Object.seal(instance);
export default instance;