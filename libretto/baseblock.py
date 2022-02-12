# %%

from __future__ import annotations
from dataclasses import dataclass, field
from importlib import import_module
from typing import Generator
from uuid import uuid4
from enum import Enum
import numpy as np
import pandas as pd
import re

from libretto.inout import Output

def import_load(cls:str):
    obj = cls.split(".")
    package = ".".join(obj[:-1])
    package = import_module(package)
    obj = obj[-1]
    obj = getattr(package, obj)
    if not callable(obj):
        raise AttributeError(f'{cls} is not a method')
    return obj

@dataclass
class RunSpec:
    """
    State object for the pipeline
    """
    class RunMode(Enum):
        """
        Columns: Special case for check columns
        Preview: row limited fit-predict
        Train: fit-predict
        Test: fold + predict/transform + score
        Run: predict/transform
        """
        COLUMNS = 0
        PREVIEW = 1
        TRAIN = 2
        TEST = 3
        RUN = 4
        BREAK = -1
    
    """
    Run mode for different tactics
    """
    mode:RunMode = RunMode.TRAIN
    """
    Only for preview / train, run up to the named block for result
    """
    upto:str = None
    """
    Ignore all caches/saves from previous run
    """
    cleanrun:bool = False
    """
    Scalars (name->value)
    """
    variables:dict = field(default_factory=dict)
    """
    logs and progress to write to
    """
    out:Output = field(default_factory=Output)

    def set_variable(self, name:str, value):
        if isinstance(value, (list, dict)):
            raise AttributeError("Only scalar values for runspec.variable")

        if not name in self.variables:
            self.variables[name] = value
            return
        i = 2
        while f'{name}_{i}' in self.variables:
            i+=1
        self.variables[f'{name}_{i}'] = value
@dataclass
class ErrorAtRun(Exception):
    exception:Exception
    at:Block
    
