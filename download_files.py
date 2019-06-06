import os
import requests
from datetime import datetime, timedelta
import json
import multiprocessing
import sys

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


def get_url_list(channels, days_back, farthest_years):
    urls = []
    for day in range(1, days_back):
        d = datetime.today() - timedelta(days=day)
        date_format = d.strftime("%B %Y/%Y-%m-%d")
        day_stamp = d.strftime("%Y-%m-%d")
        year_stamp = d.strftime("%Y")
        for channel in channels:
            if int(year_stamp) >= int(farthest_years[channel]):
                path = f"{base_path}/rustle/{channel}::{day_stamp}.txt"
                url = f"{base_url}/{channel} chatlog/{date_format}.txt"
                urls.append((path, url))
                print(url)
    return urls


get_channels()

channels = [
    "Destinygg",
    "Trainwreckstv",
    "Forsen",
    "Hasanabi",
    "Pokimane",
    "Lilypichu",
    "Vaushgg",
    "Reckful",
    "Rajjpatel",
    "Whitenervosa",
    "Mrmouton",
    "Greekgodx",
]
farthest_years = {}
for channel in channels:
    r = requests.get(f"{base_url}/api/v1/{channel}/months.json")
    farthest_years[channel] = r.json()[-1][-4:]
print(farthest_years)
url_list = get_url_list(channels, int(sys.argv[1]), farthest_years)
pool = multiprocessing.Pool(processes=20)
pool.map(download_cached, url_list)
