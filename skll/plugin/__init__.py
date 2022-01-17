import logging
from typing import Callable

__plugins = {}

def plugin_mjs():
    from glob import glob
    with open("skll/plugin/plugins.mjs", "w") as file:
        for path in glob("skll/plugin/**/__init__.mjs"):
            path = path[4:].replace("\\", "/")
            name = path.split('/')[-2]
            file.write(f'import {{}} from "{path}";\n');
        file.write("""
export default function plugin_css() { 
""")
        for name in glob("skll/plugin/**/__init__.css"):
            name = name[4:].replace("\\", "/")
            file.write(f"""
    $("head").append('<link rel="stylesheet" href="{name}" type="text/css" />');
""")
        file.write("""
}""")

def init():
    from importlib import import_module
    from os import path
    import logging
    from glob import glob

    global __plugins

    for name in glob("skll/plugin/**/__init__.py"):
        name = '.'.join(name.replace('/', '.').replace('\\', '.').split('.')[:-2])
        logging.info(f'Discovered plugin {name}')
        try:
            lib = import_module(f'{name}.__init__')
            if hasattr(lib, "__init_plugin"):
                getattr(lib, "__init_plugin")()
                __plugins[name] = lib
        except Exception as e:
            logging.error(repr(e))

def dispatch(lamda:Callable[[str, object], None]):
    global __plugins
    for name, plugin in __plugins.items():
        lamda(name, plugin)

def find_plugin(plugin:str):
    global __plugins
    return __plugins[plugin] if plugin in __plugins else None