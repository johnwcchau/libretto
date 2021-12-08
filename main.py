from __future__ import annotations

import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.web import StaticFileHandler
from concurrent.futures import ThreadPoolExecutor

import signal
import sys
import os
import base64
import json
import traceback

import logging

from session import Session
session:Session = None

tpe = ThreadPoolExecutor(max_workers=2)

def new_session():
    global session
    logging.info("New session created")
    session = Session()

def attach_session(ws:WebSocketHandler):
    global session
    if session is None:
        new_session()
    if session._out.ws is None:
        session._out.ws = ws

def detach_session(ws:WebSocketHandler):
    global session
    if session is not None and session._out.ws == ws:
        session._out.ws = None

def get_session(ws:WebSocketHandler):
    global session
    if session is None:
        attach_session(ws)
    if session._out.ws != ws:
        return None
    return session

def json_decode(o):
    if isinstance(o, str):
        if o.lower() == "true":
            return True
        elif o.lower() == "false":
            return False
        else:
            try:
                return int(o)
            except ValueError:
                try:
                    return float(o)
                except ValueError:
                    return o
    elif isinstance(o, dict):
        return {k: json_decode(v) for k, v in o.items()}
    elif isinstance(o, list):
        return [json_decode(v) for v in o]
    else:
        return o

def json_encode(o):
    return o

def ls(session:Session, path:str="/", **kwargs):
    from glob import glob
    if not path.startswith("/") or not path.startswith('\\'): path = f'/{path}'
    if path.endswith('/') or path.endswith('\\'): path = path[:-1]
    storage_path = os.path.abspath(r"./storage")
    path = os.path.abspath(rf'./storage{path}')
    if not path.startswith(storage_path):
        session._out.invalid()
        return
    if not os.path.isdir(path):
        session._out.invalid()
        return
    parent = os.path.abspath(rf'{path}/../')
    if not parent.startswith(storage_path):
        parent = None
    results = []
    if parent:
        results.append(("..", True))
    objs = glob(f'{path}/*')
    for obj in objs:
        results.append((obj.replace(path, "").replace("\\", "/")[1:], os.path.isdir(obj)))
    session._out.finished(param={
        "cd": path.replace(storage_path, "").replace("\\", "/"),
        "objs": results,
    })

def exist(session:Session, path:str=None, **kwargs):
    if not path:
        session._out.invalid()
        return
    upload_path = os.path.abspath(r"./storage")
    query_path = os.path.abspath(rf'./storage/{path}')
    if not query_path.startswith(upload_path):
        session._out.invalid()
        return
    session._out.finished(param={
        "exist": os.path.exists(query_path)
    })

def put(session:Session, name:str="temp", data:str=None, flag:str=None, size:int=0, **kwargs):
    if not flag or (not data and flag != "end"):
        session._out.invalid()
        return
    if data:
        data = data.split(';base64')[1].encode('utf-8')
        data = base64.b64decode(data)
    fname = f'./storage/{name}'
    try:
        if flag=="begin":
            with open(fname, 'wb') as file:
                file.write(data)
        elif flag=="continue":
            with open(fname, 'ab') as file:
                file.write(data)
        elif flag == "end":
            if not size:
                session._out.invalid()
            elif os.path.getsize(fname) != size:
                session._out.error("Upload size mismatch")
            else:
                session._out.finished("Upload success")
            return
        if size:
            progress = os.path.getsize(fname) / size
        else:
            progress = 0
    except Exception:
        traceback.print_exc()
        session._out.error("Server side error")
    session._out.cont("Uploading", {"progress": progress})

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        attach_session(self)
        logging.info("WS Opened")
    
    def on_close(self):
        detach_session(self)
        logging.info("WS Closed")
    
    def __send_message(self, _id, msg, param=None):
        if param is None:
            param = {}

        param["result"] = _id
        param["message"] = msg
        msg = json.dumps(param, default=json_encode)
        logging.debug(f'<<{msg}')
        self.write_message(msg)

    def send_message(self, status=-1000, msg=None, param=None):
        global ioloop
        ioloop.add_callback(self.__send_message, status, msg, param)

    def on_message(self, msg):
        session = get_session(self)
        if not session:
            self.send_message(-1, "No session")
            return

        try:
            if isinstance(msg, str):
                msg = json.loads(msg, object_hook=json_decode)
                if not "action" in msg:
                    session._out.invalid()
                    return
                logging.info(f'>> {msg["action"]}')
                if msg["action"]=="ping":
                    session._out.finished("OK")
                elif msg["action"]=="ls":
                    tpe.submit(ls, session, **msg)
                elif msg["action"]=="exist":
                    tpe.submit(exist, session, **msg)
                elif msg["action"]=="put":
                    tpe.submit(put, session, **msg)
                elif hasattr(session, msg["action"]) and callable(getattr(session, msg["action"])) and msg["action"][0] != "_":
                    action = msg["action"]
                    del msg["action"]
                    tpe.submit(getattr(session, action), **msg)
                else:
                    session._out.invalid("Unknown command")
        except Exception:
            traceback.print_exc()
            if session and session._out:
                session._out.error('Server side error')

class MyStaticFileHandler(StaticFileHandler):
    """
    Override StaticFileHandler to correctly return Content-Type for js
    """
    def get_content_type(self) -> str:
        if self.absolute_path[-4:] == ".mjs":
            return "text/javascript"
        elif self.absolute_path[-3:] == ".js":
            return "text/javascript"
        return super().get_content_type()

class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("client/index.html")


def make_app(debug):
    return tornado.web.Application([
        (r"/", IndexHandler),
        (r'/(favicon\.ico)', StaticFileHandler, {"path": "./client"}),
        (r"/static/(.*)", MyStaticFileHandler, {"path":"./client"}),
        (r"/ws", WebSocketHandler),
    ], debug=debug)

def shutdown():
    global ioloop
    ioloop.stop()
    
def sig_handler(sig, frame=None):
    global ioloop
    print('Caught signal: %s' % sig)
    ioloop.add_callback_from_signal(shutdown)

def open_browser(port:int):
    import webbrowser
    webbrowser.open('http://localhost:%d' % port, new=2)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="SK-ll")
    parser.add_argument("port", type=int, default=6789, help="Port to listen to")
    parser.add_argument("debug", default=False, help="Debug flag")
    args = parser.parse_args()
    if args.debug:
        logging.basicConfig(level=logging.DEBUG)
    from os import makedirs
    makedirs("./storage/sessions", exist_ok=True)
    print("SKll started!")
    app = make_app(args.debug)
    signal.signal(signal.SIGTERM, sig_handler)
    signal.signal(signal.SIGINT, sig_handler)
    if sys.platform == "win32":
        import win32api
        win32api.SetConsoleCtrlHandler(sig_handler, True)
    app.listen(args.port)
    tpe.submit(open_browser, args.port)
    ioloop = tornado.ioloop.IOLoop.instance()
    ioloop.start()