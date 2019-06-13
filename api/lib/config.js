const ourEnv = [
  'LOG_LEVEL',
  'APP_PORT',
  'NODE_ENV',
  'ELASTIC_LOCATION',
  'INDEX_NAME',
  'APP_NAME',
  'ROUTE_PREFIX',
  'REDIS_HOST',
  'REDIS_PORT',
]

ourEnv.forEach(
  val =>
    process.env[val]
    || throw new Error(
      `${val} not found in configuration file`,
    ),
)
