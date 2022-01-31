from concurrent.futures import ThreadPoolExecutor
import psutil

class TPE:
    """
    Singleton ThreadPoolExecutor container
    """
    __instance = None

    def __new__(cls):
        if TPE.__instance is None:
            TPE.__instance = object.__new__(TPE)
            TPE.__instance.__init()
        return TPE.__instance

    def __init(self):
        self.executor = ThreadPoolExecutor(max_workers=psutil.cpu_count())
