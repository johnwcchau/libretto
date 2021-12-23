import traceback
from skll.block import Block
from skll.block.baseblock import RunSpec
from skll.inout import Output
import pandas as pd

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
        self._result:tuple = None
    
    def _attach(self, ws):
        if self.out.ws is not None and self.out.ws != ws:
            raise RuntimeError(f'Session is occupied')
        self.out.ws = ws
    
    def _detach(self):
        self.out.ws = None

    def run(self, mode:str, upto:str, **kwargs)->None:
        try:
            if self.rootblock is None:
                raise RuntimeError('No receipe')
            self.out.working(f'{mode} upto {upto if upto else "end"}...')
            self.runspec = RunSpec(mode=RunSpec.RunMode[mode.upper()], upto=upto, out=self.out)
            self._result = self.rootblock(self.runspec, None)
            self.out.finished("Finished")
        except Exception as e:
            traceback.print_exc()
            self.out.error(repr(e))
    
    def result(self, usage:str="table", **kwargs)->None:
        try:
            if self._result is None:
                raise RuntimeError('No result, run first')
            result = self._result[0]
            if not isinstance(result, pd.DataFrame):
                result = pd.DataFrame(result)
            if self._result[1] is not None:
                result["__Y__"] = self._result[1].values
            if self._result[2] is not None:
                result["__ID__"] = self._result[2].values
            if usage=="plotly":
                orient="list"
            else:
                orient="records"
                
            self.out.finished("Result ready", {"data": result.where(pd.notnull(result), None).to_dict(orient=orient), "score": self.runspec.scores})
        except Exception as e:
            traceback.print_exc()
            self.out.error(repr(e))

    def dump(self, **kwargs)->None:
        if self.rootblock is None:
            self.out.finished("No receipe", {"receipe": None})
        else:
            self.out.finished("Receipe ready", {"receipe": self.rootblock.dump()})
    
    def load(self, dump:dict, **kwargs)->None:
        self.rootblock = Block.load(dump)
        self.out.finished("Receipe loaded")

# %%
