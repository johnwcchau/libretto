import logging
from configparser import ConfigParser
from typing import Callable


__plugins = {}

def plugin_disabled(config, path):
    name = '.'.join(path.replace('/', '.').replace('\\', '.').split('.')[:-2])
    return config.getboolean(name, "disabled", fallback=False)

def plugin_mjs(config):
    from glob import glob
    with open("skll/plugin/plugins.mjs", "w") as file:
        for path in glob("skll/plugin/**/__init__.mjs"):
            if plugin_disabled(config, path): continue
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

def init(config):
    from importlib import import_module
    from os import path
    import logging
    from glob import glob

    global __plugins

    for path in glob("skll/plugin/**/__init__.py"):
        name = '.'.join(path.replace('/', '.').replace('\\', '.').split('.')[:-2])
        logging.info(f'Discovered plugin {name}')
        if plugin_disabled(config, path): 
            logging.info(f'{name}: Disabled in config and not loaded')
            continue
        try:
            lib = import_module(f'{name}.__init__')
            if hasattr(lib, "__init_plugin"):
                getattr(lib, "__init_plugin")(config)
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