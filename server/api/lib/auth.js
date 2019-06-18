import sa from 'superagent'
import jwt from 'jsonwebtoken'
import logger from '@lib/logger'
export const jwtToPatreonMiddleware = async(req, res, next) => {
  const decoded = decodeJwt(req.body.jwt)
  if (decoded === null)
    return res.status(401).json({error: 'Jwt invalid', revalidate: true})
  try {
    const {body} = await sa
      .get('https://www.patreon.com/api/oauth2/api/current_user')
      .set('authorization', `Bearer ${decoded.accessToken}`)
    req.patreon = body
    return next()
  } catch (e) {
    logger.error(e)
    return res
      .status(400)
      .json({error: 'Patreon fetch info failed', revalidate: false})
  }
}

export const toJwt = accessToken => {
  const token = jwt.sign({accessToken}, process.env.KEY_SECRET, {
    expiresIn: '15m',
  })
  return token
}

export const decodeJwt = token => {
  try {
    const decoded = jwt.verify(token, process.env.KEY_SECRET)
    return decoded
  } catch (e) {
    logger.info('Invalid jwt token', e.message, token)
    return null
  }
}
