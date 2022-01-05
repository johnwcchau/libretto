# %%
from typing import Generator
from skll.block import Block, Loop, RunSpec
from skll.block.baseblock import import_load
from importlib import import_module
import pandas as pd

class SklClass(Block):
    def __init__(self, cls:str=None, trainmethod:str=None, testmethod:str=None, scoremethod:str=None, keepcolnames=True, initargs:list=None, initkargs:dict=None, **kwargs):
        super().__init__(**kwargs)
        #if not cls.startswith("sklearn"):
        #    raise KeyError(f'{cls} is not from sklearn')
        self.obj = None
        self.cls = cls
        self.trainmethodname = trainmethod
        self.testmethodname = testmethod
        self.scoremethodname = scoremethod
        self.initargs = initargs if initargs else []
        self.initkargs = initkargs if initkargs else {}
        self.testaftertrain = False
        self.keepcolnames = keepcolnames

    def dump(self) -> dict:
        r = super().dump()
        r["cls"] = self.cls
        r["trainmethod"] = self.trainmethodname
        r["testmethod"] = self.testmethodname
        r["scoremethod"] = self.scoremethodname
        r["initargs"] = self.initargs
        r["initkargs"] = self.initkargs
        return r
    
    def createobject(self):
        if self.cls is None:
            raise AttributeError('No class specified')
        self.obj = import_load(self.cls)(*self.initargs, **self.initkargs)
        if not self.testmethodname:
            self.testmethodname = [attr for attr in ["predict", "transform"] if hasattr(self.obj, attr)]
            if len(self.testmethodname): self.testmethodname = self.testmethodname[0]
        if not self.trainmethodname:
            self.trainmethodname = [attr for attr in ["fit_predict", "fit_transform"] if hasattr(self.obj, attr)]
            if len(self.trainmethodname): 
                self.trainmethodname = self.trainmethodname[0]
            elif self.testmethodname and hasattr(self.obj, "fit"):
                self.trainmethodname = "fit+test"
        if self.scoremethodname is None:
            if hasattr(self.obj, "score"): self.scoremethodname = "score"

        if self.trainmethodname == "fit+test":
            self.trainmethod = getattr(self.obj, "fit")
            self.testaftertrain = True
        elif self.trainmethodname and hasattr(self.obj, self.trainmethodname): 
            self.trainmethod = getattr(self.obj, self.trainmethodname)
        if self.testmethodname and hasattr(self.obj, self.testmethodname): 
            self.testmethod = getattr(self.obj, self.testmethodname)
        if self.scoremethodname and hasattr(self.obj, self.scoremethodname): 
            self.scoremethod = getattr(self.obj, self.scoremethodname)

        if not hasattr(self, "trainmethod") or not callable(self.trainmethod):
            raise AttributeError('Invalid method for train')
        if not hasattr(self, "testmethod") or not callable(self.testmethod):
            raise AttributeError('Invalid method for test')

    def run(self, runspec: RunSpec, x, y=None, id=None):
        if runspec.cleanrun:
            self.obj = None
        if self.obj == None:
            self.createobject()
        if runspec.mode in [RunSpec.RunMode.TEST, RunSpec.RunMode.RUN]:
            res = self.testmethod(x)
            if runspec.mode == RunSpec.RunMode.TEST and hasattr(self, "scoremethod"):
                runspec.scores.append((self.name, self.scoremethod(x, y)))
        else:
            if self.testaftertrain:
                self.trainmethod(x, y)
                res = self.testmethod(x)
            else:
                res = self.trainmethod(x, y)
        res = pd.DataFrame(res)
        if self.keepcolnames and len(res.columns) == len(x.columns):
            res.columns = x.columns
        return res, y, id

class Method(Block):
    """
    Calls sklearn non-class methods, e.g. sklearn.metrics.pairwise_distances
    This block expects transforming output, for scoring use SklScoringMethod block 
    instead.

    Parameters
    ----------
    method : str
    xname : str
    yname : str
    """
    def __init__(self, method:str=None, xname=None, yname=None, keepcolnames=True, args:list=None, kargs:dict=None, **kwargs):
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
        
        self.method = method
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
        r["method"] = self.method
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
        if not isinstance(newx, pd.DataFrame):
            newx = pd.DataFrame(newx)
        if self.keepcolnames and len(newx.columns) == len(x.columns):
            newx.columns = x.columns
        return newx, y, id

class SklScoringMethod(Method):
    """
    A method, instead of transforming data, generate a score and append to score list
    """
    def run(self, runspec: RunSpec, x, y=None, id=None):
        if runspec.mode == RunSpec.RunMode.RUN:
            self.resolvexyargs(x, y)
            runspec.scores.append((self.name, self.func(*self.funcargs, **self.funckargs)))
        return x, y, id

