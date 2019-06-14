import pino from 'pino'
import {isProd} from '@lib/environment'

const name = process.env.APP_NAME

const getLoggerInfo = req => {
  const ip = req.realIp
  const {channel, username, text, startingDate, endingDate} = req.query
  return {
    ip,
    channel,
    username,
    text,
    startingDate,
    endingDate,
  }
}

const pinoOptions = {
  name,
  base: {name},
  level: process.env.LOG_LEVEL,
  prettyPrint: !isProd(),
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  serializers: {
    req: req => getLoggerInfo(req.raw),
  },
}

export default pino(pinoOptions)
