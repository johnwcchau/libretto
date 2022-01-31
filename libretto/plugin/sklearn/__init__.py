"""
This is a plugin to provide functions Sk-learn (and related frameworks)

This is only the init and functions script, for receipe see block.py
"""
import logging
from importlib import import_module
import os
from .block import *

"""
Add name here to scan for additional frameworks
(provided that client-side definitions exist)
"""
VALID_PACKAGES = [
    "sklearn", 
    "hdbscan", 
    "lightgbm", 
    "xgboost", 
    "gtda"
]

def __checkExist(package:str):
    """
    Return True if python package exists and so does it's client-side definitions
    """
    try:
        import_module(package)
        if os.path.isfile(f'./libretto/plugin/sklearn/{package}.mjs'):
            logging.info(f'Find python package {package} and it\'s definition.')
            return True
        else:
            logging.warn(f'Find python package {package} but not it\'s definition, it will not be available in Libretto.')
            return False
    except Exception:
        logging.info(f'Python package {package} not exists or load with error')
        return False

def __init_plugin(config):
    """
    global initialization of plugin
    This automatically generates __init__.mjs to include receipe blocks of valid packages
    """
    if not config.getboolean("libretto.plugin.sklearn", "create_block_definition", fallback=True):
        return
    try:
        os.remove("./libretto/plugin/sklearn/__init__.mjs")
    except FileNotFoundError:
        pass
    available = []
    for package in VALID_PACKAGES:
        if __checkExist(package):
            available.append(package)
    if len(available) == 0:
        logging.warn('No package available, this plugin will not be loaded')
        return
    with open("./libretto/plugin/sklearn/__init__.mjs", "w") as f:
        f.write("""import { Parent, Block, BlockTypes } from "/static/modules/BaseBlock.mjs";
import baseObjects from "./baseObjects.mjs";
""")
        for package in available:
            f.write(f"""import {package} from "./{package}.mjs";
""")
        f.write("""export default null;

const bts = new BlockTypes();
function addToBts(types) {
    Object.keys(types).forEach(k=>{
        const v = types[k];
        switch (v.cls) {
            case "Block":
                v.cls = Block;
                break;
            case "Parent":
                v.cls = Parent;
                break;
            default:
                v.cls = Block;
        }
    });
    bts.add(types);
}
addToBts(baseObjects);
""")
        for package in available:
                    f.write(f"""addToBts({package});
""")

def __new_session(name:str):
    """
    invoked when a new session is created, note that runtime-mode contains only one session
    called "runtime"

    Parameters
    ----------
    name: str
        unique name of the session
    """
    pass

def __destroy_session(name: str):
    """
    invoked should a session is destroyed, note that "runtime" session will never be 
    destroyed
    (nor any other sessions as of current version)

    Parameters
    ----------
    name: str
        unique name of the session
    """
    pass
