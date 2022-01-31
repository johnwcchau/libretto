/**
 *  Plugin client side file
 *  This file automatically loads when browser connect
 *  Include additional mjs module by:
 *     import ... from "./<mjs file>.mjs";
 *  or for built-in classes:
 *     import ... from "/static/modules/..."
 * 
 *  In addition, files and resources (except py and pyc file) of this plugin can be 
 *  accessed by browser with absolute url "/plugin/<plugin-name>/..."
 * 
 */
import MainToolbar from '/static/modules/Toolbar.mjs';
import getCurrentSession from '/static/modules/Session.mjs';
import {BlockTypes, Block} from '/static/modules/BaseBlock.mjs';

//add block definition
new BlockTypes().add({
    // NOTE: this is only an identifer and can be any unique name
    "libretto.plugin.example.block.ExampleBlock": {
        pytype: "libretto.plugin.example.block.ExampleBlock", // python block class
        cls: Block, // UI class
        typename: "Example block", // Name to be displayed on method browser
        group: "Example", // Method browser group, sub-level seperated by dot, e.g. Parent.Folder.Child
        desc: "An example fillna block", // Description of this block
        childof: "libretto.baseblock.Block", // Inherits definitions from this block
        properties: { // __init__() arguments for python class
            "value_to_use": { // name of the property
                desc: "Value to fill in for any missing cells",
                type: "number", // or string, boolean, column, file, see others for more
                default: 0, // placeholder should this field left empty in edit panel
                hidden: false, // should this be shown in parameter edit panel
                dictKeyOf: null, // name of the dictionary should this properties be actually a part of a dictionary
                listItemOf: null, // name of the list should this properties be actually a part of a list
                listIndex: null, // index in the list, if this propeties is part of it
            },
            // more here...
        },
        defaults: { // default values to be set for properties
            "value_to_use": 0,
        },
        events: { 
            // events handler for UI interaction, 
            // this shouldn't have existed as this supposed to be a static definition

        },
    }
});

//run after main script init
$(document).on("plugin.load", ()=>{
    MainToolbar.addbtn({
        title: "Example plugin",
        icon: null,
        click: () => {
            getCurrentSession().WsClient
                .send("libretto.plugin.example::call_server_side", {message: "Hello from client side!"})
                .then(response => {
                    alert(`Response from plugin:\n\n${response.message}`);
                });
        },
    });
});
