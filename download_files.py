import os
import requests
from datetime import datetime, timedelta
import json
import multiprocessing

base_url = "https://overrustlelogs.net"
base_path = "./data"

# /Sodapoppin chatlog/January 2019/userlogs/chocolatemilkbandit#17623-17778

os.makedirs("./data/rustle", exist_ok=True)


def download(entry):
    path, uri = entry
    r = requests.get(uri, stream=True)
    if r.status_code == 200:
        with open(path, "wb") as f:
            for chunk in r:
                f.write(chunk)
    return path


def download_cached(entry):
    path, url = entry
    if not os.path.exists(path):
        r = requests.get(url, stream=True)
        if r.status_code == 200:
            with open(path, "wb") as f:
                for chunk in r:
                    f.write(chunk)
    return path


def get_channels():
    download_url = f"{base_url}/api/v1/channels.json"
    path = f"{base_path}/channels.json"
    download((path, download_url))


def get_url_list(channels, days_back):
    urls = []
    for day in range(days_back):
        d = datetime.today() - timedelta(days=day)
        date_format = d.strftime("%B %Y/%Y-%m-%d")
        day_stamp = d.strftime("%Y-%m-%d")
        for channel in channels:
            path = f"{base_path}/rustle/{channel}::{day_stamp}.txt"
            url = f"{base_url}/{channel} chatlog/{date_format}.txt"
            urls.append((path, url))
    return urls


get_channels()

with open(f"{base_path}/channels.json") as f:
    channels = json.load(f)

url_list = get_url_list(channels, 20)
pool = multiprocessing.Pool(processes=20)
pool.map(download_cached, url_list)
