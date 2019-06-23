const Redis = require('ioredis')
const mockRedis = require('redis-mock')
const {isTest} = require('./environment')
const config = require('./config')

const getRedis = opts => (isTest() ? mockRedis.createClient() : new Redis(opts))

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
