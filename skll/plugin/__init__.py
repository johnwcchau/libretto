__plugins = {}

def plugin_mjs():
    from glob import glob
    with open("skll/plugin/plugins.mjs", "w") as file:
        for name in glob("skll/plugin/**/__init__.mjs"):
            name = name[4:].replace("\\", "/")
            file.write(f'import _ from "{name}";\n');
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
            if lib.init_plugin is not None:
                lib.init_plugin()
                __plugins[name] = lib
        except Exception as e:
            logging.error(repr(e))
    plugin_mjs()

def dispatch(lamda):
    for name, plugin in __plugins.items():
        lamda(name, plugin)