"""
Entry point of Libretto interactive mode (Libretto Editor)
"""
from __future__ import annotations

#
# 220221 early venv detection
#
if __name__ == "__main__":
    from configparser import ConfigParser
    from libretto.venv import Venv
    config = ConfigParser()
    config.read("config.ini")
    Venv(__file__, config)

from datetime import timedelta

import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.web import StaticFileHandler

import json
import traceback

import logging

from libretto.fileio import FileIO
from libretto.session import Session
from libretto.jsoncodec import Encoder, json_decode
from libretto.tpe import TPE

from libretto import plugin

tpe = TPE().executor

ioloop:tornado.ioloop = None

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    """
    WebSocket handler for all server-client communication
    One WebSocket for each session (possibly multiple session for each client)
    """
    def __init__(self, application: tornado.web.Application, request, **kwargs) -> None:
        super().__init__(application, request, **kwargs)
        self.session:Session = None

    def open(self, name:str="default"):
        logging.info(f'({self.request.host_name}) -- WS Opened')
        try:
            # Retrieve (or create) session by name specified in request URL
            # 
            self.session = Session(name)
            self.session._attach(self)
        except RuntimeError:
            self.session = None
            self.send_message(-1, f'Session {name} is in use by other client')
            logging.warn(f'Session {name} is in use by other client')
    
    def on_close(self):
        if self.session is not None: self.session._detach()
        logging.info(f'({self.request.host_name}) -- WS Closed')
    
    def __send_message(self, code:int, msg:str, param:dict=None):
        """
        Write message to client, this should never be called directly but rather 
        through public send_message method for possible multi-threading safety
        """
        if param is None:
            param = {}

        param["result"] = code
        param["message"] = msg
        logging.info(f'({self.request.host_name}) << {code}: {msg}')        
        msg = json.dumps(param, cls=Encoder)
        logging.debug(f'<<{msg}')
        self.write_message(msg)

    def send_message(self, code:int=-1000, msg:str=None, param:dict=None):
        """
        Write response to client, normal user should instead use Output.write provided 
        by Session (or simple param "output" in case of plugin method) for correct 
        response formatting

        Parameters
        ----------
        code: int
            response code
        msg: str, Optional
            response message
        param: dict, Optional
            response extra data
        """
        #
        # Possibly no use but let's push this call into ioloop queue 
        #
        global ioloop
        ioloop.add_callback(self.__send_message, code, msg, param)

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
                action:str = msg["action"]
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
                    # is it a plugin method? 
                    action = action.split("::")
                    if len(action) > 1:
                        # let plugin handle command
                        msg["plugin"] = action[0]
                        msg["action"] = action[1]
                        tpe.submit(self.session.plugin_invoke, **msg)
                    else:
                        session.out.invalid("Unknown command")
        except Exception as e:
            traceback.print_exc()
            if session and session.out:
                session.out.error(f'Error: {e}')

class MyStaticFileHandler(StaticFileHandler):
    """
    Override StaticFileHandler to force Content-Type for js and mjs
    (a necessity for es6 modules to work)
    """
    def get_content_type(self) -> str:
        if self.absolute_path[-4:] == ".mjs":
            return "text/javascript"
        elif self.absolute_path[-3:] == ".js":
            return "text/javascript"
        return super().get_content_type()

class PluginStaticFileHandler(MyStaticFileHandler):
    """
    Override StaticFileHandler to mask out python files from client
    """
    async def get(self, path:str, include_body:bool = True):
        ext = path.lower().split(".")[-1]
        if ext in ["py", "pyc"]:
            self.set_status(404)
            return
        await super().get(path, include_body)

class NoCacheStaticFileHandler(MyStaticFileHandler):
    def set_extra_headers(self, path: str) -> None:
        super().set_extra_headers(path)
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        
class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("client/index.html")

def set_ping(ioloop, timeout):
    """
    Regular interval to unblock the ioloop (for external interrupts)
    """
    ioloop.add_timeout(timeout, lambda: set_ping(ioloop, timeout))

def open_browser(port:int):
    import webbrowser
    webbrowser.open('http://localhost:%d' % port, new=2)

def __main():
    """
    main entry point (obviously)
    """
    global ioloop
    #
    # Ensure storage directory exists
    #
    from os import makedirs
    makedirs("./storage", exist_ok=True)
    
    debug = config.getboolean("Interactive", "debug", fallback=False)
    if debug:
        logging.basicConfig(level=logging.DEBUG)
    
    #
    # discover and initialize plugins
    #
    plugin.init(config)
    plugin.plugin_mjs(config)

    logging.info("Libretto started!")
    app = tornado.web.Application([
        (r"/", IndexHandler),
        (r'/(favicon\.ico)', StaticFileHandler, {"path": "./client"}),
        (r"/static/(.*)", MyStaticFileHandler, {"path":"./client"}),
        (r"/storage/(.*)", NoCacheStaticFileHandler, {"path":"./storage"}),
        (r"/plugin/(.*)", PluginStaticFileHandler, {"path":"./libretto/plugin"}),
        (r"/ws/(.*)", WebSocketHandler),
    ], debug=debug)

    port = config.getint("Interactive", "port", fallback=6789)
    app.listen(port)
    tpe.submit(open_browser, port)

    ioloop = tornado.ioloop.IOLoop.instance()
    set_ping(ioloop, timedelta(seconds=2))
    ioloop.start()




if __name__ == "__main__":
    __main()

# %%
