# %%
from pandas.core.frame import DataFrame
from skll.block import Block, Split, Parent, RunSpec
import numpy as np
import pandas as pd

class XyidSplit(Block):
    """
    Extract y(target) and/or id(reference) column from columns

    Parameters
    ----------
    ycol : string
    idcol : string
    name of the y(target) column
    """
    def __init__(self, ycol=None, idcol=None, **kwargs):
        super().__init__(**kwargs)
        self.ycol = ycol
        self.idcol = idcol
    
    def dump(self) -> dict:
        r = super().dump()
        r["ycol"] = self.ycol
        r["idcol"] = self.idcol
        return r

    def __extractcol(self, x, col):
        # if isinstance(x, np.ndarray):
        #     return np.delete(x, col, 1), x[:, col]
        # elif isinstance(x, pd.DataFrame):
            return x.loc[:, x.columns != col], x[col]
        # elif isinstance(x, list):
        #     y = np.zeros(len(x))
        #     for i, r in enumerate(x):
        #         y[i] = r[col]
        #         del r[col]
        #     return x, y
        # raise TypeError(f'Unsupported input type {type(x)}')

    def run(self, runspec: RunSpec, x, y=None, id=None):
        if not isinstance(x, pd.DataFrame):
            x = pd.DataFrame(x)
        if self.ycol is not None:
            x, y = self.__extractcol(x, self.ycol)
        if self.idcol is not None:
            x, id = self.__extractcol(x, self.idcol)
        return x, y, id

# %%
if __name__ == "__main__":
    xysplit = XyidSplit(ycol=1, idcol=2)
    print(xysplit(RunSpec(), np.array([[0,1,2], [3,4,5], [6,7,8]])))
    print(xysplit(RunSpec(), pd.DataFrame([[0,1,2], [3,4,5], [6,7,8]])))
    print(xysplit(RunSpec(), [[0,1,2], [3,4,5], [6,7,8]]))
# %%
class ColumnWise(Parent):
    """
    Split columns into groups of one column each, for per-column processing
    """
    def run(self, runspec: RunSpec, x, y=None, id=None)->tuple:
        results = {}
        if not isinstance(x, pd.DataFrame):
            x = pd.DataFrame(x)
        for cname in x.columns:
            runspec.out.working(f'In {self.name} processing column {cname}...')
            rx = self.child(runspec, x[cname], y, id)
            results[cname] = rx[0]
        if not len(results):
            return [[]], y, id
        return pd.DataFrame(results), y, id
# %%
if __name__ == "__main__":
    columnwise = ColumnWise()
    columnwise[1] = Block()
    print(columnwise(RunSpec(), pd.DataFrame([[0,1,2], [3,4,5], [6,7,8]], columns=["a", "b", "c"])))

# %%
class TypeSplit(Split):
    """
    Split columns into groups by it's data type

    Parameters
    ----------
    splits : list[list[str]]
        list of data types
    out_y : int
        if set, use y column from output group for next block instead of y 
        column from previous block
    convert_types : bool
        whether should try convert data types to numbers before splitting
    """
    def __init__(self, convert_types:bool=True, **kwargs: dict) -> None:
        super().__init__(**kwargs)
        self.c_types = convert_types

    def dump(self) -> dict:
        r = super().dump()
        r["convert_types"] = self.c_types
        return r

    def split(self, x, split):
        cols = [i for i in x.columns if x[i].dtype in split]
        res = x.loc[:, cols]
        # print(f'{split} got {cols}')
        self.allcols += cols
        return res

    def convert_types(self, x):
        if not isinstance(x, pd.DataFrame):
            x = pd.DataFrame(x)
        if not self.c_types:
            return x
        for col in x.columns:
            try:
                x[col] = x[col].astype("int")
            except ValueError:
                try:
                    x[col] = x[col].astype("float")
                except ValueError:
                    try:
                        x[col] = x[col].astype("string")
                    except ValueError:
                        pass  # leave it's type as is
        return x

    def run(self, runspec: RunSpec, x, y=None, id=None):
        x = self.convert_types(x)
        return super(TypeSplit, self).run(runspec, x, y, id)
# %%
if __name__ == "__main__":
    from skll.block import Input
    input = Input("file://train.csv")
    input[0] = TypeSplit(splits=[["int32", "float64"], ["string"]])
    input[0][1] = Block()
    input[0][2] = Block()
    print(input(RunSpec(upto=input[0][1].name), None))
# %%

from skll.block.sklwrapper import SklSplitter
class RunModeSplit(SklSplitter):
    """
    Split dataset row-wise for train and test run
    Different from SklSplitter(), this block 
    do not loop and returns only one set depending on the RunSpec
    """

    def __init__(self, **kwargs):
        if not "cls" in kwargs:
            kwargs["cls"] = "sklearn.model_selection.ShuffleSplit"
        super().__init__(**kwargs)

    def run(self, runspec: RunSpec, x, y=None, id=None):
        if runspec.mode not in [RunSpec.RunMode.TRAIN, RunSpec.RunMode.TEST]:
            return x, y
        
        if runspec.cleanrun:
            self.obj = None
        if not self.obj:
            self.createobject()

        if id is None:
            if not isinstance(x, pd.DataFrame):
                x = pd.DataFrame(x)
            id = pd.Series(x.index)

        trains, tests = self.obj.split(x).send(None)
        if runspec.mode == RunSpec.RunMode.TRAIN:
            ids = trains
        else:
            ids = tests
        id = id.loc[ids]
        x = x.loc[ids]
        if y: y = y.loc[ids]
        return x, y, id

# %%    
if __name__ == "__main__":
    from skll.block import Input
    input = Input("file://train.csv")
    input[0] = RunModeSplit()
    print(input(RunSpec(), None))

# %%
