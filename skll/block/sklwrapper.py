# %%
from typing import Generator
from skll.block import Block, Loop, RunSpec
from skll.block.baseblock import import_load
from importlib import import_module
import pandas as pd

class SklClass(Block):
    def __init__(self, cls:str, trainmethod:str=None, testmethod:str=None, scoremethod:str=None, keepcolnames=True, initargs:list=None, initkargs:dict=None, **kwargs):
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
            resx = self.testmethod(x)
            if runspec.mode == RunSpec.RunMode.TEST and hasattr(self, "scoremethod"):
                runspec.scores.append((self.name, self.scoremethod(x, y)))
            return resx, y, id
        else:
            if self.testaftertrain:
                self.trainmethod(x, y)
                res = self.testmethod(x)
            else:
                res = self.trainmethod(x, y)
            if self.keepcolnames and res.shape == x.shape:
                res = pd.DataFrame(res)
                res.columns = x.columns
            return res, y, id

# %%
if __name__ == "__main__":
    from skll.block.input import Input
    input = Input("file://train.csv")
    from skll.block.baseblock import Split
    from skll.block.splitter import XyidSplit
    input[0] = Split([["MSSubClass", "LotArea", "YrSold", "SalePrice"]], out_y=1)
    input[0][1] = XyidSplit("SalePrice")
    input[0][1][0] = SklClass("sklearn.linear_model.LinearRegression", trainmethod="fit+test", testmethod="predict", scoremethod="score")
    out = input(RunSpec(), None, None)
    print(out[0])
# %%

class SklPipeline(SklClass):
    """
    Sklearn pipeline class
    """
    def __init__(self, **kwargs):
        super().__init__(cls='sklearn.pipeline.Pipeline', **kwargs)
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
        r["_children"] = {0: self.child.dump() if self.child else None}
        return r

    def createobject(self):
        steps = []
        next = self.child
        while next:
            if isinstance(next, SklClass):
                if not next.obj:
                    next.createobject()
                steps.append((next.name, next.obj))
                next = next.next
            else:
                raise TypeError('Pipeline contains non compatible block')
        self.initkargs["steps"] = steps
        super().createobject()

# %%
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
    def __init__(self, method:str, xname=None, yname=None, args:list=None, kargs:dict=None, **kwargs):
        super().__init__(**kwargs)
        if "name" in kwargs: del kwargs["name"]
        if "disable_mask" in kwargs: del kwargs["disable_mask"]
        #if not method.startswith("sklearn"):
        #    raise KeyError(f'{method} is not from sklearn')
        func = method.split(".")
        package = ".".join(func[:-1])
        func = func[-1]
        package = import_module(package)
        func = getattr(package, func)
        if not callable(func):
            raise AttributeError(f'{method} is not a method')
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
        self.func = func
        self.xname = xname
        self.yname = yname
        self.funcargs = args if args else []
        self.funckargs = kargs if kargs else {}
        if isinstance(xname, int) and len(self.funcargs) <= xname:
            self.funcargs += [None] * (1 + xname - len(self.funcargs))
        if isinstance(yname, int) and len(self.funcargs) <= yname:
            self.funcargs += [None] * (1 + yname - len(self.funcargs))
    
    def dump(self) -> dict:
        r = super().dump()
        r["method"] = self.method
        r["xname"] = self.xname
        r["yname"] = self.yname
        r["args"] = self.funcargs
        r["kargs"] = self.funckargs
        
        if isinstance(self.xname, int):
            r["args"][self.xname] = None
        elif self.xname is not None:
            r["kargs"][self.xname] = None
        if isinstance(self.yname, int):
            r["args"][self.yname] = None
        elif self.yname is not None:
            r["kargs"][self.yname] = None
        
        return r
    
    def run(self, runspec:RunSpec, x, y=None, id=None):
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
        return self.func(*self.funcargs, **self.funckargs), y, id

class SklScoringMethod(Method):
    def run(self, runspec: RunSpec, x, y=None, id=None):
        if runspec.mode == RunSpec.RunMode.RUN:
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
            runspec.scores.append((self.name, self.func(*self.funcargs, **self.funckargs)))
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
    pipe = SklPipeline(trainmethod="fit+test", testmethod="predict")
    pipe[1] = SklClass("sklearn.preprocessing.StandardScaler")
    pipe[1][0] = SklClass("sklearn.svm.SVC")
    rs = RunSpec()
    out = pipe(rs, X, y)
    print(out[0])
    rs.mode = RunSpec.RunMode.TEST
    pipe(rs, X, y)
    print(rs.scores)

# %%
class SklSplitter(Loop):
    """
    SKlearn splitters for use in scoring
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
# %%
if __name__ == "__main__":
    from sklearn.datasets import make_classification
    X, y = make_classification(random_state=0)
    splitter = SklSplitter("sklearn.model_selection.KFold")
    splitter[1] = pipe = SklPipeline(trainmethod="fit+test", testmethod="predict")
    pipe[1] = SklClass("sklearn.preprocessing.StandardScaler")
    pipe[1][0] = SklClass("sklearn.svm.SVC")
    rs = RunSpec()
    rs.mode = RunSpec.RunMode.TEST
    splitter(rs, X, y)
    print(rs.scores)

# %%
class SklWrappingClass(SklClass):
    """
    Block for ensembles or hyperparameter searching
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
        _children = {}
        # dummy split arg for javascript counterpart
        _split = []
        for i,v in self.child.items():
            _children[i+1] = v.dump()
            _split.append(i+1)
        r["_children"] = _children
        r["splits"] = _split
        if isinstance(self.estname, int):
            r["initargs"][self.estname] = None
        else:
            r["initkargs"][self.estname] = None
        return r
        
    def __setitem__(self, key: int, block: Block):
        if not key:
            self.next = block
            return
        if not isinstance(block, SklClass):
            raise KeyError(f'child is not a sklearn estimator')
        self.obj = None
        if self.multiple:
            self.child[key - 1] = block
        else:
            self.child[0] = block
    
    def __getitem__(self, key: int) -> Block:
        if not key:
            return self.next
        if not self.multiple:
            return self.child[0]
        return self.child[key - 1]

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
            for child in self.child.values():
                if child.obj is None:
                    child.createobject()
                est.append((child.name, child.obj))
        if isinstance(self.estname, int):
            self.initargs[self.estname] = est
        else:
            self.initkargs[self.estname] = est
        super().createobject()

    # def run(self, runspec: RunSpec, x, y=None):
    #     if runspec.cleanrun:
    #         self.obj = None
    #     if not self.obj:
    #         self.createobject()
    #     if runspec.mode not in [RunSpec.RunMode.TEST, RunSpec.RunMode.RUN]:
    #         self.obj.fit(x, y)

    #     x = self.testmethod(x)
    #     if runspec.mode == RunSpec.RunMode.TEST:
    #         runspec.scores.append(self.obj.score(x, y))

    #     return x, y

# %%
if __name__ == "__main__":
    from sklearn import datasets
    iris = datasets.load_iris()
    block = SklWrappingClass(cls="sklearn.model_selection.GridSearchCV", initkargs={"param_grid": {'kernel':('linear', 'rbf'), 'C':[1, 10]}})
    block[1] = SklClass("sklearn.svm.SVC")
    out = block(RunSpec(), iris.data, iris.target)
# %%
