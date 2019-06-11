import {elasticClient, generateElasticQuery} from '@lib/elastic'
import {co} from '@lib/util'
import {logger} from '@lib/logger'
import express from 'express'
import rateLimit from 'express-rate-limit'
const router = express.Router()

// throws here if we can't connect
elasticClient
  .info()
  .then()
  .catch(e => {
    logger.error(`Elastic failed: ${e.message}`)
    process.exit()
  })
const limiter = rateLimit({
  windowMs: 4000,
  max: 2,
})

router.get(
  '/healthcheck',
  co(function * (req, res) {
    res.send('ALIVE')
  }),
)
// TODO: use redis for cache... to allow scaling past 1 process
router.get(
  '/search',
  limiter,
  co(function * (req, res) {
    try {
      const searchResult = yield elasticClient.search({
        index: process.env.INDEX_NAME,
        body: generateElasticQuery(req.query),
      })
      // not sure if this works
      res.json(searchResult.body.hits.hits.map(x => x['_source']))
    } catch (e) {
      // just respond with elastics error
      // usually a 404
      res
        .status(e.meta.statusCode)
        .send({error: 'beep boop there was an error 4head'})
    }
  }),
)

export default router
