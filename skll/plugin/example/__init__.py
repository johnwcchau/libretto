"""
Example plugin
"""
import logging
from skll.inout import Output

def __init_plugin():
    """
    global initialization of plugin
    """
    logging.info("Hello from example plugin!")

def __new_session(name:str):
    """
    invoked when a new session is created, note that runtime-mode contains only one session
    called "runtime"

    Parameters
    ----------
    name: str
        unique name of the session
    """
    logging.info(f'Hello new session "{name}" from example plugin')

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

"""
Belows are custom functions which can be invoked in client side
Invoke by (in javascript):
    getCurrentSession().WsClient.send("<plugin fqdn>::<method>", {param:value,...})
    and in this case fqdn of this plugin is "skll.plugin.example"
"""
def call_server_side(session:str, writer:Output, **kwargs:dict):
    writer.working("Example plugin is working...")
    str = [f'{k}: {v}' for (k,v) in kwargs.items()]
    str = "\n".join(str)
    writer.finished(f'You invoked example plugin with following parameters: \n {str}')