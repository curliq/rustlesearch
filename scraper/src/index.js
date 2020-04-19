const config = require("./config");
const TwitchScraper = require("./scrapers/twitch-scraper");
const DggScraper = require("./scrapers/dgg-scraper");
const ElasticsearchWriter = require("./writers/elasticsearch-writer");
const FileWriter = require("./writers/file-writer");

const main = async () => {
  const writers = [];
  if (config.elastic.enable) {
    const elasticsearchWriter = new ElasticsearchWriter(config);
    await elasticsearchWriter.setup();
    writers.push(elasticsearchWriter);
  }
  if (config.file.enable) {
    const fileWriter = new FileWriter(config);
    await fileWriter.setup();
    writers.push(fileWriter);
  }
  if (config.dggScraper.enable) {
    // eslint-disable-next-line no-unused-vars
    const _dggScraper = new DggScraper(config, writers);
  }
  if (config.twitchScraper.enable) {
    const twitchScraper = new TwitchScraper(config, writers);
    await twitchScraper.setup();
    console.log(twitchScraper.chatClient.joinedChannels);
  }
};

main();
