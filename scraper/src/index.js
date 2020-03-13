const config = require("./config");
const TwitchScraper = require("./services/scrapers/twitch-scraper");
const DggScraper = require("./services/scrapers/dgg-scraper");
const ElasticsearchService = require("./services/elasticsearch-service");
const CacheService = require("./services/cache-service");
const FileService = require("./services/file-service");
const DownloadService = require("./services/download-service");
const cliApi = require("./apis/cli-api/index");

const main = async () => {
  const cacheService = await CacheService.build(config);
  const elasticsearchService = await ElasticsearchService.build(config);
  const fileService = await FileService.build(config);
  const downloadService = await DownloadService.build(config, fileService, cacheService);
  const writers = [elasticsearchService.writer, fileService.writer].filter(Boolean);
  if (config.dggScraper.enable) {
    // eslint-disable-next-line no-unused-vars
    const dggScraper = new DggScraper(config, writers);
  }
  if (config.twitchScraper.enable) {
    const twitchScraper = await TwitchScraper.build(config, writers);
    console.log(twitchScraper.chatClient.joinedChannels);
    downloadService.getMonths([...twitchScraper.chatClient.joinedChannels]);
  }
  cliApi(config, {
    cacheService,
    downloadService,
    fileService,
    elasticsearchService,
  });
};

main();
