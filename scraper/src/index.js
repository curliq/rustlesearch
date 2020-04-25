const config = require("./config");
const TwitchScraper = require("./scrapers/twitch-scraper");
const DggScraper = require("./scrapers/dgg-scraper");
const ElasticsearchWriter = require("./writers/elasticsearch-writer");
const FileWriter = require("./writers/file-writer");
const runCronjobs = require("./cronjobs");

const main = async () => {
  const state = {
    writers: [],
    twitchScraper: null,
  };
  if (config.elastic.enable) {
    const elasticsearchWriter = new ElasticsearchWriter(config);
    await elasticsearchWriter.setup();
    state.writers.push(elasticsearchWriter);
  }
  if (config.file.enable) {
    const fileWriter = new FileWriter(config);
    await fileWriter.setup();
    state.writers.push(fileWriter);
  }
  if (config.dggScraper.enable) {
    // eslint-disable-next-line no-unused-vars
    const _dggScraper = new DggScraper(config, state.writers);
  }
  if (config.twitchScraper.enable) {
    const twitchScraper = new TwitchScraper(config, state.writers);
    await twitchScraper.setup();
    state.twitchScraper = twitchScraper;
  }

  runCronjobs(state);
};

main();