class Block:
    """
    Base block which handles all tidy work

    Parameters
    ----------
    name : str
    Name of this block, must be unique, if None, random uuid will be used instead
    disable_mask : list[RunMode]
    list of runmode which this block will be bypassed
    """
    def __init__(self, name:str=None, _jstype:str=None, _pytype:str=None, 
                 column_mask:list=None, as_new_columns:bool=False, 
                 row_filter:str=None, as_new_rows:bool=False, 
                 disable_mask:list=None, **kwargs:dict)->None:
        self.name = name if name else str(uuid4())
        self.disable_mask = []
        self._jstype = _jstype
        if isinstance(disable_mask, list):
            for d in disable_mask:
                if isinstance(d, RunSpec.RunMode):
                    self.disable_mask.append(d)
                elif isinstance(d, str):
                    self.disable_mask.append(RunSpec.RunMode[d.upper()])
                elif isinstance(d, int):
                    self.disable_mask.append(RunSpec.RunMode.value(d))
        self.column_mask = column_mask
        self.as_new_columns = as_new_columns
        self.row_filter = row_filter
        self.as_new_rows = as_new_rows

    def __getitem__(self, key:int)->Block:
        return None

    def __setitem__(self, key:int, block:Block)->None:
        """
        Set child block for output group [key], or key 0 for next block
        """
        pass

    @classmethod
    def load(cls, obj:dict)->Block:
        if not "_pytype" in obj:
            raise KeyError(f'Invalid input')
        type = obj["_pytype"]
        #args = {k: v for k, v in obj.items() if not k.startswith("_")}
        args = obj
        try:
            res = import_load(type)(**args)
        except Exception as e:
            v = type
            if "name" in args:
                v += f'({args["name"]})'
            raise Exception(f'at {v}: {repr(e)}')
        if "_children" in obj:
            for k, v in obj["_children"].items():
                if v is not None: res[int(k)] = Block.load(v)
        if "_next" in obj and obj["_next"] is not None:
            res[0] = Block.load(obj["_next"])
        return res

    def dump(self)->dict:
        klass = type(self)
        typestr = f'{klass.__module__}.{klass.__name__}'
        return {
            "_jstype": self._jstype if self._jstype else typestr,
            "_pytype": typestr,
            #"_next": self[0].dump() if self[0] else None,
            "name": self.name,
            "disable_mask": self.disable_mask,
            "column_mask": self.column_mask,
            "as_new_column": self.as_new_columns,
            "row_filter": self.row_filter,
            "as_new_rows": self.as_new_rows,
        }
    
    def containsblock(self, name:str)->bool:
        """
        Returns True if this block is required 
        to be evaluated for up-to block
        """
        if name == self.name:
            return True
        return self.next and self.next.containsblock(name)
    
    @classmethod
    def resolvearg(cls, x, arg, allowlambda=True):
        if isinstance(arg, dict):
            arg = Block.resolveargs(x, arg)
        elif isinstance(arg, str):
            if arg.startswith("="):
                arg = eval(arg[1:], globals(), x)
            elif arg.startswith("@"):
                if allowlambda:
                    line = arg[1:]
                    arg = lambda r: eval(line, globals(), {"X": x, "x": r})
                else:
                    raise AttributeError("@Xx-lambda is not allowed")
        return arg

    @classmethod
    def resolveargs(cls, x, args:dict, allowlambda=True):
        finalargs = {}
        globals()["X"] = x
        for name, arg in args.items():
            finalargs[name] = Block.resolvearg(x, arg, allowlambda)
        if "X" in globals(): del globals()["X"]
        return finalargs

    def run(self, runspec:RunSpec, x:pd.DataFrame, y=None, id=None)->tuple:
        return x, y, id

    def __call__(self, runspec:RunSpec, x, y=None, id=None)->tuple:
        if runspec.mode == RunSpec.RunMode.BREAK:
            return x, y, id
        if runspec.mode == RunSpec.RunMode.COLUMNS and runspec.upto == self.name:
            runspec.mode = RunSpec.RunMode.BREAK
            return x, y, id
        try:
            if runspec.mode.PREVIEW in self.disable_mask and runspec.mode == RunSpec.RunMode.COLUMNS:
                return x, y, id
            if not runspec.mode in self.disable_mask:
                runspec.out.working(f'Processing {self.name}...', {"atblock": self.name})
                if x is None:
                    x, y, id = self.run(runspec, x, y, id)
                else:
                    if not isinstance(x, pd.DataFrame):
                        x = pd.DataFrame(x)
                    # 1. filter rows
                    origx = x
                    origy = y
                    origid = id
                    row_mask = None
                    if isinstance(self.row_filter, str) and len(self.row_filter) > 0:
                        row_mask = eval(self.row_filter, globals(), x)
                        x = x.loc[row_mask]
                        y = y.loc[row_mask] if y is not None else None
                        id = id.loc[row_mask] if id is not None else None
                        if not self.as_new_rows:
                            unmask = np.invert(row_mask)
                            origx = origx[unmask]
                            if origy is not None: origy = origy[unmask]
                            if origid is not None: origid = origid[unmask]
                    # 2. do columns
                    if x is not None and isinstance(self.column_mask, list) and len(self.column_mask) > 0:
                        thisx = x[self.column_mask]
                        thisx, y, id = self.run(runspec, thisx, y, id)
                        if thisx is not None and self.as_new_columns:
                            newcolname = {}
                            for colname in thisx.columns:
                                newcolname[colname] = f'{colname}_{self.name}'
                            x = pd.concat([x, thisx.rename(columns=newcolname)], axis='columns')
                        else:
                            x = x.drop(self.column_mask, axis='columns')
                            if thisx is not None:
                                x = pd.concat([x, thisx], axis='columns')
                    else:
                        x, y, id = self.run(runspec, x, y, id)
                    #3. append back rows
                    if row_mask is not None:
                        x = origx.append(x).reset_index(drop=True)
                        y = origy.append(y, ignore_index=True).reset_index(drop=True) if origy is not None else y
                        id = origid.append(id, ignore_index=True).reset_index(drop=True) if origid is not None else id
            
            if runspec.upto == self.name:
                runspec.mode = RunSpec.RunMode.BREAK
            return x, y, id
        except ErrorAtRun as e:
            raise e
        except Exception as e:
            raise ErrorAtRun(e, self)

# class Split(Block):
#     """
#     Split block which splits input columns to multiple groups, process and 
#     group back in return

