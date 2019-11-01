const { Client } = require("@elastic/elasticsearch");
const config = require("../config");
const logger = require("./logger");
const { co, capitalise } = require("./util");

const elasticClient = new Client({ node: config.elastic.url });

// throws here if we can't connect
elasticClient.info().catch(error => {
  logger.error(`Elastic failed: ${error.message}`);
  throw error;
});

const generateElasticQuery = query => {
  const {
    username,
    channel,
    text,
    startingDate,
    endingDate,
    searchAfter,
  } = query;

  const filter = [];
  const must = [];
  if (channel) filter.push({ term: { channel: capitalise(channel) } });
  if (username) filter.push({ term: { username: username.toLowerCase() } });
  if (text) {
    must.push({
      match: { text: { operator: "AND", query: text } },
    });
  }

  return {
    query: {
      bool: {
        filter: [
          {
            range: {
              ts: {
                gte: startingDate,
                lte: endingDate,
              },
            },
          },
          ...filter,
        ],
        must,
      },
    },
    size: 100,
    sort: [{ ts: "desc" }],
    search_after: searchAfter ? [searchAfter] : undefined,
  };
};

module.exports = co(function* searchElastic(query) {
  try {
    const result = yield elasticClient.search({
      body: generateElasticQuery(query),
      index: `${config.elastic.index}-*`,
    });

    const logs = result.body.hits.hits.map(log => {
      return {
        // eslint-disable-next-line no-underscore-dangle
        ...log._source,
        search_after: log.sort[0],
      };
    });

    return {
      logs,
      statusCode: 200,
    };
  } catch (error) {
    logger.error(`ES query failed: ${error.message}`);

    return {
      logs: [],
      statusCode: 404,
    };
  }
});
