const etl = require("etl");
const { Client } = require("@elastic/elasticsearch");
const { normalizeMessage } = require("../../util");

const initElastic = require("../../init-elastic");

/** A writer into elasticsearch */
class ElasticsearchWriter {
  /*
   * Create new ElasticsearchWriter
   *
   * @param {Object} config Elasticsearch config object
   */
  constructor(elastic) {
    this.config = elastic;
    this.esClient = new Client({
      node: this.config.url,
    });
    this.messageStream = etl.collect(this.config.bulkSize).pipe(
      etl.elastic.index(this.esClient, this.config.index, null, {
        concurrency: 10,
        pipeline: this.config.pipeline,
        pushErrors: true,
      }),
    );
  }

  async setup() {
    await initElastic(this.config);
  }

  /*
   * Construct new ElasticsearchWriter and initializes it
   *
   * @param {Object} config Elasticsearch config object
   */
  static async build(...args) {
    const instance = new ElasticsearchWriter(...args);
    await instance.setup();
    return instance;
  }

  write({ channel, text, ts, username }) {
    const { normMsg } = normalizeMessage(
      {
        channel,
        text,
        ts,
        username,
      },
      "YYYY-MM-DDTHH:mm:ss[.000Z]",
    );
    this.messageStream.write(normMsg);
  }
}
module.exports = ElasticsearchWriter;
