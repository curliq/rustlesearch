import pino from 'pino'
import {isProd} from '@lib/environment'
import {DateTime} from 'luxon'

const name = process.env.APP_NAME

const getDate = timestamp => {
  const parsed = parseInt(timestamp)
  if (isNaN(parsed)) return undefined
  const date = DateTime.fromMillis(parsed)
  return date.toFormat('yyyy-MM-dd')
}

const getLoggerInfo = req => {
  const ip = req.headers['X-Real-IP']
  const {channel, username, text, startingDate, endingDate} = req.query
  return {
    ip,
    channel,
    username,
    text,
    startingDate: getDate(startingDate),
    endingDate: getDate(endingDate),
  }
}

const pinoOptions = {
  name,
  base: {name},
  level: process.env.LOG_LEVEL,
  prettyPrint: !isProd(),
  timestamp: () => {
    return `,"time":"${DateTime.utc().toLocaleString(
      DateTime.DATETIME_SHORT_WITH_SECONDS,
    )}"`
  },
  serializers: {
    req: req => getLoggerInfo(req.raw),
  },
}

export const logger = pino(pinoOptions)

export const loggerMiddleware = options => (req, res, next) => {
  const {ignore} = options
  // the level to log at, not the level for ignoring logs
  const level = options?.level ?? 'info'

  // we can pass an array of paths to ignore
  if (Array.isArray(ignore) && ignore.includes(req.path)) next()

  // call level logger if exists
  // eslint-disable-next-line
  logger?.[level](req)
  next()
}
