const Promise = require("bluebird");
const config = require("../config");
const logger = require("./logger");

// eslint-disable-next-line import/order
const Redis = config.isTest ? require("ioredis-mock") : require("ioredis");

Redis.Promise = Promise;

const getRedis = opts => new Redis(opts);

const redisOptions = {
  enableOfflineQueue: false,
  family: 4,
  host: config.redis.host,
  maxRetriesPerRequest: 5,
  port: config.redis.port,
  retryStrategy: attempts => {
    if (attempts > 5) {
      logger.error("Multiple redis connection failures, exiting...");
      process.exit(1);
    }

    return Math.min(attempts * 500, 3000);
  },
  showFriendlyErrorStack: true,
};

const redisLimiterOptions = {
  ...redisOptions,
  db: 0,
  keyPrefix: "ratelimit",
};

const redisLimiter = getRedis(redisLimiterOptions);

module.exports = { redisLimiter };
