import Log from "./Log.mjs"

class WsClient {

    async send(action, param) {
        if (this.working) {
            Log.log("err", "Work is in progress");
            return;
        }
        if (this.ws.readyState != WebSocket.OPEN) {
            Log.log("err", "Not connected");
            return;
        }
        this.working = true;
        const self = this;
        return new Promise((res, rej) => {
            this.ws.onmessage = (e) => {
                let msg;
                try {
                    msg = JSON.parse(e.data);
                } catch (e) {
                    Log.log("err", "Invalid response from remote");
                    rej({});
                    return;
                }
                let progress = msg["progress"];
                var pval = false;
                if (progress) 
                    pval = progress;
                const result = msg["result"];
                if (result < 0) {
                    Log.hideDialog();
                    if (msg["message"]) 
                        Log.log("err", "Remote: " + msg["message"]);
                    rej(msg);
                    self.working = false;
                } else if ((result == 0)||(result==4)) { //completed | continue
                    if (result == 0) Log.hideDialog();
                    if (msg["message"]) {
                        Log.log("stream0", "Remote: " + msg["message"]);
                        if (result == 4)
                            Log.dialog(msg["message"], progress);
                    }
                    res(msg);
                    self.working = false;
                } else if (result == 1) { 
                    //1:info, 4:Logger
                    Log.dialog(msg["message"]);
                    Log.log("stream1", "Remote: " + msg["message"]);
                } else if ((result == 2)||(result == 3)) { 
                    //2: stdout, 3: stderr
                    stream = "stream" + result;
                    lastline = Log.write(stream, msg["message"]);
                    if (lastline != "") Log.dialog(oldmsg, pval);
                }
            }
            if (!param) {
                param = {};
            }
            param["action"] = action;
            param = JSON.stringify(param);
            this.ws.send(param);
        });
    }
    async upload(file) {
        const reader = new FileReader();
        let uploaded=0;
        let nextChunk=0;
        const chunkSize=512*1024;
        let finalResolve = null;
        let finalReject = null;

        reader.onload = (e) => {
            const param = {
                "data": e.target.result,
                "flag": uploaded===0?"begin":"continue",
                "size": file.size,
                "name": file.name,
            }
            uploaded += nextChunk;
            this.send('put', param).then(r => {
                next();
            }).catch(r => {
                finalReject(r);
            });
        }
        
        const next = () => {
            const blob = file.slice(uploaded, uploaded + chunkSize);
            nextChunk = blob.size;
            if (blob.size) {
                reader.readAsDataURL(blob);
            } else {
                const param = {
                    "size": file.size,
                    "flag": "end",
                    "name": file.name,
                }
                this.send('put', param).then(r => {
                    finalResolve(r);
                }).catch(r => {
                    finalReject(r);
                });
            }
        }
        return new Promise((res, rej) => {
            finalResolve = res;
            finalReject = rej;
            next();
        });
    }

    constructor() {
        const self = this;
        if (WsClient.instance) {
            return WsClient.instance;
        }
        this.working = false;
        this.ws = new WebSocket('ws://' + location.host + '/ws');
        this.ws.onopen = function() {
            Log.log("msg", 'Connected.');
            setTimeout(() => {
                self.send("ping");
            }, 100);
        };
        this.ws.onerror = function() {
            Log.log("err", "Websocket error occured.");
        }
        this.ws.onclose = function(e) {
            Log.log("err", 'Connection closed with code ' + e.code);
            Log.dialog("Connection closed, please refresh browser to reconnect.")
        };
        //this.ws.onmessage = this.#onwsmessage;
        WsClient.instance = this;
    }
}

const instance = new WsClient();
Object.seal(instance);
export default instance;