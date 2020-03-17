const { Client } = require("@elastic/elasticsearch");

module.exports = elasticConfig => async () => {
  const client = new Client({
    node: elasticConfig.url,
  });
  await client.indices.putTemplate({
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
        refresh_interval: "1s",
        "sort.field": ["ts", "ts"],
        "sort.order": ["desc", "asc"],
        codec: "best_compression",
      },
    },
    name: "rustlesearch-template",
  });

  await client.ingest.putPipeline({
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
};
