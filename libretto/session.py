import traceback
from .baseblock import Block, ErrorAtRun, RunSpec
from .inout import Output
from .plugin import dispatch, find_plugin
import pandas as pd
import numpy as np
import logging


class Session:

    __sessions = {}

    def __new__(cls, name:str):
        if name not in Session.__sessions:
            logging.info(f'Creating new session {name}')
            s = object.__new__(Session)
            s.__init(name)
            Session.__sessions[name] = s
            dispatch(lambda _, obj: getattr(obj, "__new_session")(name) if hasattr(obj, "__new_session") else None)
        else:
            s = Session.__sessions[name]
        return s

    def __init(self, name:str) -> None:
        self.name = name
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

    def plugin_invoke(self, plugin:str, action:str, **params):
        try:
            if action.startswith("__"):
                self.out.invalid()
                return
            plugin = find_plugin(plugin)
            if plugin is None or not hasattr(plugin, action):
                self.out.invalid()
                return
            action = getattr(plugin, action)
            if not callable(action):
                self.out.invalid()
                return
            action(session=self.name, writer=self.out, **params)
        except Exception as e:
            logging.err(repr(e))
            self.out.error(repr(e))

    def run(self, mode:str, upto:str, **kwargs)->None:
        try:
            if self.rootblock is None:
                raise RuntimeError('No receipe')
            self.out.working(f'{mode} upto {upto if upto else "end"}...')
            self.runspec = RunSpec(mode=RunSpec.RunMode[mode.upper()], upto=upto, out=self.out)
            self._result = self.rootblock(self.runspec, None)
            self.out.finished("Finished")
        except ErrorAtRun as e:
            logging.exception(e.exception, exc_info=True)
            self.out.error(repr(e.exception), {"atblock": e.at.name})
        except Exception as e:
            logging.exception(e, exc_info=True)
            self.out.error(repr(e))
    
    def __genstat(self):
        data:pd.DataFrame = self._result[0]
        result:pd.DataFrame = data.describe(include="all")
        def fillunique(x:pd.Series):
            if "unique" in x and np.isnan(x["unique"]):
                x["unique"] = len(data[x.name].unique())
            return x
        result = result.transform(fillunique, axis=0)
        try:
            if self._result[1] is not None:
                result.loc[len(result.index)] = data.corrwith(self._result[1])
                result = result.rename(index={
                    len(result.index)-1 : "corr"
                })
        except TypeError:
            pass
        result.loc[len(result.index)] = data.median()
        result.loc[len(result.index)] = data.skew()
        result.loc[len(result.index)] = data.dtypes.astype(str)
        result = result.rename(index={
                len(result.index)-3 : "median",
                len(result.index)-2 : "skew",
                len(result.index)-1 : "dtype",
            }).transpose().reset_index().rename(columns={"index": "column"})
        return result.where(pd.notnull(result), None).to_dict(orient="records")

    def formatforplotly(self, result:pd.DataFrame, plotspec:list):
        traces = []
        for spec in plotspec:
            datapts = result
            if "filter" in spec:
                if spec["filter"]:
                    datapts = datapts.query(spec["filter"])
                del spec["filter"]
            if "groupby" in spec and len(spec["groupby"]):
                datagroups = datapts.groupby(spec["groupby"])
            else:
                if "groupby" in spec:
                    del spec["groupby"]
                def v():
                    yield "", datapts
                datagroups = v()
            #
            # seperate const, aggr and cols
            #
            cols = []
            aggr = {}
            dims = spec['dims']
            def setfor(obj, name:str, val):
                names:list = name.split('.')
                while len(names) > 1:
                    n = names.pop(0)
                    if not n in obj:
                        obj[n] = {}
                    obj = obj[n]
                obj[names[0]] = val
            for dim in dims:
                if dim["type"] == "constant":
                    setfor(spec, dim["name"], dim["val"])
                elif dim["type"] == "column":
                    cols.append(dim["val"])
                elif dim["type"] == "sum":
                    aggr[dim["val"]] = "sum"
            del spec["dims"]
            for v in datagroups:
                group:pd.DataFrame = v[1]
                trace = {i:v for i,v in spec.items()}
                if v[0]:
                    trace["name"] = f'{trace["name"]}#{v[0]}'
                if len(aggr) > 0:
                    group = group.groupby(cols).aggregate(aggr).reset_index()
                else:
                    group = group[cols]
                for dim in dims:
                    if dim["type"] in ["column", "sum"]:
                        setfor(trace, dim["name"], group[dim["val"]].to_list())
                traces.append(trace)
        self.out.finished("Result ready", {
            "traces": traces
        })

    def result(self, usage:str="table", query:str=None, **kwargs)->None:
        try:
            if usage=='stat':
                self.out.finished("Listed stats", {"stat": self.__genstat()})
                return
            elif usage=='variables':
                self.out.finished("Listed variables", {"variables": self.runspec.variables})
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
            if usage=="plotly" and 'plotspec' in kwargs:
                #
                # go return data for plotting
                #
                return self.formatforplotly(result, kwargs['plotspec'])

            if query is not None and query != '':
                result = result.query(query)
            
            #
            # limit result to 1000 for table
            #
            warning = None
            if result.shape[0] > 1000 and usage == "table":
                count = result.shape[0]
                result = result.sample(n=1000)
                warning = f'Limited to 1000 out of {count} records, or use filtering to find desired records'
            
            self.out.finished("Result ready", {
                "data": result.where(pd.notnull(result), None).to_dict(orient="records"), 
                "variables": self.runspec.variables, 
                "warning": warning
            })
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

    def export(self, path:str=None, **kwargs)->None:
        if not path:
            self.out.invalid()
            return
        if not self.rootblock:
            self.out.invalid()
            return
        try:
            from libretto.fileio import FileIO
            import joblib
            vpath, valid = FileIO()._getvalidpath(path)
            if not valid:
                self.out.error(f'{path} is not valid')
                return
            
            with open(vpath, "wb") as f:
                joblib.dump(self.rootblock, f)
            self.out.finished(f'Exported to {vpath}')
        except Exception as e:
            traceback.print_exc()
            self.out.error(f'Export failed: {repr(e)}')
# %%
