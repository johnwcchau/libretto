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
from skll.jsoncodec import Encoder, json_decode

from skll import plugin

tpe = TPE().executor

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
        logging.info(f'({self.request.host_name}) -- WS Opened')
    
    def on_close(self):
        if self.session is not None: self.session._detach()
        logging.info(f'({self.request.host_name}) -- WS Closed')
    
    def __send_message(self, _id, msg, param=None):
        if param is None:
            param = {}

        param["result"] = _id
        param["message"] = msg
        logging.info(f'({self.request.host_name}) << {_id}: {msg}')        
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
                msg = json.loads(msg, object_hook=json_decode)
                if not "action" in msg:
                    session.out.invalid()
                    return
                logging.info(f'({self.request.host_name}) >> {msg["action"]}')
                action = msg["action"]
                if action=="ping":
                    session.out.finished("OK")
                elif action in ["ls", "exist", "put", "mkdir", "rm", "ren"]:
                    del msg["action"]
                    fileio = FileIO(self)
                    tpe.submit(getattr(fileio, action), **msg)
                elif action in ["load", "run", "result", "dump", "export"]:
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

class PluginStaticFileHandler(MyStaticFileHandler):
    async def get(self, path:str, include_body:bool = True):
        ext = path.lower().split(".")[-1]
        if ext in ["py", "pyc"]:
            self.set_status(404)
            return
        await super().get(path, include_body)

class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("client/index.html")

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
    from os import makedirs
    makedirs("./storage", exist_ok=True)

    import argparse
    parser = argparse.ArgumentParser(description="SK-ll")
    parser.add_argument("-port", type=int, default=6789, help="Port to listen to")
    parser.add_argument("-debug", nargs='?', const=True, default=False, help="Debug flag")
    parser.add_argument("-model", type=open, help="Model file for runtime mode")
    args = parser.parse_args()

    if args.debug:
        logging.basicConfig(level=logging.DEBUG)
    
    plugin.init()

    logging.info("SKll started!")
    app = tornado.web.Application([
        (r"/", IndexHandler),
        (r'/(favicon\.ico)', StaticFileHandler, {"path": "./client"}),
        (r"/static/(.*)", MyStaticFileHandler, {"path":"./client"}),
        (r"/storage/(.*)", MyStaticFileHandler, {"path":"./storage"}),
        (r"/plugin/(.*)", PluginStaticFileHandler, {"path":"./skll/plugin"}),
        (r"/ws/(.*)", WebSocketHandler),
    ], debug=args.debug)

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
