import Redis from 'ioredis'
import mockRedis from 'redis-mock'
import {isDev} from '@lib/environment'

const getRedis = opts => (isDev() ? mockRedis.createClient() : new Redis(opts))

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
