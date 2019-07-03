const {RateLimiterRedis} = require('rate-limiter-flexible')
const {DateTime} = require('luxon')
const {redisLimiter} = require('../lib/redis')
const {co} = require('../lib/util')
const config = require('../lib/config')

const rateLimiter = new RateLimiterRedis({
  duration: config.RATE_LIMIT_TIMEOUT,
  keyPrefix: 'ratelimiter',
  points: config.RATE_LIMIT,
  redis: redisLimiter,
})

module.exports = co(function* rateLimit(req, res, next) {
  try {
    yield rateLimiter.consume(req.realIp)

    return next()
  } catch (error) {
    const retryAfter = error.msBeforeNext

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
