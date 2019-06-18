import jwt from 'jsonwebtoken'
import logger from '@lib/logger'

export const toJwt = accessToken => {
  const token = jwt.sign({accessToken}, process.env.KEY_SECRET, {
    expiresIn: '1w',
  })
  return token
}

export const decodeJwt = token => {
  try {
    const decoded = jwt.verify(token, process.env.KEY_SECRET)
    return decoded
  } catch (e) {
    logger.debug('Invalid jwt token', e.message, token)
    return null
  }
}
