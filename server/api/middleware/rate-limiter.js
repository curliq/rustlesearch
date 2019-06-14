import {RateLimiterRedis} from 'rate-limiter-flexible'
import {redisLimiter} from '@lib/redis'
import {co} from '@lib/util'
import {DateTime} from 'luxon'

const rateLimiter = new RateLimiterRedis({
  redis: redisLimiter,
  keyPrefix: 'ratelimiter',
  points: process.env.RATE_LIMIT,
  duration: process.env.RATE_LIMIT_TIMEOUT,
})

export default co(function* (req, res, next) {
  try {
    yield rateLimiter.consume(req.realIp)
    next()
  } catch (rateLimiterResponse) {
    const retryAfter = rateLimiterResponse.msBeforeNext
    const resetAfter = DateTime.utc()
      .plus(retryAfter)
      .toMillis()

    res.set({
      'Retry-After': retryAfter,
      'X-RateLimit-Reset': resetAfter,
    })

    return res.status(429).json({error: 'Too Many Requests'})
  }
})
