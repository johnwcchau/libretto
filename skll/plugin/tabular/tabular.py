"""
Blocks for tabular input manipulation
- Read in
- Write out
- Impute (Fill in the blanks)
- Column add
- Row grouping
- Row aggregation
- Drop (row/column)

"""

# %%
from typing import Generator
from skll.baseblock import Block, Parent, Loop, RunSpec
import pandas as pd
from skll.fileio import FileIO
from sqlalchemy import create_engine

class FileInput(Block):
    """
    File input block

    Parameters
    ----------
    filename : str
        filename relative to storage directory
    """
    def __init__(self, filename:str = None, **kwargs):
        super().__init__(**kwargs)
        self.filename = filename
    
    def readin(self):
        fileio = FileIO()
        fname = self.filename
        if not fname:
            raise AttributeError('No file specified')
        filename, valid = fileio._getvalidpath(fname, checkfile=True)
        if not valid: raise Exception(f'{self.name}: Cannot open {fname}')
        ext = filename.split(".")[-1].lower()
        if ext == "csv":
            self.df = pd.read_csv(filename)
            return
        elif ext == "xls" or ext == "xlsx":
            self.df = pd.read_excel(filename)
            return
        raise Exception(f'{self.name}: Unknown format for {fname}')

    def run(self, runspec: RunSpec, x:pd.DataFrame, y=None, id=None):
        if not hasattr(self, "df") or self.df is None:
            self.readin()
        runspec.out.working(f'{self.name}: has {self.df.shape[0]} rows and {self.df.shape[1]} columns')
        if runspec.mode == RunSpec.RunMode.PREVIEW or runspec.mode == RunSpec.RunMode.COLUMNS:
            runspec.out.working(f'{self.name}: Limiting to 100 rows for preview')
            return self.df.iloc[:100], None, None
        else:
            return self.df, None, None
    
    def dump(self) -> dict:
        r = super().dump()
        r["filename"] = self.filename
        return r

class SQLInput(FileInput):
    """
    Input from DB

    Parameters
    ----------
    connstr : string
        connection url e.g. mysql://scott:tiger@localhost/test
    sql : string
        select statement
    """
    def __init__(self, connstr:str=None, sql:str = None, **kwargs):
        super().__init__(**kwargs)
        self.engine = None
        self.connstr = connstr
        self.sql = sql
    
    def readin(self):
        if self.engine is None:
            self.engine = create_engine(self.connstr)
        with self.engine.connect() as conn:
            self.df = pd.read_sql(self.sql, conn)

    def dump(self) -> dict:
        r = super().dump()
        r["connstr"] = self.connstr
        r["sql"] = self.sql
        return r

class FileOutput(Block):
    """
    Output to file

    Parameters
    ----------
    filename : str
        filename relative to storage directory
    """
    def __init__(self, filename:str = None, **kwargs):
        super().__init__(**kwargs)
        self.filename = filename
    
    def writeout(self, data:pd.DataFrame):
        fileio = FileIO()
        fname = self.filename
        if not fname:
            raise AttributeError('No file specified')
        filename, valid = fileio._getvalidpath(fname)
        if not valid: raise Exception(f'{self.name}: Cannot open {fname} for write')
        import os
        valid = os.path.isdir(filename)
        if valid: raise Exception(f'{self.name}: Cannot open {fname} for write')
        if os.path.exists(filename):
            header = False
        else:
            header = True
        with open(filename, "ab") as f:
            data.to_csv(f, index=False, header=header)
            
    def run(self, runspec: RunSpec, x: pd.DataFrame, y=None, id=None) -> tuple:
        #result = x
        #if not isinstance(result, pd.DataFrame):
        result = pd.DataFrame(x)
        if y is not None:
            result["__Y__"] = y
        if id is not None:
            result["__ID__"] = id
        self.writeout(result)
        return x, y, id

    def dump(self) -> dict:
        r = super().dump()
        r["filename"] = self.filename
        return r

class SQLOutput(FileOutput):
    """
    Output to SQL

    Parameters
    ----------
    connstr : string
        connection url e.g. mysql://scott:tiger@localhost/test
    tablename : string
        table to write to
    schema : string, default=None
        db schema
    """
    def __init__(self, connstr:str=None, tablename:str = None, schema:str=None, **kwargs):
        super().__init__(**kwargs)
        self.engine = None
        self.connstr = connstr
        self.tablename = tablename
        self.schema = schema
    
    def writeout(self, data:pd.DataFrame):
        if self.engine is None:
            self.engine = create_engine(self.connstr)
        with self.engine.connect() as conn:
            data.to_sql(self.tablename, conn, self.schema, if_exists='append', index=False)

    def dump(self) -> dict:
        r = super().dump()
        r["connstr"] = self.connstr
        r["tablename"] = self.tablename
        r["schema"] = self.schema
        return r

