const config = require("./config");
const TwitchScraper = require("./scrapers/twitch-scraper");
const DggScraper = require("./scrapers/dgg-scraper");
const ElasticsearchWriter = require("./writers/elasticsearch-writer");
const FileWriter = require("./writers/file-writer");
const { syncChannelsCron } = require("./cron-jobs");

const main = async () => {
  const elasticsearchWriter = config.elastic.enable && new ElasticsearchWriter(config);
  if (elasticsearchWriter) {
    await elasticsearchWriter.setup();
  }
  const fileWriter = config.fileWriter.enable && new FileWriter(config);
  const writers = [elasticsearchWriter, fileWriter].filter(Boolean);
  if (fileWriter) {
    await fileWriter.setup();
  }
  if (config.dggScraper.enable) {
    // eslint-disable-next-line no-unused-vars
    const dggScraper = new DggScraper(config, writers);
  }
  if (config.twitchScraper.enable) {
    const twitchScraper = new TwitchScraper(config, writers);
    await twitchScraper.syncChannels();
    syncChannelsCron(twitchScraper).start();
    console.log(twitchScraper.chatClient.joinedChannels);
  }
};

main();
