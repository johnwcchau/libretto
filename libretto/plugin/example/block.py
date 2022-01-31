from libretto.baseblock import Block, RunSpec
import pandas as pd

class ExampleBlock(Block):
    """
    An example receipe block which sets all N/A value to a custom value
    See also block definition in __init__.mjs
    """
    def __init__(self, value_to_use:any=0, **kwargs: dict) -> None:
        super().__init__(**kwargs)
        self.value_to_use = value_to_use

    def run(self, runspec: RunSpec, x: pd.DataFrame, y, id) -> tuple:
        """
        Main data processing function, in this case calling pd.fillna
        
        In case this is a parent block, this function is responsible for passing 
        the data to it's children

        In case this is a loop block, unless you want to change the loop algorithm,
        you should override loop() instead for generating data for children to loop

        Parameters
        ----------
        runspec : RunSpec
            Hyper-parameters for this receipe, see RunSpec for more details
            Note: RunSpec.upto is handled by __call__() already  
        x : pd.DataFrame or None
            all data there should be considered as training data, 
            None value is possible
        y : pd.DataFrame or None
            this should be a single column containing only training target if any
            row-index should match x
        id : pd.DataFrame or None
            this should be a single column containing indexes for both x and y if any
            row-index should match both x and y
        
        Returns
        -------
        tuple of (x, y, id) to pass to next receipe-block
        """
        x = x.fillna(self.value_to_use)
        return x, y, id