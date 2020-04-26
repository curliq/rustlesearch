/* eslint-disable camelcase */

const { Client } = require("@elastic/elasticsearch");

module.exports = async cfg => {
  const client = new Client({
    nodes: cfg.elastic.url,
  });
  await client.indices.putTemplate({
    body: {
      index_patterns: `${cfg.elastic.index}*`,
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
    name: `${cfg.elastic.index}-template`,
  });

  await client.ingest.putPipeline({
    body: {
      description: "monthly date-time index naming",
      processors: [
        {
          date_index_name: {
            date_rounding: "M",
            field: "ts",
            index_name_prefix: `${cfg.elastic.index}-`,
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
    id: `${cfg.elastic.index}-pipeline`,
  });
};
