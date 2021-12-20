#%%
from __future__ import annotations

import traceback
import joblib

from importlib import import_module
from uuid import uuid4

import numpy as np
import pandas as pd

from skll.inout import Output, StdRedirect

class ndarray(np.ndarray):
    '''
    Override class for np.ndarray to have uuid available
    '''
    def __new__(cls, input):
        if isinstance(input, ndarray) or not isinstance(input, np.ndarray):
            return input
        obj = np.asarray(input).view(cls)
        obj._skll_uuid = None
        return obj
    def __array_finialize__(self, obj):
        if obj is None: return
        self._skll_uuid = getattr(obj, '_skll_uuid', None)

class Session:
    """
    Runtime session
    """
    def __init__(self) -> None:
        self._objects = {}
        self._last_result = None
        self._client_state = None
        self._out = Output()
    
    @classmethod
    def __in_whitelist(cls, func:str):
        """
        Whitelisting which function can be called by checking package name
        """
        package_white_list = ["skll", "sklearn", "pandas", "numpy"]
        return func.split(".")[0] in package_white_list

    def __get_object(self, uuid:str)->any:
        """
        Retrieve object from session's object list by uuid

        Parameters
        ----------
        uuid: str
            object's assigned uuid

        Return
        ------
        val : any
            object
        """
        if uuid == "_last":
            return self._last_result
        if not uuid in self._objects:
            raise KeyError(f'object {uuid} not exist')
        return self._objects[uuid]
    
    def __put_object(self, obj:any, dest:dict)->str:
        """
        Put object into session's object list and return uuid of the object

        Return
        ------
        val: str
            assigned uuid of the object
        """
        if isinstance(obj, np.ndarray):
            obj = ndarray(obj)
        if "new" in dest:
            uuid = str(uuid4())
            setattr(obj, "_skll_uuid", uuid)
            self._objects[uuid] = obj
        elif "uuid" in dest:
            uuid = dest["uuid"]
            if "cols" in dest:
                if uuid not in self._objects:
                    raise KeyError(f'object {uuid} not exist')
                obj = self._objects[uuid]
                if isinstance(obj, np.ndarray):
                    obj[:, dest["cols"]] = obj
                elif isinstance(obj, pd.DataFrame):
                    obj[dest["cols"]] = obj
                else:
                    raise AttributeError(f'{uuid} cannot be subscripted')
            else:
                uuid = dest["uuid"]
                setattr(obj, "_skll_uuid", uuid)
                self._objects[uuid] = obj
        return uuid

    def __get_attr(self, uuid:str, param:str)->any:
        """
        Get attribute from object

        Parameters
        ----------
        uuid : str
            object's assigned uuid
        param : str
            object's attribute name to get

        Return
        ------
        val : any
            object's attribute value
        """
        try:
            obj = self.__get_object(uuid)
            obj = getattr(obj, param)
        except Exception:
            raise KeyError(f'object {uuid} has no param {param}')
        return obj
    
    def __reshape_arg(self, arg:dict):
        """
        Reshape one argument to native value by resolving references
        """
        if not isinstance(arg, dict):
            raise TypeError()
        if "raw" in arg:
            r = arg["raw"]
        elif "uuid" in arg:
            r = self.__get_object(arg["uuid"])
        elif "last" in arg:
            r = self._last_result
        else:
            raise TypeError()
        if "cols" in arg:
            if isinstance(r, pd.DataFrame):
                r = r[arg["cols"]]
            elif isinstance(r, np.ndarray):
                r = r[:, arg["cols"]]
            else:
                raise AttributeError()
        return r
        
    def __reshape_args(self, args:list):
        """
        Reshape arguments to native arg dict by resolving references
        """
        r = []
        for i, arg in enumerate(args):
            try:
                r.append(self.__reshape_arg(arg))
            except TypeError:
                raise TypeError(f'Incorrect format for argument {i}')
            except AttributeError:
                raise AttributeError(f'{i} cannot be subscripted')
        return r

    def __reshape_kwargs(self, args:dict):
        """
        Reshape arguments to native arg dict by resolving references
        """
        for key, arg in args.items():
            try:
                args[key] = self.__reshape_arg(arg)
            except TypeError:
                raise TypeError(f'Incorrect format for argument {key}')
            except AttributeError:
                raise AttributeError(f'{key} cannot be subscripted')
        return args
    
    def __reshape_obj(self, obj:any):
        """
        Reshape objects to argument dict for passing to client
        """
        if isinstance(obj, np.ndarray):
            return {"raw": obj.tolist()}
        elif isinstance(obj, pd.DataFrame):
            return {"raw": obj.to_dict(orient="list")}
        elif isinstance(obj, pd.Series):
            return {"raw": obj.to_list()}
        elif hasattr(obj, "_skll_uuid"):
            return {"uuid": obj._skll_uuid}
        else:
            return {"raw": obj}

    def set_client_state(self, chart:any)->None:
        """
        Store client state for backup purpose
        """
        self._client_state(chart)
        self._out.finished()
    
    def get_client_state(self)->None:
        """
        Get back client state
        """
        self._out.finished(param=self._client_state)

    def call_function(self, func:str, dest:dict, *args, **kwargs)->None:
        """
        Client function: Call global function
        
        Parameters
        ----------
        - func : str
            function name (e.g. numpy.sum)
        - dest : dict
            how to store the result:
            - None do not store the result
            - {"new":True} store as a new object
            - {"uuid":"..."} replace existing object (or create new object with specified uuid)
            - {"uuid":"...", "cols":...} set columns of data matrix
        - kwargs : 
            parameters to pass to calling function, in the format of [{"raw|uuid|last": value},...]
        """
        try:
            if not Session.__in_whitelist(func):
                raise KeyError(f'"{func}" is not in whitelist')
            func = func.split(".")
            module = ".".join(func[:-1])
            func = func[-1]
            if not module in globals():
                globals()[module] = import_module(module)
            args = self.__reshape_args(args)
            kwargs = self.__reshape_kwargs(kwargs)
            with StdRedirect(self._out):
                result = getattr(globals()[module], func)(*args, **kwargs)
            self._last_result = result
            if dest and result:
                param = {"uuid": self.__put_object(result, dest)}
            else:
                param = None
            self._out.finished(param=param)
        except Exception as e:
            traceback.print_exc()
            self._out.error(str(e))
            
    def call_method(self, uuid:str, func:str, dest:dict, *args, **kwargs)->None:
        """
        Client function: Call object's method
        
        Parameters
        ----------
        - uuid : str
            object's assigned uuid
        - func : str
            object's method name (e.g. sum)
        - dest : dict
            how to store the result:
            - None do not store the result
            - {"new":True} store as a new object
            - {"uuid":"..."} replace existing object (or create new object with specified uuid)
            - {"uuid":"...", "cols":...} set columns of data matrix
        kwargs : 
            parameters to pass to calling function, in the format of [{"raw|uuid|last": value},...]
        """
        try:
            func = self.__get_attr(uuid, func)
            if not callable(func):
                self._out.error(f'{func} of {uuid} is not callable')
                return
            args = self.__reshape_args(args)
            kwargs = self.__reshape_kwargs(kwargs)
            with StdRedirect(self._out):
                result = func(*args, **kwargs)
            self._last_result = result
            param = None
            if dest:
                param = {"uuid": self.__put_object(result, dest)}
            self._out.finished("invoke success", param)
        except Exception as e:
            traceback.print_exc()
            self._out.error(str(e))

    def get_object(self, uuid:str)->None:
        """
        Client function: Retrive object by uuid, or last call result with uuid="_last"

        Parameters
        ----------
        uuid : str
            object's assigned uuid
        """
        try:
            obj = self.__get_object(uuid)
            self._out.finished(param=self.__reshape_obj(obj))
        except Exception as e:
            traceback.print_exc()
            self._out.error(str(e))

    def del_object(self, uuid:str)->None:
        """
        Client function: Delete object from session's object list

        Parameters
        ----------
        uuid : str
            object's assigned uuid
        """
        try:
            if not uuid in self._objects:
                return
            del self._objects[uuid]
            self._out.finished(f"{uuid} deleted")
        except Exception as e:
            traceback.print_exc()
            self._out.error(str(e))

    def get_attr(self, uuid:str, param:str)->None:
        """
        Client function: Get attribute from object

        Parameters
        ----------
        uuid : str
            object's assigned uuid
        param : str
            object's attribute name to get
        """
        try:
            obj = self.__get_attr(uuid, param)
            if hasattr(obj, "_skll_uuid"):
                self._out.finished(param={
                    "value": {
                        "uuid": obj._skll_uuid,
                    }
                })
            else:
                self._out.finished(param=self.__reshape_obj(obj))
        except Exception as e:
            traceback.print_exc()
            self._out.error(str(e))

    def set_attr(self, uuid:str, param:str, value:dict)->None:
        """
        Client function: Set object's attribute

        Parameters
        ----------
        uuid : str
            object's assigned uuid
        param : str
            object's attribute name to get
        value : dict
            value to set, in the format of {"raw|uuid|last": value}
        """
        try:
            if not uuid in self._objects:
                self._out.error(f'object {uuid} not exist')
                return
            try:
                value = self.__reshape_arg(value)
            except TypeError:
                self._out.error("incorrect param format")
                return
            setattr(self._objects[uuid], param, value)
            self._out.finished("Value set")
        except Exception as e:
            traceback.print_exc()
            self._out.error(str(e))


if __name__ == "__main__":
    session = Session()
    out = Output()
    _last:dict
    session._out = out
    import sys
    out.stdout = sys.stdout
    def iceptLog(status=-1000, msg=None, param=None):
        global _last, out
        out.stdout.write(f'[{status}] {msg}\n')
        if param:
            out.stdout.write(f'{repr(param)}\n')
            _last = param
    out.msg = iceptLog

# %%
if __name__ == "__main__":
    session.call_function("numpy.array", dest={"new": True}, object={
        "raw": [[0,1,2], [1,2,3],[2,3,4]]
    })
    assert("uuid" in _last)
    uuid_np = _last["uuid"]
    session.call_function("sklearn.manifold.MDS", dest={"new": True})
    assert("uuid" in _last)
    uuid_mds = _last["uuid"]
    session.get_object(uuid_mds)
    assert("uuid" in _last)
    session.call_method(uuid_mds, "fit_transform", dest={"new": True}, X={"uuid": uuid_np})
    assert("uuid" in _last)
    uuid_ft = _last["uuid"]
    session.get_object(uuid_ft)
    assert("raw" in _last)
# %%
