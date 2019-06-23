/* eslint-disable no-process-env */

const ourEnv = [
  'LOG_LEVEL',
  'APP_PORT',
  'NODE_ENV',
  'ELASTIC_LOCATION',
  'INDEX_NAME',
  'APP_NAME',
  'REDIS_HOST',
  'REDIS_PORT',
  'WORKER_COUNT',
  'RATE_LIMIT',
  'RATE_LIMIT_TIMEOUT',
  'DOMAIN',
]

const getConfig = () =>
  ourEnv.reduce((config, varName) => {
    const envVar = process.env[varName]
    if (!envVar) throw new Error(`${varName} not found in configuration file`)
    config[varName] = envVar

    return config
  }, {})

module.exports = getConfig()
