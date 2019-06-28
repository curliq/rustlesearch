const {Client} = require('@elastic/elasticsearch')
const config = require('./config')
const logger = require('./logger')
const {co, capitalise} = require('./util')

const elasticLocation = {node: config.ELASTIC_LOCATION}
const elasticClient = new Client(elasticLocation)

// throws here if we can't connect
elasticClient.info().catch(error => {
  logger.error(`Elastic failed: ${error.message}`)
  throw error
})

const generateElasticQuery = query => {
  const {username, channel, text, startingDate, endingDate} = query
  const filter = []
  const must = []

  if (channel) filter.push({term: {channel: capitalise(channel)}})
  if (username) filter.push({term: {username: username.toLowerCase()}})
  if (text) {
    must.push({
      match: {text: {operator: 'AND', query: text}},
    })
  }

  return {
    from: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              ts: {
                format: 'epoch_second',
                gte: startingDate,
                lte: endingDate,
              },
            },
          },
          ...filter,
        ],
        must,
      },
    },
    size: 100,
    sort: [{ts: {order: 'desc'}}],
  }
}

module.exports = co(function* searchElastic(query) {
  try {
    const result = yield elasticClient.search({
      body: generateElasticQuery(query),
      index: config.INDEX_NAME,
    })

    const logs = result.body.hits.hits.map(log => log._source)

    return {
      logs,
      statusCode: 200,
    }
  } catch (error) {
    logger.error(`ES query failed: ${error.message}`)

    return {
      logs: [],
      statusCode: 404,
    }
  }
})
