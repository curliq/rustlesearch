import {elasticClient, generateElasticQuery} from '@lib/elastic'
import {co, fs} from '@lib/util'
import logger from '@lib/logger'
import express from 'express'
import ratelimit from '@middleware/rate-limiter'

const router = express.Router()

// throws here if we can't connect
elasticClient
  .info()
  .then()
  .catch(e => {
    logger.error(`Elastic failed: ${e.message}`)
    process.exit(1)
  })

router.get(
  '/healthcheck',
  co(function* (req, res) {
    return res.json({status: 'ALIVE'})
  }),
)

router.get(
  '/search',
  ratelimit,
  co(function* (req, res) {
    if (!req.query.username && !req.query.channel && !req.query.text)
      return res.status(422).json({error: 'Fill at least one parameter'})

    try {
      const searchResult = yield elasticClient.search({
        index: process.env.INDEX_NAME,
        body: generateElasticQuery(req.query),
      })
      res.json(searchResult.body.hits.hits.map(x => x['_source']))
    } catch (e) {
      logger.debug(`ES query failed: ${e.message}`)

      const errorCode = e.meta.statusCode
      res.status(errorCode)

      if (errorCode === 404) return res.json({error: 'Not found'})
      else return res.json({error: 'Unknown error'})
    }
  }),
)

router.get(
  '/channels',
  co(function* (req, res) {
    const channelsFile = yield fs.readFileAsync('./channels.txt', 'utf8')
    const channels = channelsFile.trim().split('\n')
    res.json(channels)
  }),
)

export default router
