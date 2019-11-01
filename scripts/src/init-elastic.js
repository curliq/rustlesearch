/* eslint-disable camelcase */
const { Client } = require("@elastic/elasticsearch");
const config = require("./config");
const { sleep } = require("../util");

const client = new Client({
  node: config.elastic.url,
});

const initElastic = async (refreshInterval = "60s") => {
  client.indices.putTemplate({
    body: {
      index_patterns: `${config.elastic.index}*`,
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

        refresh_interval: refreshInterval,
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
            index_name_prefix: `${config.elastic.index}-`,
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

module.exports = {
  initElastic,
};
