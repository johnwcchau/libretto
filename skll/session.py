import traceback
from skll.block import Block
from skll.block.baseblock import RunSpec
from skll.inout import Output
import pandas as pd
import numpy as np
import logging

class Session:

    __sessions = {}

    def __new__(cls, name:str):
        if name not in Session.__sessions:
            logging.info(f'Creating new session {name}')
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
    
    def __genstat(self):
        data:pd.DataFrame = self._result[0]
        result:pd.DataFrame = data.describe(include="all")
        def fillunique(x:pd.Series):
            if np.isnan(x["unique"]):
                x["unique"] = len(data[x.name].unique())
            return x
        result = result.transform(fillunique, axis=0)
        if self._result[1] is not None:
            result.loc[len(result.index)] = data.corrwith(self._result[1])
            result = result.rename(index={
                len(result.index)-1 : "corr"
            })
        result.loc[len(result.index)] = data.median()
        result.loc[len(result.index)] = data.skew()
        result.loc[len(result.index)] = data.dtypes.astype(str)
        result = result.rename(index={
                len(result.index)-3 : "median",
                len(result.index)-2 : "skew",
                len(result.index)-1 : "dtype",
            }).transpose().reset_index().rename(columns={"index": "column"})
        return result.where(pd.notnull(result), None).to_dict(orient="records")

    def result(self, usage:str="table", **kwargs)->None:
        try:
            if usage=='stat':
                self.out.finished("Listed stats", {"stat": self.__genstat()})
                return
            if self._result is None:
                raise RuntimeError('No result, run first')
            result = self._result[0]
            if not isinstance(result, pd.DataFrame):
                result = pd.DataFrame(result)
            if usage=='columns':
                self.out.finished("Listed columns", {"columns": [(c, str(result[c].dtype)) for c in result.columns]})
                return
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
        try:
            if self.rootblock is None:
                self.out.finished("No receipe", {"receipe": None})
            else:
                self.out.finished("Receipe ready", {"receipe": self.rootblock.dump()})
        except Exception:
            traceback.print_exc()
            self.out.error("Corrupted receipe")
    
    def load(self, dump:dict, **kwargs)->None:
        try:
            self.rootblock = Block.load(dump)
            self.out.finished("Receipe loaded")
        except Exception as e:
            traceback.print_exc()
            self.out.error(f'Receipe load error: {repr(e)}')

# %%
