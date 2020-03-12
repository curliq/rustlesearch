const confic = require("confic");

module.exports = confic(
  {
    elastic: {
      enable: true,
      url: "http://localhost:9200",
      index: "rustlesearch",
      bulkSize: 2000,
      pipeline: "rustlesearch-pipeline",
    },
    fileWriter: {
      enable: true,
      directory: "data/orl",
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
    port: 3000,
  },
  { inspect: true },
);
