import zlib
import os
import glob
import gzip
import itertools
import time
from multiprocessing import Pool, Value


cont = itertools.count()
counter = Value("i", 0)


def process_fname(fname):
    with open(fname, "rb") as content:
        b = content.read()
    s = zlib.decompress(b)
    with gzip.open(fname[:-3] + ".gz", "wb") as f_out:
        f_out.write(s)

    # os.remove(fname)
    global counter
    with counter.get_lock():
        counter.value += 1
    print(f"{counter.value} Finished {fname}")


if __name__ == "__main__":
    fnames = glob.glob("./orl/*.zz")
    print(len(fnames))
    print("Starting recompression...")
    time.sleep(1)
    p = Pool(5)
    p.map(process_fname, fnames)
