const {Client} = require('@elastic/elasticsearch')

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const initElastic = (refreshInterval = '60s') =>
  client.indices.create({
    body: {
      mappings: {
        properties: {
          channel: {type: 'keyword'},
          text: {type: 'text'},
          ts: {type: 'date'},
          username: {type: 'keyword'},
        },
      },
      settings: {
        'number_of_replicas': 0,
        'number_of_shards': 5,

        'refresh_interval': refreshInterval,
        'sort.field': 'ts',

        'sort.order': 'desc',
      },
    },
    index: process.env.INDEX_NAME,
  })

if (require.main === module) initElastic()

module.exports = {
  initElastic,
}
