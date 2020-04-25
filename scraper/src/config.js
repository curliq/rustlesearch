const confic = require("confic");

const config = confic(
  // {
  //   elastic: {
  //     writerEnabled: true,
  //     url: "http://localhost:9200",
  //     index: "rustlesearch",
  //     bulkSize: 2000,
  //     pipeline: "rustlesearch-pipeline",
  //     maxCount: 10000,
  //     size: 200,
  //   },
  //   fileWriter: {
  //     writerEnabled: true,
  //     directory: "data/orl",
  //   },
  //   twitchScraper: {
  //     enable: true,
  //     maxChannels: 200, // Maximum channels per individual connection
  //     maxConnections: 20, // Maximum parallel connections, not sure what this really means tho
  //   },
  //   dggScraper: {
  //     enable: true,
  //     url: "wss://www.destiny.gg/ws",
  //   },
  //   downloadService: {
  //     channelsUrl: "https://overrustlelogs.net/api/v1/channels.json",
  //     monthsPath: "data/months",
  //   },
  //   cliApi: {
  //     port: 4000,
  //   },
  //   cache: {
  //     downloadCachePath: "data/download-cache.txt",
  //     indexCachePath: "data/index-cache.txt",
  //   },
  //   port: 3000,
  // },
  {
    elastic: {
      index: "rustlesearch",
      bulkSize: 500,
      url: "http://localhost:9200",
      enable: true,
    },
    file: {
      enable: true,
    },
    paths: {
      channels: "../channels.txt",
      orl: "data/orl",
    },
    twitchScraper: {
      enable: true,
      maxChannels: 200, // Maximum channels per individual connection
      maxConnections: 20, // Maximum parallel connections, not sure what this really means tho
    },
    dggScraper: {
      enable: true,
      url: "wss://www.destiny.gg/ws",
    },
  },
  { inspect: true },
);

module.exports = config;
