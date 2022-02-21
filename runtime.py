"""
Entry point for Libretto runtime mode

Runtime mode is unattended mode for "one-click" model deployment
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

from typing import Union

from dataclasses import dataclass
from datetime import timedelta
import logging
import json

import tornado.ioloop
import tornado.web
import tornado.websocket

import pandas as pd

from libretto import plugin
from libretto.inout import Output
from libretto.baseblock import Block, Parent, RunSpec
from libretto.jsoncodec import Encoder, json_decode
from libretto.venv import Venv
from libretto.tpe import TPE

ioloop:tornado.ioloop.IOLoop

@dataclass
class MaskedOutput(Output):
    sender:Union[WsHandler, RestHandler]

    """
    A masked output class to disable log-to-client output
    
    In runtime mode everything is unattended and the only output should be 
    the final result of the receipe (unless error)
    """
    def msg(self, code: int = -1000, msg: str = None, param: dict = None) -> None:
        if code > 0:
            return
        if param is None:
            param = {}
        param["result"] = code
        param["message"] = msg
        logging.info(f'({self.sender.hostname()}) << {code}: {msg}')
        msg = json.dumps(param, cls=Encoder)
        self.sender.msg(msg)

class Runtime:
    """
    Singleton class holding the receipe and abstracting I/O from protocols
    """
    instance = None

    def __new__(cls):
        if Runtime.instance is not None:
            return Runtime.instance
        r = object.__new__(cls)
        r.rootblock = None
        Runtime.instance = r
        return r
    
    async def handle(self, body:str, sender:Union[WsHandler, RestHandler]):
        """
        Handle request from client, only "ping" and "run" is supported
        """
        try:
            output = MaskedOutput(sender)
            msg = json.loads(body, object_hook=json_decode)
            if not "action" in msg:
                output.error("Invalid input")
                return
            action = msg["action"]
            logging.info(f'({sender.hostname()}) >> {action}')
            if action=="ping":
                output.finished("OK")
            elif action=="run":
                await ioloop.run_in_executor(TPE().executor, self.run, msg["input"], output)
            else:
                output.error(sender, "no action performed")
        except Exception as e:
            logging.error(repr(e))
            output.error(sender, 'Server internal error')
        
    def run(self, x, output:Output)->None:
        """
        Cook the receipe and reponse to client
        """
        try:
            if Runtime().rootblock is None:
                logging.error("No receipe")
                output.error("Server internal error")
                return
            
            try:
                x = pd.DataFrame(x)
            except ValueError:
                output.error("Invalid input")
            if x is None or len(x) < 1:
                output.error("No input")
                return
            runspec = RunSpec(mode=RunSpec.RunMode.RUN, out=output)
            _result = Runtime().rootblock(runspec, x)
            result = _result[0]
            if _result[2] is not None:
                result["__ID__"] = _result[2].values
            output.finished("OK", param={"data": result.where(pd.notnull(result), None).to_dict(orient="records")})

        except Exception as e:
            logging.error(repr(e))
            output.error('Server internal error')

class WsHandler(tornado.websocket.WebSocketHandler):
    def msg(self, msg:str):
        self.write(msg)

    def hostname(self)->str:
        return self.request.host_name

    def open(self, *args: str, **kwargs: str):
        r = super().open(*args, **kwargs)
        logging.info(f'({self.request.host_name}) -- WebSocket opened')
        return r
    
    def on_close(self) -> None:
        logging.info(f'({self.request.host_name}) -- WebSocket closed')
        return super().on_close()
    
    def on_message(self, message):
        Runtime().handle(message, self)

class RestHandler(tornado.web.RequestHandler):
    def msg(self, msg:str):
        self.write(msg)

    def hostname(self)->str:
        return self.request.host_name

    async def post(self):
        logging.info(f'({self.request.host_name}) -- REST POST')
        await Runtime().handle(self.request.body, self)

def set_ping(ioloop, timeout):
    """
    Regular interval to unblock the ioloop (for external interrupts)
    """
    ioloop.add_timeout(timeout, lambda: set_ping(ioloop, timeout))

def __main():
    """
    main entry point (obviously)
    """
    #
    # regular argparse
    #
    import argparse
    parser = argparse.ArgumentParser(description="Libretto Runtime")
    parser.add_argument("-name", help="Instance name")
    args = parser.parse_args()
    instance_name = args.name if "name" in args else None
    instance_name = f'Runtime.{instance_name}' if instance_name else 'Runtime'

    norest = config.getboolean(instance_name, "rest", fallback=False)
    nows = config.getboolean(instance_name, "websocket", fallback=False)
    port = config.getInt(instance_name, "port", fallback=9876)
    model = config.get(instance_name, "model", fallback=None)
    if not model:
        logging.error("No model specified")
        exit()
    if norest and nows:
        logging.error("You cannot disable both REST and WebSocket")
        exit()
    
    #
    # discover and initialize plugins
    # also announce the only session "__runtime__" is created
    #
    plugin.init(config)
    plugin.dispatch(lambda _, plugin: getattr(plugin, "__new_session")("__runtime__") if hasattr(plugin, "__new_session") else None)

    #
    # Load the receipe with trained parameters
    #
    try:
        import joblib
        with open(model, "rb") as f:
            rootblock = joblib.load(f)
        if not isinstance(rootblock, Parent):
            logging.error(f'{model} is not a valid model')
            exit()
        Runtime().rootblock = rootblock
    except Exception as e:
        logging.error(repr(e))
        exit()

    logging.info("Libretto runtime started.")
    
    #
    # Create tornado webapp and start
    #
    handlers = []
    if not norest:
        handlers.append((rf"/rest/{instance_name}", RestHandler))
    if not nows:
        handlers.append((rf"/ws/{instance_name}", WsHandler))
    app = tornado.web.Application(handlers)
    app.listen(port)

    ioloop = tornado.ioloop.IOLoop.instance()
    set_ping(ioloop, timedelta(seconds=1))
    ioloop.start()

if __name__ == "__main__":
    __main()