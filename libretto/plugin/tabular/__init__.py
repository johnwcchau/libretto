"""
This is the core plugin for tabluar data manipulation
"""

from libretto.venv import Venv
from .tabular import *

def __init_plugin(config):
    Venv().pip_install("pandas")