class Method(Block):
    """
    Calls table method

    Parameters
    ----------
    method : string
        method
    kargs : dict(string, string)
        arguments to method
    """
    def __init__(self, _method:str=None, kargs:dict=None, transpose:bool=False, **kwargs):
        super().__init__(**kwargs)
        
        self.method = _method
        self.funckargs = kargs if kargs else {}
        self.transpose = transpose

    def loadmethod(self, x):
        func = getattr(x, self.method)
        if not callable(func):
            raise AttributeError(f'{self.method} is not a method')
        return func

    def dump(self) -> dict:
        r = super().dump()
        r["_method"] = self.method
        r["kargs"] = self.funckargs
        return r

    def resolveargs(self, x, args:dict):
        finalargs = {}
        for name, arg in args.items():
            if isinstance(arg, dict):
                arg = self.resolveargs(x, arg)
            elif isinstance(arg, str):
                if arg.startswith("="):
                    arg = eval(arg[1:], globals(), x)
                elif arg.startswith("@"):
                    line = arg[1:]
                    arg = lambda r: eval(line, globals(), {"X": x, "x": r})
            finalargs[name] = arg
        return finalargs
        
    def run(self, runspec:RunSpec, x, y=None, id=None):
        func = self.loadmethod(x)
        args = self.resolveargs(x, self.funckargs)
        newx = func(**args)
        if not isinstance(newx, pd.DataFrame): newx = pd.DataFrame(newx)
        if self.transpose: newx = newx.transpose()
        return newx, y, id
    
# class RowWise(Block):
#     """
#     Apply formula row-wise
#     """
    
#     def __init__(self, to_column="", formula:str="", **kwargs:dict) -> None:
#         super().__init__(**kwargs)
#         self.formula = formula
#         self.to_column = to_column

#     def dump(self) -> dict:
#         r = super().dump()
#         r["to_column"] = self.to_column
#         r["formula"] = self.formula
#         return r

#     def run(self, runspec:RunSpec, X, y=None, id=None)->tuple:
#         if not isinstance(X, pd.DataFrame):
#             X = pd.DataFrame(X)
#         colname = self.to_column if self.to_column else self.name
#         X[colname] = X.apply(lambda x: eval(self.formula, globals(), {"X": X, "x": x}), axis=1)
#         return X, y, id

class Drop(Block):
    def run(self, runspec: RunSpec, x: pd.DataFrame, y, id) -> tuple:
        return None, None, None

