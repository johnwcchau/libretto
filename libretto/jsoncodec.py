from json.encoder import JSONEncoder

import numpy as np
import pandas as pd
from .baseblock import RunSpec
import logging

class Encoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, RunSpec.RunMode):
            return o.value
        elif isinstance(o, np.integer):
            return int(o)
        elif isinstance(o, np.floating):
            return float(o)
        elif isinstance(o, np.ndarray):
            return o.tolist()
        elif pd.isna(o):
            return None
        else:
            logging.warn(f'JSONEncoder encountered {type(o)}')
            return str(o)

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
