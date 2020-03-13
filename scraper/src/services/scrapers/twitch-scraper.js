const { ChatClient } = require("dank-twitch-irc");
const superagent = require("superagent");

class TwitchScraper {
  constructor({ twitchScraper }, writers) {
    this.config = twitchScraper;
    this.writers = writers;
    this.chatClient = new ChatClient({
      maxChannelCountPerConnection: this.config.maxChannels,
      connectionRateLimits: {
        parallelConnections: this.config.maxConnections,
      },
    });
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
    this.chatClient.on("ready", () => console.log("Successfully connected to chat"));
    this.chatClient.on("close", error => {
      if (error != null) {
        console.error("Client closed due to error", error);
      }
    });
    this.chatClient.on("PRIVMSG", msg => {
      this.sendToWriters({
        channel: msg.channelName,
        username: msg.displayName,
        text: msg.messageText,
        ts: msg.serverTimestamp,
      });
    });

    this.chatClient.on("USERNOTICE", msg => {
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
    const { body: baseChannels } = await superagent.get(
      "https://overrustlelogs.net/api/v1/channels.json",
    );
    const channels = baseChannels.map(str => str.toLowerCase());
    await this.chatClient.joinAll(channels);

    const copiedSet = new Set(this.chatClient.joinedChannels);
    channels.forEach(channel => copiedSet.delete(channel));
    Array.from(copiedSet).forEach(channel => {
      this.chatClient.part(channel);
    });
  }

  async setup() {
    await this.syncChannels();
  }

  static async build(...args) {
    const instance = new TwitchScraper(...args);
    await instance.setup();
    return instance;
  }
}
module.exports = TwitchScraper;
