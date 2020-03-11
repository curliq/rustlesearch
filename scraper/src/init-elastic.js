const { Client } = require("@elastic/elasticsearch");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async elasticConfig => {
  const client = new Client({
    node: elasticConfig.url,
  });
  client.indices.putTemplate({
    body: {
      index_patterns: `${elasticConfig.index}*`,
      mappings: {
        properties: {
          channel: { type: "keyword" },
          text: { type: "text" },
          ts: { type: "date" },
          username: { type: "keyword" },
        },
      },
      settings: {
        number_of_replicas: 0,
        number_of_shards: 1,

        refresh_interval: "60s",
        "sort.field": "ts",
        "sort.order": "desc",
      },
    },
    name: "rustlesearch-template",
  });

  client.ingest.putPipeline({
    body: {
      description: "monthly date-time index naming",
      processors: [
        {
          date_index_name: {
            date_rounding: "M",
            field: "ts",
            index_name_prefix: `${elasticConfig.index}-`,
          },
        },
        {
          set: {
            field: "_id",
            value: "{{channel}}-{{username}}-{{ts}}",
          },
        },
      ],
    },
    id: "rustlesearch-pipeline",
  });
  await sleep(500);
};
