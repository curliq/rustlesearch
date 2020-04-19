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
    gzip_name = fname[:-3] + ".gz"
    gzip_tmp_name = fname[:-3] + ".gz.tmp"
    with gzip.open(gzip_tmp_name, "wb") as f_out:
        f_out.write(s)

    os.rename(gzip_tmp_name, gzip_name)
    os.rename(fname, "./orl_bak/" + os.path.basename(fname))
    global counter
    with counter.get_lock():
        counter.value += 1
    print(f"{counter.value} Finished {fname}")


if __name__ == "__main__":
    os.makedirs("orl_bak", exist_ok=True)
    tmps = glob.glob("./orl/*.tmp")
    print(f"Removing {len(tmps)} tmp files...")
    for fname in tmps:
        os.remove(fname)
    fnames = glob.glob("./orl/*.zz")
    print(f"Found {len(fnames)} files to recompress...")
    print("Starting recompression...")
    time.sleep(1)
    p = Pool(10)
    p.map(process_fname, fnames)
