from sentence_transformers import SentenceTransformer
from umap import UMAP
import hdbscan
import pandas as pd
from libretto.baseblock import Block, ErrorAtRun, Parent, Loop, RunSpec
from libretto.inout import StdRedirect

#
# cache models
#
models = {}

class TransformerBlock(Block):
    def __init__(self, **kwargs: dict) -> None:
        super().__init__(**kwargs)
        self.kwargs = kwargs
        self.model_name = kwargs["model"] if "model" in kwargs else None
        self.model = None
        self.previews = None

    def dump(self) -> dict:
        return self.kwargs
    
    def run(self, runspec: RunSpec, x: pd.DataFrame, y=None, id=None) -> tuple:
        if len(x.columns) > 1:
            raise ValueError("input must be a single column of text")
        x = x[x.columns[0]]
        if x.hasnans:
            raise ValueError("input contains empty value, please drop or impute")
        if self.model is None:
            global models
            if self.model_name in models:
                self.model = models[self.model_name]
            else:
                runspec.out.working(f'Create embedding model {self.model_name}', {"atblock": self.name})
                with StdRedirect(runspec.out, atblock=self.name):
                    import torch
                    device = "cuda" if torch.cuda.is_available() else "cpu"
                    runspec.out.working(f'Embedding to be done on {device}', {"atblock": self.name})
                    self.model = SentenceTransformer(self.model_name, device=device)
                models[self.model_name] = self.model
        #
        # Encoding is slow, try best to cache
        if runspec.mode in [RunSpec.RunMode.PREVIEW, RunSpec.RunMode.COLUMNS]:
            if self.previews is None:
                self.previews = self.model.encode(x.values.tolist(), show_progress_bar=True)
            result = self.previews
        else:    
            result = self.model.encode(x.values.tolist(), show_progress_bar=True)
        return pd.DataFrame(result), y, id
    
class UMAPBlock(Block):
    def __init__(self, **kwargs: dict) -> None:
        super().__init__(**kwargs)
        self.kwargs = kwargs
        self.umap_param = kwargs["umap_param"] if "umap_param" in kwargs else None
        self.model = None
        self.previews = None
    
    def dump(self) -> dict:
        return self.kwargs

    def run(self, runspec: RunSpec, x: pd.DataFrame, y=None, id=None) -> tuple:
        if self.model is None:
            with StdRedirect(runspec.out, atblock=self.name):
                self.model = UMAP(**self.umap_param)
        
        if runspec.mode in [RunSpec.RunMode.PREVIEW, RunSpec.RunMode.COLUMNS]:
            if self.previews is None:
                self.model.fit(x.values.tolist(), y)
                self.previews = pd.DataFrame(self.model.transform(x.values.tolist()))
            result = self.previews
        else:
            if runspec.mode not in [RunSpec.RunMode.TEST, RunSpec.RunMode.RUN]:
                self.model.fit(x.values.tolist(), y)
            result = pd.DataFrame(self.model.transform(x.values.tolist()))
        return result, y, id

class HDBSCANBlock(Block):
    def __init__(self, **kwargs: dict) -> None:
        super().__init__(**kwargs)
        self.kwargs = kwargs
        self.initkargs = kwargs["initkargs"] if "initkargs" in kwargs else {}
        self.model = None
        self.previews = None
    
    def dump(self) -> dict:
        return self.kwargs
    
    def run(self, runspec: RunSpec, x: pd.DataFrame, y=None, id=None) -> tuple:
        if self.model is None:
            self.model = hdbscan.HDBSCAN(**self.initkargs)
        
        if runspec.mode in [RunSpec.RunMode.PREVIEW, RunSpec.RunMode.COLUMNS]:
            if self.previews is None:
                self.model.fit(x.values.tolist())
                self.previews = pd.DataFrame({0: self.model.labels_})
            result = self.previews
        elif runspec.mode == RunSpec.RunMode.TRAIN:
            self.model.fit(x.values.tolist())
            result = pd.DataFrame({0: self.model.labels_})
        else:
            result, _  = hdbscan.approximate_predict(self.model, x.values.tolist())
            result = pd.DataFrame(result)
        return result, y, id
