const { invert } = require("ramda");
const logger = require("../lib/logger");

module.exports = options => {
  const supportedLevels = Object.keys(invert(logger.levels.labels));
  const level = (options && options.level) || "info";
  const ignore = (options && options.ignore) || [];
  const honorDNT = (options && options.honorDNT) || false;

  if (!supportedLevels.includes(level))
    throw new Error(`${level} not supported by logger`);

  if (!Array.isArray(ignore))
    throw new Error(`ignore option must be array. Got: ${ignore}`);

  return (req, res, next) => {
    if (ignore.includes(req.path)) return next();
    if (honorDNT && req.headers.DNT) return next();

    logger[level](req);

    return next();
  };
};
