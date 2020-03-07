const { ChatClient } = require("dank-twitch-irc");

module.exports = (config, writers) => {
  const client = new ChatClient({
    maxChannelCountPerConnection: config.chatClient.maxChannels,
    connectionRateLimits: {
      parallelConnections: config.chatClient.maxConnections,
    },
  });

  client.on("ready", () => console.log("Successfully connected to chat"));
  client.on("close", error => {
    if (error != null) {
      console.error("Client closed due to error", error);
    }
  });

  client.on("PRIVMSG", msg => {
    writers.forEach(writer =>
      writer.write({
        channel: msg.channelName,
        username: msg.displayName,
        text: msg.messageText,
      }),
    );
  });
  // client.on("USERNOTICE", msg => {});
  return client;
};
