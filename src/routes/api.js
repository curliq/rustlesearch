import {elasticClient, generateElasticQuery} from '@lib/elastic'
import {co} from '@lib/util'
import {logger} from '@lib/logger'

// throws here if we can't connect
elasticClient
  .info()
  .then()
  .catch(e => {
    logger.error(`Elastic failed: ${e.message}`)
    process.exit()
  })

export default (fastify, options, next) => {
  fastify.get(
    '/healthcheck',
    co(function * (req, res) {
      return 'ALIVE'
    }),
  )
  // TODO: use redis for cache... to allow scaling past 1 process
  fastify.register(require('fastify-rate-limit'), {
    max: 2,
    timeWindow: 4000,
  })
  fastify.get(
    '/search',
    co(function * (req, res) {
      try {
        const searchResult = yield elasticClient.search({
          index: process.env.INDEX_NAME,
          body: generateElasticQuery(req.query),
        })
        return searchResult.body.hits.hits.map(x => x['_source'])
      } catch (e) {
        // just respond with elastics error
        // usually a 404
        res.code(e.meta.statusCode)
        res.send()
      }
    }),
  )
  next()
}
