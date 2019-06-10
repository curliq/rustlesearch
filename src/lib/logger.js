const pino = require('pino')
const {isProd} = require('@lib/environment')

const name = process.env.APP_NAME

const pinoOptions = {
  name,
  base: {name},
  level: process.env.LOG_LEVEL,
  prettyPrint: !isProd(),
}

const logger = pino(pinoOptions)

module.exports = {logger}
