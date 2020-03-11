const express = require("express");

const app = express();
const config = require("./config");
const SuperClient = require("./super-client");
const ElasticsearchWriter = require("./writers/elasticsearch-writer");
const FileWriter = require("./writers/file-writer");
const { syncChannelsCron } = require("./cron-jobs");

let client = null;

const main = async () => {
  const elasticsearchWriter = config.elastic.enable && new ElasticsearchWriter(config);
  const fileWriter = config.fileWriter.enable && new FileWriter(config);
  await fileWriter.setup();

  client = new SuperClient(config, [elasticsearchWriter, fileWriter].filter(Boolean));
  await client.syncChannels();
  syncChannelsCron(client).start();

  console.log(client.chatClient.joinedChannels);
};

app.get("/update-channels", async (req, res) => {
  if (client === null) {
    return res.status(503).json({ success: false, error: "Chat client not ready yet" });
  }
  await client.syncChannels();
  return res.status(200).json({ success: true, error: null });
});

app.listen(config.port, () => console.log(`App listening on port ${config.port}!`));

main();
