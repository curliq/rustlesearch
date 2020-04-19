const { ChatClient } = require("dank-twitch-irc");
// const superagent = require("superagent");
const fs = require("fs-extra");

class TwitchScraper {
  constructor(cfg, writers) {
    this.cfg = cfg;
    this.writers = writers;
    this.chatClient = new ChatClient({
      maxChannelCountPerConnection: this.cfg.twitchScraper.maxChannels,
      connectionRateLimits: {
        parallelConnections: this.cfg.twitchScraper.maxConnections,
      },
    });
    this.initializeListeners();
  }

  sendToWriters(data, shouldConsole) {
    this.writers.forEach((writer) => {
      writer.write(data);
    });
    if (shouldConsole) {
      console.log(data);
    }
  }

  initializeListeners() {
    this.chatClient.on("ready", () => console.log("Successfully connected to chat"));
    this.chatClient.on("close", (error) => {
      if (error != null) {
        console.error("Client closed due to error", error);
      }
    });
    this.chatClient.on("PRIVMSG", (msg) => {
      this.sendToWriters({
        channel: msg.channelName,
        username: msg.displayName,
        text: msg.messageText,
        ts: msg.serverTimestamp,
      });
    });

    this.chatClient.on("USERNOTICE", (msg) => {
      let messageString = msg.systemMessage;
      if (msg.isSub() || msg.isResub() || msg.isSubgift() || msg.isAnonSubgift()) {
        if (msg.messageText != null) {
          messageString += ` [SubMessage]: ${msg.messageText}`;
        }
      }
      this.sendToWriters({
        channel: msg.channelName,
        username: "twitchnotify",
        text: messageString,
        ts: msg.serverTimestamp,
      });
    });
  }

  async syncChannels() {
    const baseChannels = await fs.readJson(this.cfg.paths.channels);
    const channels = baseChannels.map((str) => str.toLowerCase());
    await this.chatClient.joinAll(channels);

    const copiedSet = new Set(this.chatClient.joinedChannels);
    channels.forEach((channel) => copiedSet.delete(channel));
    Array.from(copiedSet).forEach((channel) => {
      this.chatClient.part(channel);
    });
  }

  async setup() {
    await this.syncChannels();
  }
}
module.exports = TwitchScraper;