class SklSplitter(Loop):
    """
    SKlearn dataset splitters (like K-fold)
    """
    def __init__(self, cls: str, initargs:list=None, initkargs:dict=None, **kwargs):
        super().__init__(**kwargs)
        self.cls = cls
        self.initargs = initargs if initargs else []
        self.initkargs = initkargs if initkargs else {}
        self.obj = None
        
    def dump(self) -> dict:
        r = super().dump()
        r["cls"] = self.cls
        r["initargs"] = self.initargs
        r["initkargs"] = self.initkargs
        return r
        
    def createobject(self):
        self.obj = import_load(self.cls)(*self.initargs, **self.initkargs)
        if not hasattr(self.obj, "split"):
            raise TypeError(f'{self.cls} has no split function')
        
    def loop(self, runspec:RunSpec, x, y=None, id=None) -> Generator[tuple, None, None]:
        if runspec.mode != RunSpec.RunMode.TEST:
            yield x, y, id
            return
            
        if runspec.cleanrun:
            self.obj = None
        if self.obj is None:
            self.createobject()

        if not isinstance(x, pd.DataFrame):
            x = pd.DataFrame(x)

        origmode = runspec.mode
        print(f"Begin Split")
        i = 1
        for train, test in self.obj.split(x):
            thisx = x.loc[train]
            thisy = y[train] if y is not None else None
            thisid = id[train] if id is not None else None
            runspec.mode = RunSpec.RunMode.TRAIN
            runspec.out.working(f'In {self.name} step {i} training pass...')
            yield thisx, thisy, thisid
            thisx = x.loc[test]
            thisy = y[test] if y is not None else None
            thisid = id[test] if id is not None else None
            runspec.out.working(f'In {self.name} step {i} testing pass...')
            runspec.mode = RunSpec.RunMode.TEST
            yield thisx, thisy, thisid
            i += 1
        runspec.mode = origmode

class SklWrappingClass(SklClass):
    """
    Block for ensembles, pipeline or hyperparameter searching
    """
    def __init__(self, estname:str="estimator", multiple:bool=False, **kwargs):
        super().__init__(**kwargs)
        try:
            estname = int(estname)
        except Exception:
            pass
        self.estname = estname
        self.multiple = multiple
        self.child:dict[int,SklClass] = {}

    def dump(self) -> dict:
        r = super().dump()
        r["estname"] = self.estname
        r["multiple"] = self.multiple
        r["_children"] = {i: self.child[i].dump() for i in self.child.keys()}
        if isinstance(self.estname, int):
            r["initargs"][self.estname] = None
        else:
            r["initkargs"][self.estname] = None
        return r
        
    def __setitem__(self, key: int, block: Block):
        if not isinstance(block, SklClass):
            raise KeyError(f'child is not a sklearn estimator')
        self.obj = None
        self.child[key] = block
    
    def __getitem__(self, key: int) -> Block:
        return self.child[key]

    def createobject(self):
        if len(self.child) == 0:
            raise AttributeError(f'Estimator is not set')
        if not self.multiple:
            child = self.child[0]
            if not child.obj:
                child.createobject()
            est = child.obj
        else:
            est = []
            for key in sorted(self.child.keys()):
                child = self.child[key]
                if isinstance(child.disable_mask, list) and len(child.disable_mask) > 0:
                    continue
                if child.obj is None:
                    child.createobject()
                est.append((child.name, child.obj))
        if isinstance(self.estname, int):
            self.initargs[self.estname] = est
        else:
            self.initkargs[self.estname] = est
        super().createobject()

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
    sklmethod = Method("sklearn.metrics.pairwise_distances", "X", "Y")
    print(sklmethod(RunSpec(), [[0], [2], [1], [3]], [[0], [1], [2], [3]]))
    sklmethod = SklScoringMethod("sklearn.metrics.accuracy_score", "y_pred", "y_true")
    print(sklmethod(RunSpec(), [[0], [2], [1], [3]], [[0], [1], [2], [3]]))
    runspec = RunSpec(mode=RunSpec.RunMode.RUN)
    sklmethod(runspec, [[0], [2], [1], [3]], [[0], [1], [2], [3]])
    print(runspec.scores)
# %%
if __name__ == "__main__":
    from sklearn.datasets import make_classification
    X, y = make_classification(random_state=0)
    pipe = SklWrappingClass(cls="sklearn.pipeline.Pipeline", multiple=True, estname="steps", trainmethod="fit+test", testmethod="predict")
    pipe[0] = SklClass("sklearn.preprocessing.StandardScaler")
    pipe[1] = SklClass("sklearn.svm.SVC")
    rs = RunSpec()
    out = pipe(rs, X, y)
    print(out[0])
    rs.mode = RunSpec.RunMode.TEST
    pipe(rs, X, y)
    print(rs.scores)

# %%
if __name__ == "__main__":
    from skll.block.input import Input
    input = Input("kaggle_hpp_train.csv")
    from skll.block.baseblock import Split
    from skll.block.splitter import XyidSplit
    input[0] = Split([["MSSubClass", "LotArea", "YrSold", "SalePrice"]], out_y=1)
    input[0][1] = XyidSplit("SalePrice")
    input[0][1][0] = SklClass("sklearn.linear_model.LinearRegression", trainmethod="fit+test", testmethod="predict", scoremethod="score")
    out = input(RunSpec(), None, None)
    print(out[0])

# %%
if __name__ == "__main__":
    from sklearn import datasets
    iris = datasets.load_iris()
    block = SklWrappingClass(cls="sklearn.model_selection.GridSearchCV", initkargs={"param_grid": {'kernel':('linear', 'rbf'), 'C':[1, 10]}})
    block[0] = SklClass("sklearn.svm.SVC")
    out = block(RunSpec(), iris.data, iris.target)

# %%    
if __name__ == "__main__":
    from skll.block import FileInput
    input = FileInput("kaggle_titanic_train.csv")
    input[0] = RunModeSplit()
    print(input(RunSpec(), None))
    
# %%
