from __future__ import annotations

import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.web import StaticFileHandler
from skll.tpe import TPE

import signal
import sys
import json
import traceback
import re

import logging

from skll.fileio import FileIO
from skll.session import Session
from skll.jsoncodec import Encoder

tpe = TPE().executor

# def json_decode(o):
#     if isinstance(o, str):
#         if o.lower() == "true":
#             return True
#         elif o.lower() == "false":
#             return False
#         else:
#             try:
#                 return int(o)
#             except ValueError:
#                 try:
#                     return float(o)
#                 except ValueError:
#                     return o
#     elif isinstance(o, dict):
#         return {k: json_decode(v) for k, v in o.items()}
#     elif isinstance(o, list):
#         return [json_decode(v) for v in o]
#     else:
#         return o

# def json_encode(o):
#     return o

class WebSocketHandler(tornado.websocket.WebSocketHandler):

    def __init__(self, application: tornado.web.Application, request, **kwargs) -> None:
        super().__init__(application, request, **kwargs)
        self.session:Session = None

    def open(self, name="default"):
        try:
            self.session = Session(name)
            self.session._attach(self)
        except RuntimeError:
            self.session = None
        logging.info("WS Opened")
    
    def on_close(self):
        if self.session is not None: self.session._detach()
        logging.info("WS Closed")
    
    def __send_message(self, _id, msg, param=None):
        if param is None:
            param = {}

        param["result"] = _id
        param["message"] = msg
        msg = json.dumps(param, cls=Encoder)
        logging.debug(f'<<{msg}')
        self.write_message(msg)

    def send_message(self, status=-1000, msg=None, param=None):
        global ioloop
        ioloop.add_callback(self.__send_message, status, msg, param)

    def on_message(self, msg):
        session = self.session
        if not session:
            self.send_message(-1, "No session")
            return

        try:
            if isinstance(msg, str):
                msg = json.loads(msg) #, object_hook=json_decode)
                if not "action" in msg:
                    session.out.invalid()
                    return
                logging.info(f'>> {msg["action"]}')
                action = msg["action"]
                if action=="ping":
                    session.out.finished("OK")
                elif action in ["ls", "exist", "put", "mkdir", "rm", "ren"]:
                    del msg["action"]
                    fileio = FileIO(self)
                    tpe.submit(getattr(fileio, action), **msg)
                elif action in ["load", "run", "result", "dump"]:
                    del msg["action"]
                    tpe.submit(getattr(self.session, action), **msg)
                else:
                    session.out.invalid("Unknown command")
        except Exception as e:
            traceback.print_exc()
            if session and session.out:
                session.out.error(f'Error: {e}')

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
        (r"/storage/(.*)", MyStaticFileHandler, {"path":"./storage"}),
        (r"/ws/(.*)", WebSocketHandler),
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

# %%
# %%
