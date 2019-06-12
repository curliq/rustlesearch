import {elasticClient, generateElasticQuery} from '@lib/elastic'
import {co, fs} from '@lib/util'
import logger from '@lib/logger'
import express from 'express'
import RateLimiter from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import {redisLimiter} from '@lib/redis'
const router = express.Router()

// throws here if we can't connect
elasticClient
  .info()
  .then()
  .catch(e => {
    logger.error(`Elastic failed: ${e.message}`)
    process.exit(1)
  })

const limiter = new RateLimiter({
  store: new RedisStore({client: redisLimiter}),
  windowMs: 4000,
  max: 2,
})

router.get(
  '/healthcheck',
  co(function* (req, res) {
    res.send('ALIVE')
  }),
)

router.get(
  '/search',
  limiter,
  co(function* (req, res) {
    try {
      const searchResult = yield elasticClient.search({
        index: process.env.INDEX_NAME,
        body: generateElasticQuery(req.query),
      })
      res.json(searchResult.body.hits.hits.map(x => x['_source']))
    } catch (e) {
      // just respond with elastics error
      // usually a 404
      logger.debug(`ES query failed: ${e.message}`)
      res.status(e.meta.statusCode).send({error: 'squadW'})
    }
  }),
)

router.get(
  '/channels',
  co(function* (req, res) {
    const channelsFile = yield fs.readFileAsync('./channels.txt', 'utf8')
    res.json(channelsFile.trim().split('\n'))
  }),
)
export default router
