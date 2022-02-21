"""
This is the plugin for text processing libaries
"""

from libretto.venv import Venv

def __init_plugin(config):
    venv = Venv()
    venv.pip_install("transformers")
    venv.pip_install("hdbscan")
    venv.pip_install("umap")