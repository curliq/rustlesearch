const {Client} = require('@elastic/elasticsearch')

const elasticLocation = {node: process.env.ELASTIC_LOCATION}
const elasticClient = new Client(elasticLocation)

const generateElasticQuery = ({
  username,
  channel,
  text,
  startingDate,
  endingDate,
}) => {
  const must = []
  if (channel) must.push({match: {channel: channel}})

  if (username) must.push({match: {username: username}})

  if (text) must.push({match: {text: {query: text, operator: 'AND'}}})

  return {
    size: 100,
    from: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              ts: {
                gte: startingDate || 'now-30d/h',
                lt: endingDate || 'now/h',
              },
            },
          },
        ],
        must: must,
      },
    },
    sort: [{ts: {order: 'desc'}}],
  }
}

module.exports = {elasticClient, generateElasticQuery}
