const ReconnectingWebSocket = require("reconnecting-websocket");
const WebSocket = require("ws");
const R = require("ramda");

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

      const giftRegex = /^[a-zA-Z0-9_]+ gifted [a-zA-Z0-9_]+ a Tier (I|II|II|IV) subscription!/;
      const toSend = R.cond([
        [
          R.equals("BAN"),
          () => ({
            channel: "destinygg",
            username: "Ban",
            text: `${msg.data} banned by ${msg.nick}`,
            ts: msg.timestamp,
          }),
        ],
        [
          R.equals("UNBAN"),
          () => ({
            channel: "destinygg",
            username: "Ban",
            text: `${msg.data} unbanned by ${msg.nick}`,
            ts: msg.timestamp,
          }),
        ],
        [
          R.equals("MUTE"),
          () => ({
            channel: "destinygg",
            username: "Ban",
            text: `${msg.data} muted by ${msg.nick}`,
            ts: msg.timestamp,
          }),
        ],
        [
          R.equals("UNMUTE"),
          () => ({
            channel: "destinygg",
            username: "Ban",
            text: `${msg.data} unmuted by ${msg.nick}`,
            ts: msg.timestamp,
          }),
        ],
        [
          R.equals("MSG"),
          () => ({
            channel: "destinygg",
            username: msg.nick,
            text: msg.data,
            ts: msg.timestamp,
          }),
        ],
        [
          R.equals("BROADCAST"),
          () => {
            console.log("Broadcast:", msg.nick, msg.data);
            const subMessages = [
              "subscriber!",
              "subscribed on Twitch!",
              "has resubscribed",
              "a Twitch subscription! active for",
            ];
            for (const subMsg of subMessages) {
              if (msg.data.toLowerCase().includes(subMsg.toLowerCase())) {
                return {
                  channel: "destinygg",
                  username: "subscriber",
                  text: msg.data,
                  ts: msg.timestamp,
                };
              }
            }
            if (giftRegex.test(msg.data)) {
              return {
                channel: "destinygg",
                username: "subscriber",
                text: msg.data,
                ts: msg.timestamp,
              };
            }
            if (msg.data.includes("said...")) {
              return {
                channel: "destinygg",
                username: "subscribermessage",
                text: msg.data,
                ts: msg.timestamp,
              };
            }
            return {
              channel: "destinygg",
              username: "broadcast",
              text: msg.data,
              ts: msg.timestamp,
            };
          },
        ],
        [
          R.T,
          () => {
            // console.log("Uncaught type", type, msg);
            return null;
          },
        ],
      ])(type);
      if (toSend) {
        this.sendToWriters(toSend);
      }
    });
  }
}
module.exports = DggScraper;
