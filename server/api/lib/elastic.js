import { Client } from '@elastic/elasticsearch'
import logger from '@lib/logger'
import { co, capitalize } from '@lib/util'

const elasticLocation = { node: process.env.ELASTIC_LOCATION }

const elasticClient = new Client(elasticLocation)

// throws here if we can't connect
elasticClient
  .info()
  .then()
  .catch(e => {
    logger.error(`Elastic failed: ${e.message}`)
    process.exit(1)
  })

const generateElasticQuery = query => {
  const {
    username, channel, text, startingDate, endingDate,
  } = query
  const filter = []
  const must = []

  if (channel) filter.push({ term: { channel: capitalize(channel) } })
  if (username) filter.push({ term: { username: username.toLowerCase() } })
  if (text) {
    must.push({
      match: { text: { query: text, operator: 'AND' } },
    })
  }
  return {
    size: 100,
    from: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              ts: {
                gte: startingDate,
                lte: endingDate,
                format: 'epoch_second',
              },
            },
          },
          ...filter,
        ],
        must,
      },
    },
    sort: [{ ts: { order: 'desc' } }],
  }
}

export default co(function* (query) {
  try {
    const result = yield elasticClient.search({
      index: process.env.INDEX_NAME,
      body: generateElasticQuery(query),
    })
    // eslint-disable-next-line no-underscore-dangle
    const logs = result.body.hits.hits.map(log => log._source)
    return {
      logs,
      statusCode: 200,
    }
  } catch (e) {
    logger.error(`ES query failed: ${e.message}`)
    return {
      logs: [],
      statusCode: 404,
    }
  }
})
