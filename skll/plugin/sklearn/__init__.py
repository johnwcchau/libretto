import logging
from importlib import import_module
import os

VALID_PACKAGES = [
    "sklearn", 
    "hdbscan", 
    "lightgbm", 
    "xgboost", 
    "gtda"
]

def checkExist(package):
    try:
        import_module(package)
        if os.path.isfile(f'./skll/plugin/sklearn/{package}.mjs'):
            logging.info(f'Find python package {package} and it\'s definition.')
            return True
        else:
            logging.warn(f'Find python package {package} but not it\'s definition, it will not be available in SK-ll.')
            return False
    except Exception:
        logging.info(f'Python package {package} not exists or load with error')
        return False

def init_plugin():
    """
    global initialization of plugin
    """
    try:
        os.remove("./skll/plugin/sklearn/__init__.mjs")
    except FileNotFoundError:
        pass
    available = []
    for package in VALID_PACKAGES:
        if checkExist(package):
            available.append(package)
    if len(available) == 0:
        logging.warn('No package available, this plugin will not be loaded')
        return
    with open("./skll/plugin/sklearn/__init__.mjs", "w") as f:
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

def new_session(name:str):
    """
    called when a new session is created

    Parameters
    ----------
    name: str
        unique name of the session
    """
    pass

def destroy_session(name: str):
    """
    called should a session is destroyed

    Parameters
    ----------
    name: str
        unique name of the session
    """
    pass
