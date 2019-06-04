from flask import Flask, request, jsonify, render_template
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from elasticsearch import Elasticsearch
import os

es = Elasticsearch()
app = Flask(__name__, static_folder="./dist/static", template_folder="./dist")
CORS(app)
limiter = Limiter(app, key_func=get_remote_address, default_limits=["1 per 3 seconds"])
app.config["JSONIFY_PRETTYPRINT_REGULAR"] = True


def elasticsearch_query(username, channel, text, starting_timestamp, ending_timestamp):
    must = []
    if username:
        must.append({"match": {"username": username}})
    if text:
        must.append({"match": {"text": {"query": text, "operator": "and"}}})
    if channel:
        must.append({"match": {"channel": channel}})
    return {
        "size": 100,
        "from": 0,
        "query": {
            "bool": {
                "filter": [
                    {
                        "range": {
                            "timestamp": {
                                "gte": starting_timestamp or "now-30d/h",
                                "lt": ending_timestamp or "now/h",
                            }
                        }
                    }
                ],
                "must": must,
            }
        },
        "sort": [{"timestamp": {"order": "desc"}}],
    }


@app.route("/api/basic_search")
def basic_search():

    username = request.args.get("username")
    channel = request.args.get("channel")
    text = request.args.get("text")
    starting_timestamp = request.args.get("starting_timestamp")
    ending_timestamp = request.args.get("ending_timestamp")
    print(text, username, starting_timestamp, ending_timestamp)
    res = es.search(
        index="chat-search",
        body=elasticsearch_query(
            username, channel, text, starting_timestamp, ending_timestamp
        ),
    )
    return jsonify([r["_source"] for r in res["hits"]["hits"]])


@app.route("/advanced_search")
def advanced_search():
    return "wow"


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
@limiter.limit("2 per second")
def catch_all(path):

    return render_template("index.html")


if __name__ == "__main__":
    app.run()
