import pino from 'pino'
import {isProd} from '@lib/environment'

const name = process.env.APP_NAME

const pad = n => `00${n}`.slice(-2)

const getDate = timestamp => {
  const ts = parseInt(timestamp)
  if (isNaN(ts)) return undefined
  const date = new Date(ts)
  const formattedDate = `${date.getFullYear()}-${pad(date.getMonth())}-${pad(
    date.getDay(),
  )}`
  return formattedDate
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
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  serializers: {
    req: req => getLoggerInfo(req.raw),
  },
}

export default pino(pinoOptions)
