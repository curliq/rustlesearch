import sa from 'superagent'
import logger from '@lib/logger'
import {decodeJwt} from '@lib/auth'
import {co} from '@lib/util'

export default co(function* (req, res, next) {
  const decoded = decodeJwt(req.body.jwt)
  if (decoded === null)
    return res.status(401).json({error: 'Jwt invalid', revalidate: true})
  try {
    const {body} = yield sa
      .get('https://www.patreon.com/api/oauth2/api/current_user')
      .set('authorization', `Bearer ${decoded.accessToken}`)
    req.patreon = body
    return next()
  } catch (e) {
    logger.debug(e)
    return res
      .status(400)
      .json({error: 'Patreon fetch info failed', revalidate: false})
  }
})