#     Parameters
#     ----------
#     splits : list<list<str>>
#         list of columns list
#     out_y : int
#         if set, use y column from output group for next block instead of y 
#         column from previous block
#     """
#     def __init__(self, splits:list[list]=None, out_y="inherit", out_id="inherit", **kwargs:dict)->None:
#         super().__init__(**kwargs)
#         self.children:list[Block] = [None] * len(splits)
#         self.splits = splits
#         self.out_y = out_y
#         self.out_id = out_id
    
#     def __getitem__(self, key:int)->Block:
#         if key == 0:
#             return self.next
#         return self.children[key - 1]

#     def __setitem__(self, key: int, block: Block)->None:
#         if key == 0:
#             self.next = block
#         elif key <= len(self.splits):
#             key -= 1
#             self.children[key] = block
    
#     def dump(self) -> dict:
#         r = super().dump()
#         r["splits"] = self.splits
#         r["out_y"] = self.out_y
#         r["out_id"] = self.out_id
#         _children = {}
#         for i,v in enumerate(self.children):
#             _children[i+1] = v.dump()
#         r["_children"] = _children
#         return r

#     def containsblock(self, name: str)->bool:
#         if super().containsblock(name): return True
#         for child in self.children:
#             if child and child.containsblock(name): return True
#         return False

#     def resetsplit(self):
#         self.allcols = []

#     def split(self, x, split):
#         self.allcols += split
#         if isinstance(x, np.ndarray):
#             return x[split]
#         if isinstance(x, pd.DataFrame):
#             v = x[split]
#             #if isinstance(v, pd.DataFrame): v.columns = range(v.columns.size)
#             return v
#         if isinstance(x, list):
#             return [[r[c] for c in split] for r in x]
#         raise TypeError(f'Unsupported input type {type(x)}')

#     def remains(self, x):
#         split = [c for c in x.columns if c not in self.allcols]
#         # print(f'what remains: {split}')
#         if isinstance(x, np.ndarray):
#             return x[split]
#         if isinstance(x, pd.DataFrame):
#             v = x[split]
#             return v
#         if isinstance(x, list):
#             return [[r[c] for c in split] for r in x]
#         raise TypeError(f'Unsupported input type {type(x)}')

#     def __uptoismine(self, upto:str):
#         if not upto: return False
#         for i, split in enumerate(self.splits):
#             if self.children[i].containsblock(upto): return True
#         return False

#     def run(self, runspec: RunSpec, x, y=None, id=None)->tuple:
#         results = []
#         out_y = y
#         out_id = id
#         name = runspec.upto
#         self.resetsplit()
#         uptoismine = self.__uptoismine(name)
#         for i, split in enumerate(self.splits):
#             runspec.out.working(f'In {self.name} processing group {i}...')
#             child = self.children[i]
#             if child and (not uptoismine or child.containsblock(name)):
#                 if len(split) == 0:
#                     if i != len(self.splits) - 1:
#                         raise AttributeError('Empty split encountered')
#                     group_x = self.remains(x)
#                 else:
#                     group_x = self.split(x, split)
                    
#                 rx, ry, rid = child(runspec, group_x, y, id)
#                 if not isinstance(rx, pd.DataFrame):
#                     rx = pd.DataFrame(rx)
#                     if len(rx.columns) == len(group_x.columns):
#                         rx.columns = group_x.columns
#                 results.append(pd.DataFrame(rx))
#                 if self.out_y == i + 1:
#                     out_y = ry
#                 if self.out_id == i + 1:
#                     out_id = rid
#         if not len(results):
#             return [[]], out_y
#         results = pd.concat(results, axis=1)
#         #results.columns = range(results.columns.size)
#         return results, out_y, out_id

class Parent(Block):
    """
    Representing group of blocks

    Parameters
    ----------
    isoloated: boolean, default=False
        whether processing is isolated and result will not be passed further along, useful for 
        interactive analysis
    """
    def __init__(self, isolated:bool=False, **kwargs: dict)->None:
        super().__init__(**kwargs)
        self.isolated = isolated
        self.child = {}
    
    def __setitem__(self, key: int, block: Block):
        self.child[key] = block
    
    def __getitem__(self, key: int):
        return self.child[key]
    
    def dump(self) -> dict:
        r = super().dump()
        r["_children"] = {i: self.child[i].dump() for i in self.child.keys()}
        r["isolated"] = self.isolated
        return r
    
    def run(self, runspec: RunSpec, x:pd.DataFrame, y=None, id=None)->tuple:
        thisx = x
        thisy = y
        thisid = id
        for k in sorted(self.child.keys()):
            thisx, thisy, thisid = self.child[k](runspec, thisx, thisy, thisid)
            if runspec.mode == RunSpec.RunMode.BREAK:
                break
        if self.isolated and runspec.upto != self.name and runspec.mode != RunSpec.RunMode.BREAK:
            return x, y, id
        return thisx, thisy, thisid

