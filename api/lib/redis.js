import Redis from 'ioredis'
import mockRedis from 'redis-mock'
import {isProd} from '@lib/environment'

const getRedis = opts => (isProd() ? new Redis(opts) : mockRedis.createClient())

const redisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  family: 4,
  retry_strategy: ({attempt}) => Math.min(attempt * 500, 3000),
}

const redisLimiterOptions = {
  ...redisOptions,
  db: 0,
  keyPrefix: 'ratelimit',
}

export const redisLimiter = getRedis(redisLimiterOptions)
