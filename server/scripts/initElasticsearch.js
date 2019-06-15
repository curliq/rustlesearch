const {Client} = require('@elastic/elasticsearch')

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

client.indices.create({
  index: process.env.INDEX_NAME,
  body: {
    settings: {
      'sort.field': 'ts',
      'sort.order': 'desc',
      'refresh_interval': '30s',
      'number_of_replicas': 0,
    },
    mappings: {
      properties: {
        ts: {type: 'date'},
        channel: {type: 'keyword'},
        username: {type: 'keyword'},
        text: {type: 'text'},
      },
    },
  },
})

module.exports = client
