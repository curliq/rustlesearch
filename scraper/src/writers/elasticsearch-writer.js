const etl = require("etl");
const dayjs = require("dayjs");

const utc = require("dayjs/plugin/utc");
const { Client } = require("@elastic/elasticsearch");
const initElastic = require("../init-elastic");

dayjs.extend(utc);

const buildElasticStream = (esClient, { bulkSize, index, pipeline }) =>
  etl.collect(bulkSize).pipe(
    etl.elastic.index(esClient, index, null, {
      concurrency: 10,
      pipeline,
      pushErrors: true,
    }),
  );

const capitalise = string => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

class ElasticsearchWriter {
  constructor(config) {
    this.elasticConfig = config.elastic;
    this.esClient = new Client({
      node: this.elasticConfig.url,
    });
    this.messageStream = buildElasticStream(this.esClient, this.elasticConfig);
  }

  write({ channel, text, ts, username }) {
    this.messageStream.write({
      channel: capitalise(channel),
      text,
      ts: dayjs(ts)
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss[.000Z]"),
      username: username.toLowerCase(),
    });
  }

  async setup() {
    await initElastic(this.elasticConfig);
  }
}
module.exports = ElasticsearchWriter;
