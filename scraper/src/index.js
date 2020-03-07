const express = require("express");
const fs = require("fs-extra");
const superagent = require("superagent");

const app = express();
const config = require("./config");
const clientBuilder = require("./client-builder");
const ElasticsearchWriter = require("./elasticsearch-writer");
const FileWriter = require("./file-writer");

let client = null;

const main = async () => {
  const elasticsearchWriter = new ElasticsearchWriter(config);
  const fileWriter = new FileWriter(config);
  await fs.ensureDir(config.fileWriter.directory);

  client = clientBuilder(config, [elasticsearchWriter, fileWriter]);
  const { body: channels } = await superagent.get(
    "https://overrustlelogs.net/api/v1/channels.json",
  );

  await client.joinAll(channels.map(str => str.toLowerCase()));
  console.log(client.joinedChannels);
};

const syncChannels = async () => {
  if (client === null) {
    return;
  }
  const { body: baseChannels } = await superagent.get(
    "https://overrustlelogs.net/api/v1/channels.json",
  );
  const channels = baseChannels.map(str => str.toLowerCase());
  await client.joinAll(channels);

  const copiedSet = new Set(client.joinedChannels);
  channels.forEach(channel => copiedSet.delete(channel));
  Array.from(copiedSet).forEach(channel => {
    client.part(channel);
  });
};

app.get("/update-channels", async (req, res) => {
  if (client === null) {
    return res.status(503).json({ success: false, error: "Chat client not ready yet" });
  }
  await syncChannels();
  return res.status(200).json({ success: true, error: null });
});

app.listen(config.port, () => console.log(`App listening on port ${config.port}!`));

main();
