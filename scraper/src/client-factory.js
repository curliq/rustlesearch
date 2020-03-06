const { ChatClient } = require("dank-twitch-irc");

module.exports = () => channels => {
  const client = new ChatClient();

  client.on("ready", () => console.log("Successfully connected to chat"));
  client.on("close", error => {
    if (error != null) {
      console.error("Client closed due to error", error);
    }
  });

  client.on("PRIVMSG", msg => {
    console.log(`[#${msg.channelName}] ${msg.displayName}: ${msg.messageText}`);
  });

  channels.forEach(channel => {
    client.join(channel);
  });
  return client;
};
