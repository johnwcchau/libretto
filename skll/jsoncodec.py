from json.encoder import JSONEncoder
from skll.block import RunSpec

class Encoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, RunSpec.RunMode):
            return o.value
        return super().default(o)
