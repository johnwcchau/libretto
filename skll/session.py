from skll.block import Block
from skll.block.baseblock import RunSpec
from skll.inout import Output

class Session:

    __sessions = {}

    def __new__(cls, name:str):
        if name not in Session.__sessions:
            s = object.__new__(Session)
            s.__init()
            Session.__sessions[name] = s
        else:
            s = Session.__sessions[name]
        return s

    def __init(self) -> None:
        self.rootblock:Block = None
        self.out:Output = Output()
        self.runspec:RunSpec = None
        self.result:tuple = None
    
    def _attach(self, ws):
        if self.out.ws is not None and self.out.ws != ws:
            raise RuntimeError(f'Session is occupied')
        self.out.ws = ws
    
    def _detach(self):
        self.out.ws = None

    def run(self, mode:str, upto:str, **kwargs)->None:
        if self.rootblock is None:
            raise RuntimeError('No receipe')
        self.runspec = RunSpec(mode=RunSpec.RunMode[mode.upper()], upto=upto, out=self.out)
        self.result = self.rootblock(self.runspec, None)
        self.out.finished("Finished")
    
    def result(self, **kwargs)->None:
        if self.result is None:
            raise RuntimeError('No result, run first')
        self.out.finished("Result ready", {"id": self.out[2], "x": self.out[0], "y": self.out[1], "score": self.runspec.scores})
    
    def dump(self, **kwargs)->None:
        if self.rootblock is None:
            self.out.finished("No receipe", {"receipe": None})
        else:
            self.out.finished("Receipe ready", {"receipe": self.rootblock.dump()})
    
    def load(self, dump:dict, **kwargs)->None:
        self.rootblock = Block.load(dump)
        self.out.finished("Receipe loaded")

# %%
