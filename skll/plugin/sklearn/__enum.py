"""
The sk-learn module enumerator to automate block generations
Note that manual adjustments are still needed before pushing the generated file to runtime
"""
#%%
from enum import Enum
from inspect import getdoc, isclass
from importlib import import_module
import re
import traceback
import pkgutil

class Enumerator:

    @classmethod
    def in_whitelist(cls, func:str):
        """
        Whitelisting which function can be called by checking package name
        """
        return func.split(".")[0] in Enumerator.package_white_list

    @classmethod
    def extractdoc(cls, func:str)->dict:
        name = func
        func = func.split(".")
        module = ".".join(func[:-1])
        objname = func[-1]
        package = import_module(module)
        func = getattr(package, objname)
        if not callable(func): return objname, None, None

        try:
            part:str
            line:str
            properties:dict = {}
            
            lastparam = None
            parts = re.split("------+", getdoc(func))
            lines = None
            for i, part in enumerate(parts):
                if part.strip("\n").split("\n")[-1] == "Parameters":
                    lines = parts[i+1].strip("\n").split("\n")[:-1]
                    break
            if not lines:
                return objname, None, None
            
            desc = " ".join(parts[0].strip("\n").split("\n")[:-1]).strip(" ")
            
            def addLastParam(properties):
                name:str = lastparam["name"]
                del lastparam["name"]
                properties[name] = lastparam
                
            for line in lines:
                group = re.search(r'^([A-Za-z_][A-Za-z0-9_]*) : (.*)', line.strip())
                if group:
                    if lastparam: addLastParam(properties)
                    lastparam = {
                        "name": group[1],
                        "type": group[2],
                        "desc": ""
                    }
                else:
                    if lastparam and line.strip():
                        lastparam["desc"] += line.strip()
            if lastparam: addLastParam(properties)
            return objname, desc, properties
        except Exception:
            traceback.print_exc()
            print(name)
            print(getdoc(func))
        return objname, None, None

    @classmethod
    def formatSklParam(cls, param:dict)->dict:
        type:str = param["type"]
        defstr = re.search(r'default=([^,]+)', type)
        if defstr: param["default"] = defstr[1]
        else:
            defstr = re.search(r'default: ``([^,]+)``', type)
            if defstr: param["default"] = defstr[1].replace(r'"', "")
        if type.startswith("int") \
            or type.startswith("float"):
            param["type"] = "number"
        elif type.startswith("bool"):
            param["type"] = "boolean"
        elif type.startswith("str"):
            param["type"] = "string"
        elif type.startswith("{"):
            type = type[1:].split("}")[0].replace("'", "")
            param["type"] = f'option({type})'
        param["desc"] = param["desc"].replace("\n", " ").replace("  ", " ")
        param["dictKeyOf"] = "initkargs"
        return param

def sklclass_to_dict(func:str)->dict:
    properties:dict
    name, desc, properties = Enumerator.extractdoc(func)
    if properties is None: return None
    result = {
        'cls': "Block",
        'typename': name,
        'desc': desc,
        'childof': "skll.plugin.sklearn.block.SklClass",
        'pytype': "skll.plugin.sklearn.block.SklClass",
        'group': '.'.join(func.split('.')[:-1]),
        "properties": {
            "initkargs": {"hidden": True}, 
            "initargs": {"hidden": True},
            "cls": {"hidden": True},
            "trainmethod": {"hidden": True},
            "testmethod": {"hidden": True},
            "scoremethod": {"hidden": True},
        },
        "defaults": {
            "cls": func,
        }
    }
    keys = properties.keys()
    for name in keys:
        if name in ["estimator", "base_estimator", "estimators"]:
            result["cls"] = "Parent"
            result["childof"] = "skll.plugin.sklearn.block.SklWrappingClass"
            result["pytype"] = "skll.plugin.sklearn.block.SklWrappingClass"
            result["defaults"] = {
                "cls": func,
                "estname": name,
                "multiple": (name == "estimators")
            }
            result["properties"]["estname"] = {"hidden": True}
            result["properties"]["multiple"] = {"hidden": True}
        else:
            if name == "n_splits":
                result["cls"] = "Parent"
                result["childof"] = "skll.plugin.sklearn.block.SklSplitter"
                result["pytype"] = "skll.plugin.sklearn.block.SklSplitter"
            result["properties"][name] = Enumerator.formatSklParam(properties[name])

    return result

def sklmethod_to_dict(func:str)->dict:
    properties:dict
    name, desc, properties = Enumerator.extractdoc(func)
    if properties is None: return None
    result = {
        'cls': "Block",
        'typename': name,
        'desc': desc,
        'childof': "skll.plugin.sklearn.block.SklMethod",
        'pytype': "skll.plugin.sklearn.block.SklMethod",
        'group': '.'.join(func.split('.')[:-1]),
        "properties": {
            "args": {"hidden": True}, 
            "kargs": {"hidden": True},
            "method": {"hidden": True},
            "xname": {"hidden": True},
            "yname": {"hidden": True},
        },
        "defaults": {
            "method": func,
        }
    }
    keys = properties.keys()
    for name in keys:
        if name in ["y_true", "y_score", "y_pred", "labels", "labels_true", "labels_pred"]:
            result['childof'] = "skll.plugin.sklearn.block.SklScoringMethod"
            result['pytype'] = "skll.plugin.sklearn.block.SklScoringMethod"
            if name in ["y_pred", "y_score", "labels_pred"]:
                result['defaults']['xname'] = name
            else:
                result["defaults"]["yname"] = name
            continue
        elif name == "X":
            result['defaults']['xname'] = "X"
            continue
        elif name == "Y":
            result["defaults"]["yname"] = "Y"
        param = Enumerator.formatSklParam(properties[name])
        param["dictKeyOf"] = "kargs"
        result["properties"][name] = param

    return result

