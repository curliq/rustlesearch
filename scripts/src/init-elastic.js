/* eslint-disable camelcase */
const {Client} = require('@elastic/elasticsearch')

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const initElastic = (refreshInterval = '60s') => {
  client.indices.putTemplate({
    body: {
      index_patterns: `${process.env.INDEX_NAME}*`,
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
        'number_of_shards': 1,

        'refresh_interval': refreshInterval,
        'sort.field': 'ts',
        'sort.order': 'desc',
      },
    },
    name: 'rustlesearch-template',
  })

  client.ingest.putPipeline({
    body: {
      description: 'monthly date-time index naming',
      processors: [
        {
          date_index_name: {
            date_rounding: 'M',
            field: 'ts',
            index_name_prefix: `${process.env.INDEX_NAME}-`,
          },
        },
        {
          set: {
            field: '_id',
            value: '{{channel}}-{{username}}-{{ts}}',
          },
        },
      ],
    },
    id: 'rustlesearch-pipeline',
  })
}

if (require.main === module) initElastic()

module.exports = {
  initElastic,
}
