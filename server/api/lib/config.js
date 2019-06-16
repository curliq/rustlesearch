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
  'KEY_SECRET',
]

ourEnv.forEach(
  val =>
    process.env[val]
    || throw new Error(`${val} not found in configuration file`),
)
