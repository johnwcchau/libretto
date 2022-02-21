import sys
import subprocess
import os

class Venv:
    """
    Virtual environment broker
    Reduce user hassle to do anything by themselves
    """
    instance = None
    def __new__(self, approot=None, config=None):
        if Venv.instance is None:
            if approot is None or config is None:
                raise AttributeError("First call to Venv requires _root and config!") 
            Venv.instance = object.__new__(Venv)
            Venv.instance._init(approot, config)
        return Venv.instance

    def _init(self, approot, config):
        use_venv = config.getboolean("libretto", "venv", fallback=True)
        if not use_venv: return
        venv_path = config.get("libretto", "venv_path", fallback="{root}/python")
        venv_path = venv_path.replace(r"{approot}", os.path.dirname(os.path.realpath(approot)))
        venv_path = os.path.realpath(venv_path)
        if sys.prefix==venv_path: return
        print(venv_path)
        print(sys.prefix)
        self.__enter_venv(venv_path, approot)

    def __enter_venv(self, venv_path, approot):
        print(f"Checking virtualenv existance...")
        self.pip_install("virtualenv")
        vpython_path = os.path.join(venv_path, "Scripts", "python.exe")
        if not os.path.exists(vpython_path):
            print(f"Installing virtual environment to {venv_path}")
            subprocess.call([sys.executable, "-m", "virtualenv", venv_path])
            subprocess.call([vpython_path, "-m", "pip", "install", "-r", "requirements.txt"])
        print(f"Restarting under virtual environment: {venv_path}")
        subprocess.call([vpython_path, approot] + sys.argv[1:])
        exit(0)

    def pip_install(self, package):
        try:
            __import__(package)
        except:
            subprocess.call([sys.executable, "-m", "pip", "install", package, "--upgrade"])
