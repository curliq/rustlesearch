/* eslint-disable no-await-in-loop */
const Bluebird = require("bluebird");
const FileService = require("./file-service");
const CacheService = require("./cache-service");
const ElasticsearchService = require("./elasticsearch-service");

module.exports = cfg => {
  const fileService = FileService(cfg);
  const cacheService = CacheService(cfg);
  const elasticsearchService = ElasticsearchService(cfg);

  const indexLog = async ({ channel, day }) => {
    await elasticsearchService.elasticSetup();
    const indexCacheSet = await cacheService.getIndexCacheSet();
    if (indexCacheSet.has(fileService.getLogFilename({ channel, day }))) {
      return null;
    }
    const text = await cacheService.fetchLogCached({ channel, day });
    if (text === null) {
      return null;
    }
    const lines = text.trim().split("\n");
    const endStream = elasticsearchService.elasticStreamBuilder();
    for (const line of lines) {
      const msg = elasticsearchService.parseLogMsg(channel, line);
      endStream.write(elasticsearchService.normalizer(msg));
    }
    endStream.end();
    console.log(`All messages sent: ${channel} ${day.format("YYYY-MM-DD")}`);
    return new Promise(resolve => {
      endStream.on("finish", async () => {
        await fileService.indexCacheWrite({ channel, day });
        console.log(`Indexed ${channel} ${day.format("YYYY-MM-DD")}`);
        resolve(true);
      });
    });
  };
  const indexManyLogs = async (channels, days) => {
    for (const day of days) {
      await Bluebird.map(channels, channel => indexLog({ channel, day }), {
        concurrency: cfg.integration.concurrentIndex,
      });
    }
  };
  return {
    indexLog,
    indexManyLogs,
  };
};
