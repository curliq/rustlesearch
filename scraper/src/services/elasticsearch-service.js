const etl = require("etl");
const esb = require("elastic-builder"); // the builder
const { Client } = require("@elastic/elasticsearch");
const { dayjs } = require("../util");

const initElastic = require("../init-elastic");

const buildElasticStream = (esClient, { bulkSize, index, pipeline }) =>
  etl.collect(bulkSize).pipe(
    etl.elastic.index(esClient, index, null, {
      concurrency: 10,
      pipeline,
      pushErrors: true,
    }),
  );

const capitalise = string => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

class ElasticsearchService {
  constructor(config) {
    this.elasticConfig = config.elastic;
    this.esClient = new Client({
      node: this.elasticConfig.url,
    });
    this.messageStream = buildElasticStream(this.esClient, this.elasticConfig);
  }

  async setup() {
    await initElastic(this.elasticConfig);
  }

  static async build(...args) {
    const instance = new ElasticsearchService(...args);
    await instance.setup();
    return instance;
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

  static generalQueryBuilder({ start, end, channel, username }) {
    let qry = esb.boolQuery();
    if (start && end) {
      qry = qry.filter(
        esb
          .RangeQuery("ts")
          .gte(start.format("YYYY-MM-DD"))
          .lte(end.format("YYYY-MM-DD")),
      );
    }
    if (channel) {
      qry = qry.filter(esb.termsQuery("channel", channel));
    }
    if (username) {
      qry = qry.filter(esb.termsQuery("username", username));
    }
    const requestBody = esb.requestBodySearch().query(qry);
    return requestBody;
  }

  async delete({ start, end, channel, username } = {}) {
    const query = ElasticsearchService.generalQueryBuilder({
      start,
      end,
      channel,
      username,
    });
    await this.esClient.deleteByQuery({
      index: this.elasticConfig.index,
      body: query.toJSON(),
    });
  }

  async search({ start, end, channel, username }) {
    let qry = esb.boolQuery();
    if (start && end) {
      qry = qry.filter(
        esb
          .RangeQuery("ts")
          .gte(start.format("YYYY-MM-DD"))
          .lte(end.format("YYYY-MM-DD")),
      );
    }
    if (channel) {
      qry = qry.filter(esb.simpleQueryStringQuery(channel).field("channel"));
    }
    if (username) {
      qry = qry.filter(esb.simpleQueryStringQuery(username).field("username"));
    }
    const query = esb.requestBodySearch().query(qry);
    await this.esClient.search({
      index: `${this.elasticConfig.index}-*`,
      body: query.sort(esb.sort("ts", "desc")).toJSON(),
    });
  }
}
module.exports = ElasticsearchService;
