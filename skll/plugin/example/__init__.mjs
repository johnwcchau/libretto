/**
 *  Plugin client side file
 *  This file automatically loads when browser connect
 *  Include additional mjs module by:
 *     import ... from "./<mjs file>.mjs";
 *  or for built-in classes:
 *     impott ... from "/static/modules/..."
 * 
 *  In addition, files and resources (except py and pyc file) of this plugin can be 
 *  accessed by browser with absolute url "/plugin/<plugin-name>/..."
 * 
 */
import MainToolbar from '/static/modules/Toolbar.mjs';
import getCurrentSession from '/static/modules/Session.mjs';

//run after main script init
$(document).on("plugin.load", ()=>{
    MainToolbar.addbtn({
        title: "Example plugin",
        icon: null,
        click: () => {
            getCurrentSession().WsClient
                .send("skll.plugin.example::call_server_side", {message: "Hello from client side!"})
                .then(response => {
                    alert(`Response from plugin:\n\n${response.message}`);
                });
        },
    });
});