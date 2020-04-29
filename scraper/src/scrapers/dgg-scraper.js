const ReconnectingWebSocket = require("reconnecting-websocket");
const WebSocket = require("ws");

class DggScraper {
  constructor({ dggScraper }, writers) {
    this.config = dggScraper;
    this.writers = writers;
    console.log(this.config.url);
    this.ws = new ReconnectingWebSocket(this.config.url, [], {
      WebSocket,
    });
    this.initializeListeners();
  }

  sendToWriters(data) {
    this.writers.forEach((writer) => {
      writer.write(data);
    });
  }

  initializeListeners() {
    this.ws.addEventListener("message", ({ data }) => {
      const split = data.indexOf(" ");
      const type = data.slice(0, split);
      const msg = JSON.parse(data.slice(split + 1));
      const transformations = {
        MSG: {
          channel: "destinygg",
          username: msg.nick,
          text: msg.data,
          ts: msg.timestamp,
        },
        BROADCAST: {
          channel: "destinygg",
          username: "subscriber",
          text: msg.data,
          ts: msg.timestamp,
        },
      };
      if (type in transformations) {
        this.sendToWriters(transformations[type]);
      }
    });
  }
}
module.exports = DggScraper;
