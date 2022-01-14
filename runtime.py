from datetime import timedelta
import logging
import json

import tornado.ioloop
import tornado.web
import tornado.websocket

import pandas as pd

from skll import plugin
from skll.inout import Output
from skll.block.baseblock import Block, Parent, RunSpec
from skll.jsoncodec import Encoder, json_decode

from skll.tpe import TPE

class NullOut(Output):
    def msg(self, status: int = -1000, msg: str = None, param: dict = None) -> None:
        print(msg)
        pass

class Runtime:
    instance = None

    def __new__(cls):
        if Runtime.instance is not None:
            return Runtime.instance
        r = object.__new__(cls)
        r.rootblock = None
        Runtime.instance = r
        return r
    
    def msg(self, sender, _id, msg, param=None):
        if param is None:
            param = {}
        param["result"] = _id
        param["message"] = msg
        logging.info(f'({sender.hostname()}) << {_id}: {msg}')
        msg = json.dumps(param, cls=Encoder)
        sender.msg(msg)

    def error(self, sender, msg:str=None)->None:
        self.msg(sender, -998, msg)
    def finished(self, sender, msg:str=None, param:dict=None)->None:
        self.msg(sender, 0, msg, param)

    async def handle(self, body, sender):
        try:
            msg = json.loads(body, object_hook=json_decode)
            if not "action" in msg:
                self.error(sender, "Invalid input")
                return
            action = msg["action"]
            logging.info(f'({sender.hostname()}) >> {action}')
            if action=="ping":
                self.finished(sender, "OK")
            elif action=="run":
                await ioloop.run_in_executor(TPE().executor, self.run, msg["input"], sender)
            else:
                self.error(sender, "no action performed")
        except Exception as e:
            logging.error(repr(e))
            self.error(sender, 'Server internal error')
        
    def run(self, x, sender)->None:
        try:
            if Runtime().rootblock is None:
                logging.error("No receipe")
                self.error(sender, "Server internal error")
                return
            
            try:
                x = pd.DataFrame(x)
            except ValueError:
                self.error(sender, "Invalid input")
            if x is None or len(x) < 1:
                self.error(sender, "No input")
                return
            runspec = RunSpec(mode=RunSpec.RunMode.RUN, out=NullOut())
            _result = Runtime().rootblock(runspec, x)
            result = _result[0]
            if _result[2] is not None:
                result["__ID__"] = _result[2].values
            self.finished(sender, param={"data": result.where(pd.notnull(result), None).to_dict(orient="records")})

        except Exception as e:
            logging.error(repr(e))
            self.error(sender, 'Server internal error')

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
    ioloop.add_timeout(timeout, lambda: set_ping(ioloop, timeout))

if __name__ == "__main__":

    import argparse
    parser = argparse.ArgumentParser(description="SK-ll Runtime")
    parser.add_argument("model", type=str, help="Model dump")
    parser.add_argument("-name", default="default", help="Instance name")
    parser.add_argument("-port", type=int, default=9876, help="Listening port")
    parser.add_argument("-norest", nargs='?', const=True, default=False, help="Disable REST")
    parser.add_argument("-nows", nargs='?', const=True, default=False, help="Disable WebSocket")
    args = parser.parse_args()

    logging.basicConfig(level=logging.DEBUG)

    instance_name = args.name
    if args.norest and args.nows:
        logging.error("You cannot disable both REST and WebSocket")
        exit()
    
    plugin.init()

    try:
        import joblib
        with open(args.model, "rb") as f:
            rootblock = joblib.load(f)
        if not isinstance(rootblock, Parent):
            logging.error(f'{args.model} is not a valid model')
            exit()
        Runtime().rootblock = rootblock
    except Exception as e:
        logging.error(repr(e))
        exit()

    logging.info("SK-ll runtime started.")
    
    handlers = []
    if not args.norest:
        handlers.append((rf"/rest/{instance_name}", RestHandler))
    if not args.nows:
        handlers.append((rf"/ws/{instance_name}", WsHandler))
    app = tornado.web.Application(handlers)
    app.listen(args.port)

    ioloop = tornado.ioloop.IOLoop.instance()
    set_ping(ioloop, timedelta(seconds=1))
    ioloop.start()
