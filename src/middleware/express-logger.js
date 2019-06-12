import logger from '@lib/logger'
import {invert} from 'ramda'

export default options => {
  const supportedLevels = Object.keys(invert(logger.levels.labels))
  const level = options?.level ?? 'info'
  const ignore = options?.ignore ?? []
  const honorDNT = options?.honorDNT ?? false

  if (!supportedLevels.includes(level))
    throw new Error(`${level} not supported by logger`)

  if (!Array.isArray(ignore))
    throw new Error(`ignore option must be array. Got: ${ignore}`)

  return (req, res, next) => {
    if (ignore.includes(req.path)) next()
    if (honorDNT && req.header('DNT')) next()

    logger[level](req)
    next()
  }
}
