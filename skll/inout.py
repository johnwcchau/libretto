# %%
from contextlib import redirect_stdout, redirect_stderr
import re
import logging

class Output:
    def __init__(self):
        self.ws = None
    def msg(self, status:int=-1000, msg:str=None, param:dict=None)->None:
        logging.info(f'[{status}, {msg}]')        
        if self.ws:
            self.ws.send_message(status, msg, param)
    def working(self, msg:str=None)->None:
        self.msg(1, msg)
    def progress(self, msg:str=None, progress=0)->None:
        if isinstance(progress, float) or isinstance(progress, int):
            self.msg(2, msg, {"progress": progress})
        elif isinstance(progress, dict):
            self.msg(2, msg, progress)
        else:
            self.msg(2, msg)
    def cont(self, msg:str=None, param:dict=None)->None:
        self.msg(4, msg, param)
    def finished(self, msg:str=None, param:dict=None)->None:
        self.msg(0, msg, param)
    def busy(self):
        self.msg(-997, "Model is busy, try again later")
    def error(self, msg:str=None)->None:
        self.msg(-998, msg)
    def invalid(self, msg:str='Invalid request')->None:
        self.msg(-999, msg)
    def stream(self, stream:int, msg:str)->None:
        self.msg(stream, msg)

class StreamOut(object):
    def __init__(self, id:int, out:Output, old):
        self.id = id
        self.out = out
        self.old = old
    def tqnum(s:str)->float:
        if not s: return 1
        num = 1
        try:
            if s[-1] in ["K", "M", "G", "T"]:
                num = float(s[:-1])
            else:
                num = float(s)
            if s[-1]=="K":
                num *= 1024
            elif s[-1]=="M":
                num *= 1024 * 1024
            elif s[-1]=="G":
                num *= 1024 * 1024 * 1024
            elif s[-1]=="T":
                num *= 1024*1024*1024*1024
        except Exception:
            return 1
        pass
    def write(self, data):
        self.old.write(data)
        #
        # try to capture tqdm output
        #
        tq = re.search(r'(([^:]+): ?)?([0-9]+)%\|[^\|]+\| ?([0-9GKMT]+)\/([0-9GKMT]+) ?\[([0-9:]+)<([0-9:]+), ?([^\]]+)', data.replace('\r', ''))
        if tq:
            desc = tq.group(2)
            if desc is None: desc = "In progress"
            progress = float(tq.group(4)) / float(tq.group(5))
            ellipsed = tq.group(6)
            remain = tq.group(7)
            speed = tq.group(8)
            msg = "\\r%s: %.1f%%" % (desc, progress * 100)
            if '\n' in data: msg += "\\n"
            self.out.progress(msg, {
                'progress': progress,
                'ellipsed': ellipsed,
                'remain': remain,
                'speed': speed
            })
        else:
            tq = re.search(r'(([^:]+): ?)?([0-9]+)%\|[^\|]+\| ?([0-9GKMT]+)\/([0-9GKMT]+) ?\[([0-9:]+)', data.replace('\r', ''))
            if tq:
                desc = tq.group(2)
                if desc is None: desc = "In progress"
                progress = float(tq.group(4)) / float(tq.group(5))
                ellipsed = tq.group(6)
                msg = "\\r%s: %.1f%%" % (desc, progress * 100)
                self.out.progress(msg, {
                    'progress': progress,
                    'ellipsed': ellipsed,
                })
            else:
                self.out.stream(self.id, repr(data))
    def flush(self):
        self.old.flush()

class StdRedirect:
    #out_redirected = False
    def __init__(self, log:Output):
        # self.log = log
        import sys
        self.stdout = redirect_stdout(StreamOut(2, log, sys.stdout))
        self.stderr = redirect_stderr(StreamOut(3, log, sys.stderr))
    def __enter__(self):
        StdRedirect.out_redirected += 1
        self.stderr.__enter__()
        self.stdout.__enter__()
    def __exit__(self, exctype, excinst, exctb):
        self.stderr.__exit__(exctype, excinst, exctb)
        self.stdout.__exit__(exctype, excinst, exctb)
        StdRedirect.out_redirected -= 1
        if StdRedirect.out_redirected < 0: StdRedirect.out_redirected = 0
        
StdRedirect.out_redirected = 0

# %%
if __name__ == "__main__":
    out = Output()
    import sys
    out.stdout = sys.stdout
    def iceptLog(status=-1000, msg=None, param=None):
        out.stdout.write(f'[{status}] {msg}\n')
        if param:
            out.stdout.write(f'{repr(param)}\n')
    out.msg = iceptLog
    out.msg()
    out.invalid()
    out.error()
    out.error("Error test")
    out.working()
    out.working("Working test")
    out.progress()
    out.progress("progress test")
    out.progress("progress test", {"progress": 0.5})
    out.stream(2, "stream test")
    with StdRedirect(out):
        print("stdout redirect test")
        sys.stderr.write("stderr redirect test")
    pass
# %%
