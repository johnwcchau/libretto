# %%

from __future__ import annotations
from dataclasses import dataclass, field
from importlib import import_module
from typing import Generator
from uuid import uuid4
from enum import Enum
import numpy as np
import pandas as pd
import traceback

from skll.inout import Output
from skll.tpe import TPE

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
    Only for test, append (block_name, score) into this list
    Can have multiple scores in case of kfolds / ensembled methods
    """
    scores:list[float] = field(default_factory=list)
    """
    logs and progress to write to
    """
    out:Output = field(default_factory=Output)

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
    def __init__(self, name:str=None, column_mask:list=None, as_new_columns:bool=False, disable_mask:list=None, **kwargs:dict)->None:
        self.name = name if name else str(uuid4())
        self.disable_mask = []
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

    def __getitem__(self, key:int)->Block:
        return None

    def __setitem__(self, key:int, block:Block)->None:
        """
        Set child block for output group [key], or key 0 for next block
        """
        pass

    @classmethod
    def load(cls, obj:dict)->Block:
        if not "_type" in obj:
            raise KeyError(f'Invalid input')
        type = obj["_type"]
        args = {k: v for k, v in obj.items() if not k.startswith("_")}
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
            "_type": typestr,
            "_next": self[0].dump() if self[0] else None,
            "name": self.name,
            "disable_mask": self.disable_mask,
            "column_mask": self.column_mask,
        }
    
    def containsblock(self, name:str)->bool:
        """
        Returns True if this block is required 
        to be evaluated for up-to block
        """
        if name == self.name:
            return True
        return self.next and self.next.containsblock(name)
    
    def run(self, runspec:RunSpec, x:pd.DataFrame, y=None, id=None)->tuple:
        return x, y, id
    
    def __call__(self, runspec:RunSpec, x, y=None, id=None)->tuple:
        if runspec.mode == RunSpec.RunMode.BREAK:
            return x, y, id
        if runspec.mode == RunSpec.RunMode.COLUMNS and runspec.upto == self.name:
            runspec.mode = RunSpec.RunMode.BREAK
            return x, y, id
        if not runspec.mode in self.disable_mask:
            runspec.out.working(f'Processing {self.name}...')
            if x is not None and not isinstance(x, pd.DataFrame):
                x = pd.DataFrame(x)
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
        if runspec.upto == self.name:
            runspec.mode = RunSpec.RunMode.BREAK
        return x, y, id

class Drop(Block):
    def run(self, runspec: RunSpec, x: pd.DataFrame, y, id) -> tuple:
        return None, y, id

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
    def __init__(self, **kwargs: dict)->None:
        super().__init__(**kwargs)
        self.child = {}
    
    def __setitem__(self, key: int, block: Block):
        self.child[key] = block
    
    def __getitem__(self, key: int):
        return self.child[key]
    
    def dump(self) -> dict:
        r = super().dump()
        r["_children"] = {i: self.child[i].dump() for i in self.child.keys()}
        return r
    
    def run(self, runspec: RunSpec, x:pd.DataFrame, y=None, id=None)->tuple:
        for k in sorted(self.child.keys()):
            x, y, id = self.child[k](runspec, x, y, id)
            if runspec.mode == RunSpec.RunMode.BREAK:
                break
        return x, y, id

class Loop(Parent):
    """
    Block with looping function, sub-classes simply overrides loop() to create
    generators for loops 
    """

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
        val : tuple(RunSpec, x, y)
            one input for the inner block
        """
        yield (x, y, id)

    def run(self, runspec: RunSpec, x:pd.DataFrame, y=None, id=None)->tuple:
        """
        Simply calls loop to yield inputs and feeds into inner block
        returns last block result
        """
        lastx = x
        lasty = y
        lastid = id
        for lx, ly, lid in self.loop(runspec, x, y, id):
            lastx, lasty, lastid = super().run(runspec, lx, ly, lid)
            if runspec.mode == RunSpec.RunMode.BREAK:
                break
        return lastx, lasty, lastid
# %%
if __name__ == "__main__":
    
    df = pd.DataFrame({"A": [0, 1, 2], "B": [3, 4, 5]})
    # test plain block
    a = Block()
    print(a(RunSpec(), df))
    
    # test block with column filter
    a = Block(column_mask=["A"], as_new_columns=True)
    print(a(RunSpec(), df))
    a = Block(column_mask=["A", "B"])
    print(a(RunSpec(), df))
    
    # test drop
    a = Drop(column_mask=["A"])
    print(a(RunSpec(), df))
    a = Drop(column_mask=["A"], as_new_columns=True)
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
