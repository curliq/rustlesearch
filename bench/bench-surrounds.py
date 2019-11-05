import requests
import random
import json
from datetime import date, timedelta
from concurrent.futures import ProcessPoolExecutor as PoolExecutor
import multiprocessing

with open("words.txt") as f:
    lineList = f.readlines()
with open("channels.json", "r") as f:
    channels = json.load(f)
small_channels = ["Destiny", "Destinygg", "Lirk", "Giantwaffle", "Summit1g", "Shroud"]


def get_random_date(start, end):
    """
    This function will return a random datetime between two datetime
    objects.
    """
    delta = end - start
    if delta == 0:
        return start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return start + timedelta(seconds=random_second)


for_surrounds = []


def go_init(_):
    random_end_date = get_random_date(date(2015, 4, 1), date.today())
    random_start_date = get_random_date(date(2015, 3, 30), random_end_date)
    params = {
        "channel": random.choice(small_channels),
        "end_date": random_end_date,
        "start_date": random_start_date,
        "text": random.choice(lineList),
    }
    r = requests.get("https://api.rustlesearch.dev/search", params=params)
    data = r.json()["data"]

    print("Init", r.elapsed.total_seconds())
    if 0 < len(data):
        first = data[0]

        obj = {"channel": first["channel"], "search_after": first["searchAfter"]}
        for_surrounds.append(obj)


def go_surrounds(_):
    d = random.choice(for_surrounds)
    params = {"channel": d["channel"], "search_after": d["search_after"], "size": 10}
    r = requests.get("https://api.rustlesearch.dev/search", params=params)
    print("surrounds", r.elapsed.total_seconds())


if __name__ == "__main__":

    pool = multiprocessing.Pool(10)

    pool.map(go_init, range(10))
    print("done")
    pool.map(go_surrounds, range(20))
