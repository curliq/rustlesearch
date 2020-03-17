const etl = require("etl");
const { Client } = require("@elastic/elasticsearch");
const R = require("ramda");
const nanomemoize = require("nano-memoize");

const initElastic = require("../init-elastic");
const { normalizeMessage } = require("../util");

module.exports = cfg => {
  const esClient = new Client({
    node: cfg.elastic.url,
  });
  const elasticSetup = R.once(initElastic(cfg.elastic));
  const elasticStreamBuilder = () => {
    return etl.collect(cfg.elastic.bulkSize).pipe(
      etl.elastic.index(esClient, cfg.elastic.index, null, {
        concurrency: 10,
        pipeline: cfg.elastic.pipeline,
        pushErrors: true,
      }),
    );
  };
  const memoElasticStreamBuilder = nanomemoize(elasticStreamBuilder);

  function parseDateToISO(date) {
    const yyyy = date.slice(0, 4);
    const MM = date.slice(5, 7);
    const dd = date.slice(8, 10);
    const hh = date.slice(11, 13);
    const mm = date.slice(14, 16);
    const ss = date.slice(17, 19);

    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.000Z`;
  }
  // [2020-01-05 00:00:04 UTC] dbd_e: empty
  // [2020-01-05 00:00:04 UTC] ig_frezh: Sell the labs keycards on the flea market for 200k
  // [2020-01-05 00:00:05 UTC] saartki: cmonBruh
  // [2020-01-05 00:00:05 UTC] boobfart: ONE OF THEM ARE ONE OF THEM ARE ONE OF THEM ARE
  // [2020-01-05 00:00:05 UTC] ayychance: @xQcOW YOU GOTTA FARM SCAV RUNS DUDE I'VE MADE OVER A MIL DOING IT TODAY
  const parseLogMsg = (channel, msg) => {
    const bracketIdx = msg.indexOf("]");
    const ts = parseDateToISO(msg.slice(1, bracketIdx));
    const afterBracket = msg.slice(bracketIdx + 2);
    const colonIdx = afterBracket.indexOf(":");
    const username = afterBracket.slice(0, colonIdx);
    const text = afterBracket.slice(colonIdx + 2);
    return {
      channel,
      ts,
      username,
      text,
    };
  };
  const normalizer = msg => normalizeMessage(msg, "YYYY-MM-DDTHH:mm:ss[.000Z]").normMsg;
  const messageWrite = async msg => {
    await elasticSetup();
    const stream = memoElasticStreamBuilder();
    return new Promise(resolve => {
      stream.write(normalizer(msg), () => {
        resolve();
      });
    });
  };
  return { elasticStreamBuilder, normalizer, parseLogMsg, elasticSetup, esClient, messageWrite };
};

// /** Contains abstractions for interfacing with elasticsearch */
// class ElasticsearchService {
//   /**
//    * Create new ElasticsearchService
//    *
//    * @param {Object} config Main config object
//    */
//   constructor(config) {
//     this.config = config.elastic;
//     this.esClient = new Client({
//       node: this.config.url,
//     });
//   }

//   async setup() {
//     await initElastic(this.config);
//     if (this.config.writerEnabled) {
//       this.writer = await ElasticsearchWriter.build(this.config);
//     } else {
//       this.writer = null;
//     }
//   }

//   /*
//    * Construct new ElasticsearchWriter and initializes it
//    *
//    * @param {Object} config Main config object
//    */
//   static async build(...args) {
//     const instance = new ElasticsearchService(...args);
//     await instance.setup();
//     return instance;
//   }

//   static generalQueryBuilder({ start, end, channel, username }, advanced = false) {
//     let qry = esb.boolQuery();
//     if (start || end) {
//       let rangeQuery = esb.RangeQuery("ts");
//       if (start) {
//         rangeQuery = rangeQuery.gte(start.format("YYYY-MM-DD"));
//       }
//       if (end) {
//         rangeQuery = rangeQuery.lte(end.format("YYYY-MM-DD"));
//       }
//       qry = qry.filter(rangeQuery);
//     }
//     if (channel) {
//       const channelQuery = advanced
//         ? esb.simpleQueryStringQuery(channel).field("channel")
//         : esb.termsQuery("channel", channel);
//       qry = qry.filter(channelQuery);
//     }
//     if (username) {
//       const usernameQuery = advanced
//         ? esb.simpleQueryStringQuery(username).field("username")
//         : esb.termsQuery("username", username);
//       qry = qry.filter(usernameQuery);
//     }
//     const requestBody = esb.requestBodySearch().query(qry);
//     return requestBody;
//   }

//   async delete({ start, end, channel, username } = {}) {
//     const query = ElasticsearchService.generalQueryBuilder({
//       start,
//       end,
//       channel,
//       username,
//     });
//     await this.esClient.deleteByQuery({
//       index: `${this.config.index}-*`,
//       body: query.toJSON(),
//     });
//   }

//   async deleteOneDay({ day, channel, username } = {}) {
//     const query = ElasticsearchService.generalQueryBuilder({
//       start: day,
//       end: day,
//       channel,
//       username,
//     });
//     await this.esClient.deleteByQuery({
//       index: `${this.config.index}-${day.format("YYYY-MM-[01]")}`,
//       body: query.toJSON(),
//     });
//   }

//   async search({ start, end, channel, username }) {
//     const query = ElasticsearchService.generalQueryBuilder(
//       {
//         start,
//         end,
//         channel,
//         username,
//       },
//       true,
//     )
//       .sort(esb.sort("ts", "desc"))
//       .size(this.config.size);

//     const res = await this.esClient.search({
//       index: `${this.config.index}-*`,
//       body: query.toJSON(),
//     });
//     return res;
//   }

//   async count({ start, end, channel, username }) {
//     const query = ElasticsearchService.generalQueryBuilder(
//       {
//         start,
//         end,
//         channel,
//         username,
//       },
//       true,
//     );

//     const res = await this.esClient.count({
//       index: `${this.config.index}-*`,
//       body: query.toJSON(),
//       terminate_after: this.config.maxCount,
//     });
//     return res;
//   }
// }
// module.exports = ElasticsearchService;
