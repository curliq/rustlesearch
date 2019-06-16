import Redis from 'ioredis'
import mockRedis from 'redis-mock'
import {isTest} from '@lib/environment'

const getRedis = opts => (isTest() ? mockRedis.createClient() : new Redis(opts))

const redisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  enableOfflineQueue: false,
  family: 4,
  retry_strategy: ({attempt}) => Math.min(attempt * 500, 3000),
}

const redisLimiterOptions = {
  ...redisOptions,
  db: 0,
  keyPrefix: 'ratelimit',
}

const redisSessionOptions = {
  ...redisOptions,
  db: 1,
  keyPrefix: 'express',
}

export const redisLimiter = getRedis(redisLimiterOptions)
export const redisSession = getRedis(redisSessionOptions)
