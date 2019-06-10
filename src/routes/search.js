const {elasticClient, generateElasticQuery} = require('@lib/elastic')
const {co} = require('@lib/util')

const search = co(function * (fastify, options) {
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
})

module.exports = search
