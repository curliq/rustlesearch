import pino from 'pino'
import {isProd} from '@lib/environment'

const name = process.env.APP_NAME

const pinoOptions = {
  name,
  base: {name},
  level: process.env.LOG_LEVEL,
  prettyPrint: !isProd(),
}

export const logger = pino(pinoOptions)
