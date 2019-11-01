/* eslint-disable no-process-env */

const ourEnv = [
  "APP_NAME",
  "APP_PORT",
  "CHANNEL_LOCATION",
  "DOMAIN",
  "ELASTIC_LOCATION",
  "INDEX_NAME",
  "LOG_LEVEL",
  "NODE_ENV",
  "REDIS_HOST",
  "REDIS_PORT",
  "RATE_LIMIT",
  "RATE_LIMIT_TIMEOUT",
  "WORKER_COUNT",
];

const getConfig = () =>
  ourEnv.reduce((config, varName) => {
    const envVar = process.env[varName];
    // allow missing in non prod
    if (!envVar && process.env.NODE_ENV === "production")
      throw new Error(`${varName} not found in configuration file`);
    // eslint-disable-next-line no-param-reassign
    config[varName] = envVar;

    return config;
  }, {});

module.exports = getConfig();