class Loop(Parent):
    """
    Block with looping function, sub-classes simply overrides loop() to create
    generators for loops 

    Parameters
    ----------
    output_type: Option(all,last,inplace), default=all
        select how should the output be
        all: discard input and output all processed set (for aggregation)
        last: discard input and output only the last set
        inplace: return input and discard output from children (suitable for in-place data manipulation)
    """
    def __init__(self, output_type:str='all', **kwargs: dict) -> None:
        super().__init__(**kwargs)
        self.output_type = output_type.lower()

    def loop(self, runspec:RunSpec, x, y=None, id=None) -> Generator[tuple, None, None]:
        """
        Default generators
        
        Parameters
        ----------
        runspec : RunSpec
            subclass can change runspec, but creating new may break the pipeline
        x : any
        y : any

        Yields
        -------
        val : tuple(x, y, id)
            one input for the inner block
        """
        yield (x, y, id)

    def run(self, runspec: RunSpec, x:pd.DataFrame, y=None, id=None)->tuple:
        """
        Simply calls loop to yield inputs and feeds into inner block
        returns last block result
        """
        outx:pd.DataFrame = x if self.output_type == 'inplace' else None
        outy:pd.DataFrame = y if self.output_type == 'inplace' else None
        outid:pd.DataFrame = id if self.output_type == 'inplace' else None
        for lx, ly, lid in self.loop(runspec, x, y, id):
            thisx, thisy, thisid = super().run(runspec, lx, ly, lid)
            if self.output_type == 'last' or outx is None:
                outx = thisx
                outy = thisy
                outid = thisid
            elif self.output_type == 'all':
                outx = outx.append(thisx)
                outy = outy.append(thisy) if outy is not None else thisy
                outid = outid.append(thisid) if outid is not None else thisid
            if runspec.mode == RunSpec.RunMode.BREAK:
                break
        return outx, outy, outid
    def dump(self) -> dict:
        result = super().dump()
        result["output_type"] = self.output_type
        return result

class Placeholder(Block):
    """
    No-op block as a place holder for any client-side only block
    """
    def __init__(self, **kwargs: dict) -> None:
        self.kwargs = kwargs

    def dump(self) -> dict:
        return self.kwargs
        
    def __call__(self, runspec: RunSpec, x, y, id) -> tuple:
        return x, y, id

class SetVariable(Block):
    """
    Create a variable and retrieve later

    Parameters
    ----------
    formula : string
        value of the variable, could be constant or formula
    """
    def __init__(self, formula:str, **kwargs: dict) -> None:
        super(**kwargs)
        self.formula = formula
    
    def run(self, runspec: RunSpec, x: pd.DataFrame, y, id) -> tuple:
        runspec.set_variable(self.name, Block.resolvearg(x, self.formula, False))
        return x, y, id

