const WebSocket = require("ws");

class DggScraper {
  constructor({ dggScraper }, writers) {
    this.config = dggScraper;
    this.writers = writers;
    this.ws = new WebSocket(this.config.url);
    this.initializeListeners();
  }

  sendToWriters(data, shouldConsole) {
    this.writers.forEach(writer => {
      writer.write(data);
    });
    if (shouldConsole) {
      console.log(data);
    }
  }

  initializeListeners() {
    this.ws.on("message", data => {
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
