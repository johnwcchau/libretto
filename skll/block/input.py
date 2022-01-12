# %%
from skll.block.baseblock import Block, RunSpec
import pandas as pd
from skll.fileio import FileIO

class FileInput(Block):
    def __init__(self, filename:str = None, **kwargs):
        """
        File input block

        Parameters
        ----------
        filename : str
            filename relative to storage directory
        """
        super().__init__(**kwargs)
        self.filename = filename
    
    def __readin(self):
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
            self.__readin()
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
# %%
if __name__ == "__main__":
    input = FileInput("/kaggle_titanic_train.csv")
    print(input.run(RunSpec(RunSpec.RunMode.PREVIEW), None))
    try:
        input = FileInput("/___NOT_EXIST__.csv")
        print(input.run(RunSpec(RunSpec.RunMode.PREVIEW), None))
    except Exception as e:
        print(repr(e))
    try:
        input = FileInput("/kaggle_titanic.json")
        print(input.run(RunSpec(RunSpec.RunMode.PREVIEW), None))
    except Exception as e:
        print(repr(e))
# %%
