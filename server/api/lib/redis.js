const Promise = require('bluebird')
const {isTest} = require('./environment')
const config = require('./config')

const Redis = isTest() ? require('ioredis-mock') : require('ioredis')

// ioredis-mock doesn't use bluebird by default
Redis.Promise = Promise

const getRedis = opts => new Redis(opts)

const redisOptions = {
  enableOfflineQueue: false,
  family: 4,
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  retryStrategy: ({attempt}) => Math.min(attempt * 500, 3000),
}

const redisLimiterOptions = {
  ...redisOptions,
  db: 0,
  keyPrefix: 'ratelimit',
}

module.exports = getRedis(redisLimiterOptions)
