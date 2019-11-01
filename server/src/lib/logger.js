const pino = require("pino");
const config = require("../config");

const name = config.APP_NAME;

const getLoggerInfo = req => {
  const ip = req.realIp;

  const {
    channel,
    username,
    text,
    startingDate,
    endingDate,
    searchAfter,
  } = req.query;

  return {
    channel,
    endingDate,
    ip,
    startingDate,
    text,
    username,
    searchAfter,
  };
};

const pinoOptions = {
  base: { name },
  level: config.logLevel,
  name,
  prettyPrint: !config.isProd,
  serializers: {
    req: req => getLoggerInfo(req.raw),
  },
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
};

module.exports = pino(pinoOptions);
