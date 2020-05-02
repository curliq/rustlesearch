import os
import glob

fnames = [os.path.basename(path) for path in glob.glob("./orl/*.txt*")]

print(fnames)

for fname in fnames:
    [channel, date_and_ext] = fname.split("::")
    print(channel, date_and_ext)
    os.makedirs(f"./orl/{channel}/", exist_ok=True)
    os.rename(f"./orl/{fname}", f"./orl/{channel}/{date_and_ext}")
