const confic = require("confic");

module.exports = confic({
  app: {
    port: null,
    name: "Rustlesearch",
  },
  paths: {
    channels: "channels.txt",
  },
  elastic: {
    url: "http://localhost:9200",
    index: "rustlesearch",
  },
  redis: {
    host: "localhost",
    port: null,
  },
  rateLimit: {
    duration: 4,
    points: 1,
  },
  logLevel: "debug",
  workers: 4,
  nodeEnv: null,
  get isProd() {
    return this.nodeEnv === "production";
  },
  get isDev() {
    return this.nodeEnv === "development";
  },
  get isTest() {
    return this.nodeEnv === "test";
  },
});
