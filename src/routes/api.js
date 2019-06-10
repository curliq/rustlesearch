import {elasticClient, generateElasticQuery} from '@lib/elastic'
import {co} from '@lib/util'
import {logger} from '@lib/logger'

export default (fastify, options, next) => {
  // throws here if we can't connect
  elasticClient
    .info()
    .then()
    .catch(e => {
      logger.error(`Elastic failed: ${e.message}`)
      process.exit()
    })
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
      const searchResult = yield elasticClient.search({
        index: process.env.INDEX_NAME,
        body: generateElasticQuery(req.query),
      })
      // not sure if this works
      return searchResult.body.hits.hits.map(x => x['_source'])
    }),
  )
  next()
}
