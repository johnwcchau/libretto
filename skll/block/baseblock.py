# %%

from __future__ import annotations
from dataclasses import dataclass, field
from importlib import import_module
from typing import Generator
from uuid import uuid4
from enum import Enum
import numpy as np
import pandas as pd

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
        Preview is row limited fit-predict
        Train is fit-predict
        Test is fold + predict/transform + score
        Run is predict/transform
        """
        PREVIEW = 1
        TRAIN = 2
        TEST = 3
        RUN = 4
    
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
    def __init__(self, name:str=None, disable_mask:list=None, **kwargs:dict)->None:
        self.name = name if name else str(uuid4())
        self.disable_mask = disable_mask if isinstance(disable_mask, list) else []
        self.next = None

    def __getitem__(self, key:int)->Block:
        return self.next

    def __setitem__(self, key:int, block:Block)->None:
        """
        Set child block for output group [key], or key 0 for next block
        """
        self.next = block

    @classmethod
    def load(cls, obj:dict)->Block:
        if not "_type" in obj:
            raise KeyError(f'Invalid input')
        type = obj["_type"]
        args = {k: v for k, v in obj.items() if not k.startswith("_")}
        res = import_load(type)(**args)
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
        }
    
    def containsblock(self, name:str)->bool:
        """
        Returns True if this block is required 
        to be evaluated for up-to block
        """
        if name == self.name:
            return True
        return self.next and self.next.containsblock(name)
    
    def run(self, runspec:RunSpec, x, y=None, id=None)->tuple:
        return x, y, id
    
    def __call__(self, runspec:RunSpec, x, y=None, id=None)->tuple:
        if not runspec.mode in self.disable_mask:
            runspec.out.working(f'Processing {self.name}...')
            x, y, id = self.run(runspec, x, y, id)
        if not runspec.upto == self.name and self.next:
            return self.next(runspec, x, y, id)
        return x, y, id

class Split(Block):
    """
    Split block which splits input columns to multiple groups, process and 
    group back in return

    Parameters
    ----------
    splits : list<list<str>>
        list of columns list
    out_y : int
        if set, use y column from output group for next block instead of y 
        column from previous block
    """
    def __init__(self, splits:list[list]=None, out_y="inherit", out_id="inherit", **kwargs:dict)->None:
        super().__init__(**kwargs)
        self.children:list[Block] = [None] * len(splits)
        self.splits = splits
        self.out_y = out_y
        self.out_id = out_id
    
    def __getitem__(self, key:int)->Block:
        if key == 0:
            return self.next
        return self.children[key - 1]

    def __setitem__(self, key: int, block: Block)->None:
        if key == 0:
            self.next = block
        elif key <= len(self.splits):
            key -= 1
            self.children[key] = block
    
    def dump(self) -> dict:
        r = super().dump()
        r["splits"] = self.splits
        r["out_y"] = self.out_y
        r["out_id"] = self.out_id
        _children = {}
        for i,v in enumerate(self.children):
            _children[i+1] = v.dump()
        r["_children"] = _children
        return r

    def containsblock(self, name: str)->bool:
        if super().containsblock(name): return True
        for child in self.children:
            if child and child.containsblock(name): return True
        return False

    def resetsplit(self):
        self.allcols = []

    def split(self, x, split):
        self.allcols += split
        if isinstance(x, np.ndarray):
            return x[split]
        if isinstance(x, pd.DataFrame):
            v = x[split]
            #if isinstance(v, pd.DataFrame): v.columns = range(v.columns.size)
            return v
        if isinstance(x, list):
            return [[r[c] for c in split] for r in x]
        raise TypeError(f'Unsupported input type {type(x)}')

    def remains(self, x):
        split = [c for c in x.columns if c not in self.allcols]
        # print(f'what remains: {split}')
        if isinstance(x, np.ndarray):
            return x[split]
        if isinstance(x, pd.DataFrame):
            v = x[split]
            return v
        if isinstance(x, list):
            return [[r[c] for c in split] for r in x]
        raise TypeError(f'Unsupported input type {type(x)}')

    def run(self, runspec: RunSpec, x, y=None, id=None)->tuple:
        results = []
        out_y = y
        out_id = id
        name = runspec.upto
        self.resetsplit()
        for i, split in enumerate(self.splits):
            runspec.out.working(f'In {self.name} processing group {i}...')
            child = self.children[i]
            if child and (not name or child.containsblock(name)):
                if len(split) == 0:
                    if i != len(self.splits) - 1:
                        raise AttributeError('Empty split encountered')
                    group_x = self.remains(x)
                else:
                    group_x = self.split(x, split)
                    
                rx, ry, rid = child(runspec, group_x, y, id)
                if not isinstance(rx, pd.DataFrame):
                    rx = pd.DataFrame(rx)
                    if len(rx.columns) == len(group_x.columns):
                        rx.columns = group_x.columns
                results.append(pd.DataFrame(rx))
                if self.out_y == i + 1:
                    out_y = ry
                if self.out_id == i + 1:
                    out_id = rid
        if not len(results):
            return [[]], out_y
        results = pd.concat(results, axis=1)
        #results.columns = range(results.columns.size)
        return results, out_y, out_id

class Parent(Block):
    def __init__(self, **kwargs: dict)->None:
        super().__init__(**kwargs)
        self.child = None
    
    def __setitem__(self, key: int, block: Block):
        if key == 0:
            self.next = block
        else:
            self.child = block
    
    def __getitem__(self, key: int):
        if key == 0:
            return self.next
        return self.child
    
    def dump(self) -> dict:
        r = super().dump()
        r["_children"] = {1: self.child.dump()}
        return r
    
    def run(self, runspec: RunSpec, x, y=None, id=None)->tuple:
        if self.child:
            return self.child(runspec, x, y, id)
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

    def run(self, runspec: RunSpec, x, y=None, id=None)->tuple:
        """
        Simply calls loop to yield inputs and feeds into inner block
        returns last block result
        """
        lastx = x
        lasty = y
        lastid = id
        for lx, ly, lid in self.loop(runspec, x, y, id):
            lastx, lasty, lastid = super().run(runspec, lx, ly, lid)
        return lastx, lasty, lastid
# %%

if __name__ == "__main__":
    a = Block()
    print(a(RunSpec(), [[0, 1, 2], [3, 4, 5]]))
    b = Split([[0], [1, 2]])
    a[0] = b
    b[1] = Block()
    b[2] = Split([[0],[1]])
    b[2][1] = Block()
    b[2][2] = Block()
    print(a(RunSpec(), [[0, 1, 2], [3, 4, 5]]))
    print(a(RunSpec(upto=b[2][1].name), [[0, 1, 2], [3, 4, 5]]))

# %%
if __name__ == "__main__":
    from skll.block.input import Input
    from skll.block.splitter import XyidSplit
    input = Input("file://train.csv")
    input[0] = Split([["MSSubClass", "LotArea", "YrSold", "SalePrice"]], out_y=1)
    input[0][1] = XyidSplit("SalePrice")
    print(input(RunSpec(), None, None))
# %%
if __name__ == "__main__":
    class TestLoopBlock(Loop):
        def loop(self, runspec: RunSpec, x, y=None) -> Generator[tuple, None, None]:
            origmode = runspec.mode
            for i in range(1, 4):
                runspec.mode = RunSpec.RunMode.TRAIN
                yield np.array(x) * i * 10, y
                runspec.mode = RunSpec.RunMode.TEST
                yield np.array(x) * i * 10, y
            runspec.mode = origmode
    
    class TestValidateBlock(Block):
        def run(self, runspec: RunSpec, x, y=None) -> tuple:
            print(runspec.mode, x, y)
            return x, y

    testloopblock = TestLoopBlock()
    testloopblock[1] = TestValidateBlock()
    runspec = RunSpec(RunSpec.RunMode.RUN)
    print(testloopblock(runspec, [[1,2,3],[4,5,6]], [7, 8]))
    print(runspec)

# %%
if __name__ == "__main__":
    from skll.block.input import Input
    from skll.block.splitter import XySplit
    input = Input("file://train.csv")
    input[0] = Split([["MSSubClass", "LotArea", "YrSold", "SalePrice"], []], out_y=1)
    input[0][1] = XyidSplit("SalePrice")
    input[0][2] = Block()
    out = input(RunSpec(), None, None)
# %%
