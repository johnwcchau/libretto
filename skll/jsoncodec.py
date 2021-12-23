from json.encoder import JSONEncoder

import numpy as np
from skll.block import RunSpec
import numpy as np

class Encoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, RunSpec.RunMode):
            return o.value
        return super().default(o)
