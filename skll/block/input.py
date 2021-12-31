# %%
from skll.block import Block, RunSpec
import pandas as pd
from skll.fileio import FileIO

class Input(Block):
    def __init__(self, url:str = None, **kwargs):
        """
        SK-ll input block

        Parameters
        ----------
        url : str
        begins with "file://" or "sqlite://"
        In case of "file://", format is "file://<path>"
        In case of "sqlite://", format is "sqlite://<dbpath>/<select sql>"

        """
        super().__init__(**kwargs)
        self.url = url
    
    def __seturl(self):
        fileio = FileIO()
        if not self.url:
            raise AttributeError('No input specified')
        url = self.url
        if url.startswith(r"file://"):
            filename, valid = fileio._getvalidpath(url.replace("file://", ""), checkfile=True)
            if not valid: raise Exception(f'Cannot open {url}')
            ext = filename.split(".")[-1].lower()
            if ext == "csv":
                self.df = pd.read_csv(filename)
                return
            elif ext == "xls" or ext == "xlsx":
                self.df = pd.read_excel(filename)
                return
        elif url.startswith(r"sqlite://"):
            sql = url.replace("sqlite://", "").split("//", 1)
            filename, valid = fileio._getvalidpath(sql[0])
            if not valid: raise Exception(f'Cannot open {url}')
            sql = sql[1]
            import sqlite3
            with sqlite3.Connection(filename) as conn:
                self.df = pd.read_sql(sql, conn)
                return
        raise Exception(f'Cannot open {url}')

    def run(self, runspec: RunSpec, x, y=None, id=None):
        if not hasattr(self, "df") or self.df is None:
            self.__seturl()
        runspec.out.working(f'Input {self.name} has {self.df.shape[0]} rows and {self.df.shape[1]} columns')
        if runspec.mode == RunSpec.RunMode.PREVIEW or runspec.mode == RunSpec.RunMode.COLUMNS:
            runspec.out.working(f'Limiting to 100 rows for preview')
            return self.df.iloc[:100], None, None
        else:
            return self.df, None, None
    
    def dump(self) -> dict:
        r = super().dump()
        r["url"] = self.url
        return r
# %%
if __name__ == "__main__":
    input = Input("file://train.csv")
    input.run(RunSpec(RunSpec.RunMode.PREVIEW), None)

class Drop(Block):
    def __init__(self, cols: list, **kwargs: dict) -> None:
        super().__init__(**kwargs)
        self.cols = cols
    
    def dump(self) -> dict:
        r = super().dump()
        r["cols"] = self.cols
        return r
    
    def run(self, runspec: RunSpec, x, y=None, id=None) -> tuple:
        if not isinstance(x, pd.DataFrame):
            x = pd.DataFrame(x)
        return x.drop(self.cols, axis=1), y, id
