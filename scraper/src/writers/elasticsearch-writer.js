const etl = require("etl");
const { Client } = require("@elastic/elasticsearch");
const TransformService = require("../transform-service.js");

const initElastic = require("../init-elastic");

class ElasticsearchWriter {
  constructor(cfg) {
    this.cfg = cfg;
    this.esClient = new Client({ node: this.cfg.elastic.url });
    this.messageStream = etl.streamz();
    this.messageStream
      .pipe(etl.collect(this.cfg.elastic.bulkSize))
      .pipe(etl.map((msgs) => this.bulkIndex(msgs)));
  }

  async setup() {
    await this.initElastic();
  }

  async bulkIndex(msgs) {
    const { index } = this.cfg.elastic;
    const body = msgs.flatMap((doc) => [{ index: { _index: index } }, doc]);
    await this.esClient.bulk({
      pipeline: `${this.cfg.elastic.index}-pipeline`,
      body,
    });
  }

  write({ channel, username, text, ts }) {
    const msg = TransformService.toMessage({ channel, username, text, ts });
    this.messageStream.write(TransformService.msgToElasticMsg(msg));
  }

  initElastic() {
    return initElastic(this.cfg, this.esClient);
  }
}

module.exports = ElasticsearchWriter;
