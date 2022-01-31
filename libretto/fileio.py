from __future__ import annotations
import base64
from libretto.inout import Output
import os
import base64
import traceback

class FileIO:
    __instance:FileIO = None

    STORAGE_ROOT = os.path.abspath(".")

    def __new__(cls, ws=None):
        if FileIO.__instance is None:
            FileIO.__instance = object.__new__(FileIO)
            FileIO.__instance.out = Output()
        return FileIO.__instance
    
    def __init__(self, ws=None) -> None:
        if ws is not None: 
            self.out.ws = ws

    def _getvalidpath(self, path:str=None, checkdir:bool=False, checkfile:bool=False, checkexist:bool=False)->bool:
        if path is None:
            return (None, False)
        if not path.startswith("/") or not path.startswith('\\'): path = f'/{path}'
        if path.endswith('/') or path.endswith('\\'): path = path[:-1]
        storage_path = os.path.abspath(rf'{FileIO.STORAGE_ROOT}/storage')
        path = os.path.abspath(rf'{FileIO.STORAGE_ROOT}/storage{path}')
        if not path.startswith(storage_path):
            return (None, False)
        if checkdir and not os.path.isdir(path):
            return (path, False)
        if checkfile and not os.path.isfile(path):
            return (path, False)
        if checkexist and not os.path.exists(path):
            return (path, False)
        return (path, True)

    def ls(self, path:str="/", **kwargs):
        from glob import glob
        if not path.startswith("/") or not path.startswith('\\'): path = f'/{path}'
        if path.endswith('/') or path.endswith('\\'): path = path[:-1]
        storage_path = os.path.abspath(r"./storage")
        path, valid = self._getvalidpath(path, checkdir=True)
        if not valid:
            self.out.invalid()
            return
        parent = os.path.abspath(rf'{path}/../')
        if not parent.startswith(storage_path):
            parent = None
        results = []
        if parent:
            results.append(("..", True))
        objs = glob(f'{path}/*')
        for obj in objs:
            results.append((obj.replace(path, "").replace("\\", "/")[1:], os.path.isdir(obj)))
        self.out.finished(param={
            "cd": path.replace(storage_path, "").replace("\\", "/"),
            "objs": results,
        })

    def exist(self, path:str=None, **kwargs)->None:
        self.out.finished(param={
            "exist": self._getvalidpath(path, checkexist=True)[1]
        })

    def mkdir(self, path:str=None, **kwargs)->None:
        fullpath, valid = self._getvalidpath(path, checkexist=True)
        if valid or fullpath is None:
            self.out.invalid()
            return

        os.makedirs(fullpath)
        self.out.finished(f'Directory created')

    def put(self, name:str="temp", data:str=None, flag:str=None, size:int=0, **kwargs)->None:
        if not flag or (not data and flag != "end"):
            self.out.invalid()
            return
        if data:
            data = data.split(';base64')[1].encode('utf-8')
            data = base64.b64decode(data)
        fname = f'./storage/{name}'
        if flag=="begin":
            with open(fname, 'wb') as file:
                file.write(data)
        elif flag=="continue":
            with open(fname, 'ab') as file:
                file.write(data)
        elif flag == "end":
            if not size:
                self.out.invalid()
            elif os.path.getsize(fname) != size:
                self.out.error("Upload size mismatch")
            else:
                self.out.finished("Upload success")
            return
        if size:
            progress = os.path.getsize(fname) / size
        else:
            progress = 0
        self.out.cont("Uploading", {"progress": progress})

    def rm(self, path:str=None, **kwargs)->None:
        fullpath, valid = self._getvalidpath(path, checkexist=True)
        if not valid:
            self.out.invalid()
            return
        try:
            if os.path.isdir(fullpath):
                import shutil
                shutil.rmtree(fullpath)
            else:
                os.remove(fullpath)
            self.out.finished(f'Deleted')
        except Exception:
            traceback.print_exc()
            self.out.error(f'Delete {path} failed')

    def ren(self, src:str=None, dest:str=None, overwrite:bool=False, **kwargs)->None:
        fullpath, valid = self._getvalidpath(src, checkexist=True)
        newpath, already = self._getvalidpath(dest, checkexist=True)
        if not fullpath or not newpath:
            self.out.invalid(f'Invalid name')
            return
        if not valid:
            self.out.invalid(f'No such file {src}')
            return
        if already and not overwrite:
            self.out.invalid(f'{dest} already exists')
            return
        os.rename(fullpath, newpath)
        self.out.finished(f'Renamed {src} to {dest}')

