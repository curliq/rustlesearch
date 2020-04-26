const confic = require("confic");

module.exports = confic({
  elastic: {
    url: "http://localhost:9200",
    index: "rustlesearch",
  },
  download: {
    throttle: 500,
    days: 10,
  },
  index: {
    threads: 6,
    bulkSize: 8000,
  },
  paths: {
    months: "data/months",
    channels: "../channels.txt",
    orl: "../orl",
    missingCache: "data/missing-cache.txt",
    indexCache: "data/index-cache.txt",
  },
});
