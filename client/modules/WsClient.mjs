import Log from "./Log.mjs"

class WsClient {

    #start() {
        if (this._current) {
            return;
        }
        if (this.ws.readyState != WebSocket.OPEN) {
            return;
        }
        this._current = this._workqueue.shift();
        if (!this._current) {
            return;
        }
        let param = this._current.param;
        const action = this._current.action;
        const res = this._current.res;
        const rej = this._current.rej;
        const self = this;

        this.ws.onmessage = (e) => {
            function _(res, rej) {
                let msg;
                try {
                    msg = JSON.parse(e.data);
                } catch (ex) {
                    Log.log("err", "Invalid response from remote");
                    rej({});
                    return true;
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
                    return true;
                } else if ((result == 0)||(result==4)) { //completed | continue
                    if (result == 0) Log.hideDialog();
                    if (msg["message"]) {
                        Log.log("stream0", "Remote: " + msg["message"]);
                        if (result == 4)
                            Log.dialog(msg["message"], progress);
                    }
                    res(msg);
                    return true;
                } else if (result == 1) { 
                    //1:info, 4:Logger
                    Log.dialog(msg["message"]);
                    Log.log("stream1", "Remote: " + msg["message"]);
                    return false;
                } else if ((result == 2)||(result == 3)) { 
                    //2: stdout, 3: stderr
                    stream = "stream" + result;
                    lastline = Log.write(stream, msg["message"]);
                    if (lastline != "") Log.dialog(oldmsg, pval);
                    return false;
                }
            }
            if (_(res, rej)) {
                this._current = null;
                setTimeout(() => {
                    self.#start();
                }, 1);
            }
        }
        if (!param) {
            param = {};
        }
        param["action"] = action;
        param = JSON.stringify(param);
        this.ws.send(param);
        
    }
    async send(action, param) {
        const promise = new Promise((res, rej) => {
            this._workqueue.push({
                action: action,
                param: param,
                res: res,
                rej: rej
            })
        });
        this.#start();
        return promise;
    }
    async uploadBlob(blob, fullname) {
        const reader = new FileReader();
        let finalResolve = null;
        let finalReject = null;
        
        reader.onload = (e) => {
            const param = {
                "data": e.target.result,
                "flag": "begin",
                "size": blob.size,
                "name": fullname,
            }
            this.send('put', param).then(r => {
                const param = {
                    "size": blob.size,
                    "flag": "end",
                    "name": fullname,
                }
                return this.send('put', param);
            }).then(r => {
                finalResolve(r);
            }).catch(r => {
                finalReject(r);
            });
        }
        
        return new Promise((res, rej) => {
            finalResolve = res;
            finalReject = rej;
            reader.readAsDataURL(blob);
        });
    }
    async upload(file, fullname) {
        const reader = new FileReader();
        let uploaded=0;
        let nextChunk=0;
        const chunkSize=512*1024;
        let finalResolve = null;
        let finalReject = null;
        if (!fullname) fullname = file.name;
        
        reader.onload = (e) => {
            const param = {
                "data": e.target.result,
                "flag": uploaded===0?"begin":"continue",
                "size": file.size,
                "name": fullname,
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
                    "name": fullname,
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
        this._workqueue = [];
        this._current = null;
        this.ws = new WebSocket('ws://' + location.host + '/ws/default');
        this.ws.onopen = function() {
            Log.log("msg", 'Connected.');
            setTimeout(() => {
                self.#start()
            }, 1);
        };
        this.ws.onerror = function() {
            Log.log("err", "Websocket error occured.");
        }
        this.ws.onclose = function(e) {
            Log.log("err", 'Connection closed with code ' + e.code);
            Log.dialog("Connection closed, please refresh browser to reconnect.")
        };
        this.send("ping");
        //this.ws.onmessage = this.#onwsmessage;
        WsClient.instance = this;
    }
}

const instance = new WsClient();
Object.seal(instance);
export default instance;