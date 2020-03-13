const esb = require("elastic-builder");
const { Client } = require("@elastic/elasticsearch");
const ElasticsearchWriter = require("./writers/elasticsearch-writer");

const initElastic = require("../init-elastic");

/** Contains abstractions for interfacing with elasticsearch */
class ElasticsearchService {
  /**
   * Create new ElasticsearchService
   *
   * @param {Object} config Main config object
   */
  constructor(config) {
    this.config = config.elastic;
    this.esClient = new Client({
      node: this.config.url,
    });
  }

  async setup() {
    await initElastic(this.config);
    if (this.config.writerEnabled) {
      this.writer = await ElasticsearchWriter.build(this.config);
    } else {
      this.writer = null;
    }
  }

  /*
   * Construct new ElasticsearchWriter and initializes it
   *
   * @param {Object} config Main config object
   */
  static async build(...args) {
    const instance = new ElasticsearchService(...args);
    await instance.setup();
    return instance;
  }

  static generalQueryBuilder({ start, end, channel, username }, advanced = false) {
    let qry = esb.boolQuery();
    if (start || end) {
      let rangeQuery = esb.RangeQuery("ts");
      if (start) {
        rangeQuery = rangeQuery.gte(start.format("YYYY-MM-DD"));
      }
      if (end) {
        rangeQuery = rangeQuery.lte(end.format("YYYY-MM-DD"));
      }
      qry = qry.filter(rangeQuery);
    }
    if (channel) {
      const channelQuery = advanced
        ? esb.simpleQueryStringQuery(channel).field("channel")
        : esb.termsQuery("channel", channel);
      qry = qry.filter(channelQuery);
    }
    if (username) {
      const usernameQuery = advanced
        ? esb.simpleQueryStringQuery(username).field("username")
        : esb.termsQuery("username", username);
      qry = qry.filter(usernameQuery);
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
      index: `${this.config.index}-*`,
      body: query.toJSON(),
    });
  }

  async deleteOneDay({ day, channel, username } = {}) {
    const query = ElasticsearchService.generalQueryBuilder({
      start: day,
      end: day,
      channel,
      username,
    });
    await this.esClient.deleteByQuery({
      index: `${this.config.index}-${day.format("YYYY-MM-[01]")}`,
      body: query.toJSON(),
    });
  }

  async search({ start, end, channel, username }) {
    const query = ElasticsearchService.generalQueryBuilder(
      {
        start,
        end,
        channel,
        username,
      },
      true,
    )
      .sort(esb.sort("ts", "desc"))
      .size(this.config.size);

    const res = await this.esClient.search({
      index: `${this.config.index}-*`,
      body: query.toJSON(),
    });
    return res;
  }

  async count({ start, end, channel, username }) {
    const query = ElasticsearchService.generalQueryBuilder(
      {
        start,
        end,
        channel,
        username,
      },
      true,
    );

    const res = await this.esClient.count({
      index: `${this.config.index}-*`,
      body: query.toJSON(),
      terminate_after: this.config.maxCount,
    });
    return res;
  }
}
module.exports = ElasticsearchService;