class XyidSplit(Block):
    """
    Specify y(target) and/or id(reference) column from columns

    Parameters
    ----------
    ycol : string
    name of the y(target) column
    idcol : string
    name of the id(reference) column
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
        return x.loc[:, x.columns != col], x[col]

    def run(self, runspec: RunSpec, x, y=None, id=None):
        if not isinstance(x, pd.DataFrame):
            x = pd.DataFrame(x)
        if self.ycol is not None and self.ycol in x.columns:
            x, y = self.__extractcol(x, self.ycol)
        if self.idcol is not None and self.idcol in x.columns:
            x, id = self.__extractcol(x, self.idcol)
        return x, y, id

class ColumnWise(Parent):
    """
    Split columns into groups of one column each, for per-column processing
    """
    def run(self, runspec: RunSpec, x, y=None, id=None)->tuple:
        #
        # if run upto this, no work to do (user should set run upto inner block instead)
        if runspec.upto == self.name:
            runspec.mode = RunSpec.RunMode.BREAK
            return x, y, id
        results = {}
        if not isinstance(x, pd.DataFrame):
            x = pd.DataFrame(x)
        for cname in x.columns:
            runspec.out.working(f'In {self.name} processing column {cname}...')
            rx = super().run(runspec, x[cname], y, id)
            results[cname] = rx[0][cname]
        if not len(results):
            return [[]], y, id
        return pd.DataFrame(results), y, id

class Subset(Loop):
    """
    Create subset from dataset and process

    Parameters
    ----------
    method : string
        method
    kargs : dict(string, string)
        arguments to method
    """
    def __init__(self, _method:str=None, kargs:dict=None, **kwargs: dict) -> None:
        super().__init__(**kwargs)
        self.method = _method
        self.funckargs = kargs if kargs else {}
    
    def loadmethod(self, x):
        func = getattr(x, self.method)
        if not callable(func):
            raise AttributeError(f'{self.method} is not a method')
        return func

    def dump(self) -> dict:
        r = super().dump()
        r["_method"] = self.method
        r["kargs"] = self.funckargs
        return r
        
    def loop(self, runspec: RunSpec, x:pd.DataFrame, y, id) -> Generator[tuple, None, None]:
        if not self.method:
            yield x, y, id
            return
        func = self.loadmethod(x)

        for group in func(**self.funckargs):
            if isinstance(group, tuple):
                thisx = group[1]
            else:
                thisx = group
            idx = thisx.index
            thisy = y.loc[idx] if y is not None else None
            thisid = id.loc[idx] if id is not None else None
            yield thisx, thisy, thisid

# %%
if __name__ == "__main__":
    """
    Test file in/out
    """
    try:
        input = FileInput("/___NOT_EXIST__.csv")
        print(input.run(RunSpec(RunSpec.RunMode.PREVIEW), None))
    except Exception as e:
        print(repr(e))
    df = pd.DataFrame({"X": [0,1,2], "Y": [3,4,5], "ID":[6,7,8]})
    output = FileOutput("testoutput.csv")
    output(RunSpec(), df)
    input = FileInput("testoutput.csv")
    print(input(RunSpec(), None))
    import os
    os.remove("storage/testoutput.csv")
    
# %%
if __name__ == "__main__":
    """
    Test SQL in/out
    """
    df = pd.DataFrame({"X": [0,1,2], "Y": [3,4,5], "ID":[6,7,8]})
    output = SQLOutput("sqlite:///test.sqlite3", "test")
    output(RunSpec(), df)
    input = SQLInput("sqlite:///test.sqlite3", "select * from test")
    print(input(RunSpec(), None))
    os.remove("test.sqlite3")

# %%
if __name__ == "__main__":
    """
    Test method with constant param
    """
    import numpy as np
    df = pd.DataFrame({
        "A": [1, np.NaN, 1], 
        "B": [np.NaN, 2, 2], 
        "C": [3, 4, np.NaN]
    })
    impute = Method("fillna", {"value": "0"})
    print(impute(RunSpec(), df))
    
    """
    Test method with formula param
    """
    impute = Method("fillna", {"value": "=0"})
    print(impute(RunSpec(), df))
    impute = Method("fillna", {"value": "='a'"})
    print(impute(RunSpec(), df))
    impute = Method("fillna", {"value": "=max(C)"})
    print(impute(RunSpec(), df))
    
    """
    Test method with lambda param
    """
    apply = Method("apply", {"axis":1, "func": "@x.A if not pd.isna(x.A) else -1"})
    print(apply(RunSpec(), df))

# %%
if __name__ == "__main__":
    """
    test xy split
    """
    xysplit = XyidSplit(ycol=1, idcol=2)
    print(xysplit(RunSpec(), pd.DataFrame([[0,1,2], [3,4,5], [6,7,8]])))
    xysplit = XyidSplit(ycol="Y", idcol="ID")
    print(xysplit(RunSpec(), pd.DataFrame({"X": [0,1,2], "Y": [3,4,5], "ID":[6,7,8]})))

# %%
if __name__ == "__main__":
    """
    test ColumnWise
    """
    columnwise = ColumnWise()
    columnwise[0] = Block()
    print(columnwise(RunSpec(), pd.DataFrame([[0,1,2], [3,4,5], [6,7,8]], columns=["a", "b", "c"])))

# %%
if __name__ == "__main__":
    
    df = pd.DataFrame({"A": [0, 1, 2], "B": [3, 4, 5]})

    print('test drop')
    a = Drop(column_mask=["A"])
    print(a(RunSpec(), df))
    a = Drop(column_mask=["A"], as_new_columns=True)
    print(a(RunSpec(), df))

    print('test block with row filter and drop')
    a = Drop(row_filter='A < 2')
    print(a(RunSpec(), df))
    a = Drop(row_filter='B < 4', as_new_rows=True)
    print(a(RunSpec(), df))

    print('test block with filters')
    a = Drop(column_mask=['A'], row_filter='A < 2')
    print(a(RunSpec(), df))
    a = Drop(column_mask=['B'], row_filter='B < 4', as_new_rows=True)
    print(a(RunSpec(), df))

# %%

if __name__ == "__main__":
    """
    test Subset
    """
    df = pd.DataFrame({"A": [0, 1, 2, 0, 1, 2, 0], "B": [3, 4, 5, 6, 7, 8, 9]})
    y = pd.Series([10,11,12,13,14,15,16])
    groupby = Subset("groupby", {"by": ["A"]})
    print(groupby(RunSpec(), df, y))
    groupby = Subset("groupby", {"by": ["A"]}, output_type="all")
    print(groupby(RunSpec(), df, y))

    groupby = Subset("rolling", {"window": 3, "win_type":"gaussian"}, output_type="all")
    print(groupby(RunSpec(), df))
# %%
