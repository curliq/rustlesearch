const Promise = require('bluebird')
const {isTest} = require('./environment')
const config = require('./config')
const logger = require('./logger')

// eslint-disable-next-line import/order
const Redis = isTest() ? require('ioredis-mock') : require('ioredis')

Redis.Promise = Promise

const getRedis = opts => new Redis(opts)

const redisOptions = {
  enableOfflineQueue: false,
  family: 4,
  host: config.REDIS_HOST,
  maxRetriesPerRequest: 5,
  port: config.REDIS_PORT,
  retryStrategy: attempts => {
    if (attempts > 5) {
      logger.error('Multiple redis connection failures, exiting...')
      process.exit(1)
    }

    return Math.min(attempts * 500, 3000)
  },
  showFriendlyErrorStack: true,
}

const redisLimiterOptions = {
  ...redisOptions,
  db: 0,
  keyPrefix: 'ratelimit',
}

const redisLimiter = getRedis(redisLimiterOptions)

module.exports = {redisLimiter}