def all_sklclass_names(prefix:str, blacklist:list, storage:list, layer:int=0)->None:
    if layer > 3: return
    if any([re.search(x, prefix) for x in blacklist]): return

    print(f'enumerating {prefix}')
    try:
        package = import_module(prefix)
        storage += [f'{prefix}.{x}' \
            for x in dir(package) \
            if isclass(getattr(package, x)) \
            and not any([re.search(y, x) for y in blacklist])]
        if hasattr(package, "__path__"):
            [all_sklclass_names(f'{prefix}.{x.name}', blacklist, storage, layer+1) for x in pkgutil.iter_modules(package.__path__)]
    except Exception:
        traceback.print_exc()
        pass

def all_sklmethod_names(prefix:str, blacklist:list, storage:list, layer:int=0)->None:
    if layer > 3: return
    if any([re.search(x, prefix) for x in blacklist]): return

    print(f'enumerating {prefix}')
    try:
        package = import_module(prefix)
        storage += [f'{prefix}.{x}' \
            for x in dir(package) \
            if callable(getattr(package, x)) and not isclass(getattr(package, x)) \
            and not any([re.search(y, x) for y in blacklist])]
        if hasattr(package, "__path__"):
            [all_sklclass_names(f'{prefix}.{x.name}', blacklist, storage, layer+1) for x in pkgutil.iter_modules(package.__path__)]
    except Exception:
        traceback.print_exc()
        pass

# %%
def generate_sklearn():
    black_list = [
        #attr_black_list
        r"^_",
        r"Error",
        r"Warning",
        #module_black_list
        r"\._",
        r'\.compat',
        r'\.core',
        r'\.lib',
        r"\.test",
        r"conftest",
        r"Mixin",
        r"sklearn\.base",
        r"sklearn\.calibration",
        r"sklearn\.experimental",
        r"sklearn\.exceptions",
        r"sklearn\.utils",
        r'sklearn\..*\.setup',
        r'metrics\.plot_',
        r'metrics\.consensus_score',
        r'metrics\..*Display',
        r'model_selection\.ParameterGrid',
        r'model_selection\.ParameterSampler',
        r'PredefinedSplit',
        # r'pandas\.errors',
        # r'pandas\..*\.?api',
        # r'pandas\.io',
        # r'numpy\..*\.?setup',
        # r'numpy\.conftest',
        # r'numpy\.ctypeslib',
        # r'numpy\.core',
        # r'numpy\.doc',
        # r'numpy\.distutils',
        # r'numpy\.version',
    ]

    funcs = {}

    all_names = []
    all_sklclass_names("sklearn", black_list, all_names, 0)
    for x in all_names:
        doc = sklclass_to_dict(x)
        if doc is not None and len(doc) > 0:
            funcs[x] = doc

    all_names = []
    all_sklmethod_names("sklearn.metrics", black_list, all_names, 0)
    for x in all_names:
        doc = sklmethod_to_dict(x)
        if doc is not None and len(doc) > 0:
            funcs[x] = doc

    import json
    with open("__sklearn.mjs", "w", encoding="utf8") as f:
        f.write("const sklearn=");
        json.dump(funcs, f, ensure_ascii=False, indent=4)
        f.write("\nexport default sklearn;");

# %%
def generate_gtda():
    black_list = [
        #attr_black_list
        r"^_",
        r"Error",
        r"Warning",
        #module_black_list
        r"Mixin",
        r"\._",
        r'\.base',
        r'\.core',
        r"\.tests",
        r"\.pipeline",
        r"\.plotting",
        r"\.utils",
        r"\.Parallel",
        r"\.features",
        r"\.representations",
        r"\.preprocessing",
        r"\.distance",
        r"\.externals",
        r"\.filtrations",
        r"\.cluster",
        r"\.cubical",
        r"\.simplicial",
        r"\.geodesic_distance",
        r"\.kneighbors",
        r"\.transition",
        r"\.collection_transformer",
    ]

    funcs = {}

    all_names = []
    all_sklclass_names("gtda", black_list, all_names, 0)
    for x in all_names:
        doc = sklclass_to_dict(x)
        if doc is not None and len(doc) > 0:
            funcs[x] = doc

    import json
    with open("__gtda.mjs", "w", encoding="utf8") as f:
        f.write("const gtda=");
        json.dump(funcs, f, ensure_ascii=False, indent=4)
        f.write("\nexport default gtda;");


# %%
