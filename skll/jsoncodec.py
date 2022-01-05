from json.encoder import JSONEncoder

import numpy as np
from skll.block import RunSpec
import numpy as np

class Encoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, RunSpec.RunMode):
            return o.value
        if isinstance(o, np.integer):
            return int(o)
        if isinstance(o, np.floating):
            return float(o)
        if isinstance(o, np.ndarray):
            return o.tolist()
        return super().default(o)
