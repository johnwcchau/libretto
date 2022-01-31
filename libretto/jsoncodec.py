from json.encoder import JSONEncoder

import numpy as np
from .baseblock import RunSpec
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

def json_decode(o):
    if isinstance(o, str):
        if o.lower() == "true":
            return True
        elif o.lower() == "false":
            return False
        else:
            try:
                return int(o)
            except ValueError:
                try:
                    return float(o)
                except ValueError:
                    return o
    elif isinstance(o, dict):
        return {k: json_decode(v) for k, v in o.items()}
    elif isinstance(o, list):
        return [json_decode(v) for v in o]
    else:
        return o
