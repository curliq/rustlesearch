const {Client} = require('@elastic/elasticsearch')
const config = require('../api/lib/config')

const client = new Client({
  node: config.ELASTIC_LOCATION,
})

const main = () =>
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
        'refresh_interval': '30s',
        'sort.field': 'ts',
        'sort.order': 'desc',
      },
    },
    index: config.INDEX_NAME,
  })

if (require.main === module) main()