class GenericClassMethod(Block):
    """
    Calls any class methods, e.g. sklearn.metrics.pairwise_distances or pandas.get_dummies
    This block expects transforming output
    instead.

    Parameters
    ----------
    method : str
        name of method
    xname : str
        name or pos of x-param
    yname : str
        name or pos of y-param
    """
    def __init__(self, _method:str=None, xname=None, yname=None, keepcolnames=True, args:list=None, kargs:dict=None, **kwargs):
        super().__init__(**kwargs)
        if "name" in kwargs: del kwargs["name"]
        if "disable_mask" in kwargs: del kwargs["disable_mask"]
        #if not method.startswith("sklearn"):
        #    raise KeyError(f'{method} is not from sklearn')

        try:
            if xname == "": 
                xname = None
            else:
                xname = int(xname)
        except Exception:
            pass
        try:
            if yname == "":
                yname = None
            else:
                yname = int(yname)
        except Exception:
            pass
        
        self.method = _method
        self.func = None
        self.xname = xname
        self.yname = yname
        self.funcargs = args if args else []
        self.funckargs = kargs if kargs else {}
        self.keepcolnames = keepcolnames
        if isinstance(xname, int) and len(self.funcargs) <= xname:
            self.funcargs += [None] * (1 + xname - len(self.funcargs))
        if isinstance(yname, int) and len(self.funcargs) <= yname:
            self.funcargs += [None] * (1 + yname - len(self.funcargs))
    
    def loadmethod(self):
        func = self.method.split(".")
        package = ".".join(func[:-1])
        func = func[-1]
        package = import_module(package)
        func = getattr(package, func)
        if not callable(func):
            raise AttributeError(f'{self.method} is not a method')
        self.func = func

    def dump(self) -> dict:
        r = super().dump()
        r["_method"] = self.method
        r["xname"] = self.xname
        r["yname"] = self.yname
        r["args"] = self.funcargs
        r["kargs"] = self.funckargs
        r["keepcolnames"] = self.keepcolnames
        
        if isinstance(self.xname, int):
            r["args"][self.xname] = None
        elif self.xname is not None:
            r["kargs"][self.xname] = None
        if isinstance(self.yname, int):
            r["args"][self.yname] = None
        elif self.yname is not None:
            r["kargs"][self.yname] = None
        
        return r
    
    def resolvexyargs(self, x, y):
        if self.xname is not None:
            if isinstance(self.xname, int):
                self.funcargs[self.xname] = x
            else:
                self.funckargs[self.xname] = x
        if self.yname is not None:
            if isinstance(self.yname, int):
                self.funcargs[self.yname] = y
            else:
                self.funckargs[self.yname] = y
    
    def run(self, runspec:RunSpec, x, y=None, id=None):
        if self.func is None:
            self.loadmethod()
        self.resolvexyargs(x, y)
        newx = self.func(*self.funcargs, **self.funckargs)
        #
        # get rid of sparse matrix
        try:
            getattr(newx, "todense")  # checks if todense exists and calls
            newx = newx.todense()
        except Exception:
            pass
        if not isinstance(newx, pd.DataFrame):
            newx = pd.DataFrame(newx)
        if self.keepcolnames and len(newx.columns) == len(x.columns):
            newx.columns = x.columns
        return newx, y, id

# %%
if __name__ == "__main__":
    
    df = pd.DataFrame({"A": [0, 1, 2], "B": [3, 4, 5]})
    print('test plain block')
    a = Block()
    print(a(RunSpec(), df))
    
    print('test block with column filter')
    a = Block(column_mask=["A"], as_new_columns=True)
    print(a(RunSpec(), df))
    a = Block(column_mask=["A", "B"])
    print(a(RunSpec(), df))
    

    print('test block with row filter')
    a = Block(row_filter='A < 2')
    print(a(RunSpec(), df))
    a = Block(row_filter='B < 4', as_new_rows=True)
    print(a(RunSpec(), df))

# %%
if __name__ == "__main__":
    # test parent
    df = pd.DataFrame({"A": [0, 1, 2], "B": [3, 4, 5]})
    b = Parent()
    b[0] = Block(column_mask=["A"], as_new_columns=True, name="First")
    b[1] = Block(column_mask=["B"], as_new_columns=True, name="Second")
    b[2] = Block(column_mask=["A", "B"], name="Third")
    print(b(RunSpec(), df))
    print(b(RunSpec(upto="First"), df))
    
# %%
if __name__ == "__main__":
    class TestLoopBlock(Loop):
        def loop(self, runspec: RunSpec, x, y=None, id=None) -> Generator[tuple, None, None]:
            origmode = runspec.mode
            for i in range(1, 4):
                runspec.mode = RunSpec.RunMode.TRAIN
                yield np.array(x) * i * 10, y, id
                runspec.mode = RunSpec.RunMode.TEST
                yield np.array(x) * i * 10, y, id
            runspec.mode = origmode
    
    class TestValidateBlock(Block):
        def run(self, runspec: RunSpec, x, y=None, id=None) -> tuple:
            print(runspec.mode, x, y, id)
            return x, y, id

    testloopblock = TestLoopBlock()
    testloopblock[0] = TestValidateBlock()
    runspec = RunSpec(RunSpec.RunMode.RUN)
    print(testloopblock(runspec, [[1,2,3],[4,5,6]], [7, 8]))
    print(runspec)

# %%
