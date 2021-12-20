#%%
from inspect import getdoc
from importlib import import_module
import re
import traceback
import pkgutil

class Enumerator:
    
    package_white_list = ["sklearn", "pandas", "numpy"]
    module_black_list = [
        r"\._",
        r'\.compat',
        r'\.core',
        r'\.lib',
        r"\.test",
        r"sklearn\.base",
        r"sklearn\.experimental",
        r"sklearn\.exceptions",
        r'sklearn\..*\.setup',
        r'pandas\.errors',
        r'pandas\..*\.?api',
        r'pandas\.io',
        r'numpy\..*\.?setup',
        r'numpy\.conftest',
        r'numpy\.ctypeslib',
        r'numpy\.core',
        r'numpy\.doc',
        r'numpy\.distutils',
        r'numpy\.version',
    ]
    attr_black_list = [
        r"^_",
        r"Error",
        r"Warning",
    ]
    function_list = []

    @classmethod
    def in_whitelist(cls, func:str):
        """
        Whitelisting which function can be called by checking package name
        """
        return func.split(".")[0] in Enumerator.package_white_list

    @classmethod
    def __format_from_doc(cls, name, func)->dict:
        try:
            part:str
            line:str
            params = []
            lastparam = None
            parts = re.split("------+", getdoc(func))
            lines = None
            desc = "\n".join(parts[0].strip("\n").split("\n")[:-1]).strip("\n")
            for i, part in enumerate(parts):
                if part.strip("\n").split("\n")[-1] == "Parameters":
                    lines = parts[i+1].strip("\n").split("\n")[:-1]
                    break
            if not lines:
                return params
            for line in lines:
                group = re.search(r'^([A-Za-z_][A-Za-z0-9_]*) : (.*)', line)
                if group:
                    if lastparam:
                        params.append(lastparam)
                    lastparam = {
                        "name": group[1],
                        "type": group[2],
                        "desc": ""
                    }
                else:
                    if lastparam and line.strip():
                        lastparam["desc"] += line.strip()
            if lastparam: params.append(lastparam)
            return {"desc": desc, "params": params}
        except Exception:
            traceback.print_exc()
            print(name)
            print(getdoc(func))

    @classmethod
    def dir(cls, obj)->dict:
        method = []
        field = []
        for x in dir(obj):
            if any([re.search(y, x) for y in Enumerator.attr_black_list]):
                continue
            if callable(getattr(obj, x)):
                method.append(x)
            else:
                field.append(x)
        return {"method": method, "field": field}

    @classmethod
    def searchfunc(cls, text:str)->list:
        return [x for x in Enumerator.function_list if text in x]
    
    @classmethod
    def funcdoc(cls, func:str)->dict:
        func = func.split(".")
        module = ".".join(func[:-1])
        name = func[-1]
        package = import_module(module)
        func = getattr(package, name)
        if not callable(func): return None
        return Enumerator.__format_from_doc(name, func)

def cache_function_names(name:str, layer:int=0)->None:
    if layer > 3: return
    if any([re.search(x, name) for x in Enumerator.module_black_list]): return

    print(f'enumerating {name}')
    try:
        package = import_module(name)
        Enumerator.function_list += [f'{name}.{x}' \
            for x in dir(package) \
            if callable(getattr(package, x)) \
            and not any([re.search(y, x) for y in Enumerator.attr_black_list])]
        if hasattr(package, "__path__"):
            [cache_function_names(f'{name}.{x.name}', layer+1) for x in pkgutil.iter_modules(package.__path__)]
    except Exception:
        #traceback.print_exc()
        pass

[cache_function_names(x, 0) for x in Enumerator.package_white_list]

# %%
