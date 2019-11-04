import requests
import random
import json
from datetime import date, timedelta
from concurrent.futures import ProcessPoolExecutor as PoolExecutor


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


def go(_):
    random_end_date = get_random_date(date(2015, 4, 1), date.today())
    random_start_date = get_random_date(date(2015, 3, 30), random_end_date)
    params = {
        "channel": random.choice(small_channels),
        "end_date": random_end_date,
        "start_date": random_start_date,
        "text": random.choice(lineList),
    }
    r = requests.get("https://api.rustlesearch.dev/search", params=params)
    # data = r.json()["data"]
    # first = data[0] if 0 < len(data) else None
    print(r.elapsed.total_seconds())


if __name__ == "__main__":
    with PoolExecutor(max_workers=50) as executor:
        executor.map(go, range(50))
