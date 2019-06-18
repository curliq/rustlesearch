import search from '@lib/elastic'
import { co, fs } from '@lib/util'
import express from 'express'
import ratelimit from '@middleware/rate-limiter'
// import popupTools from 'popup-tools'
import { toJwt } from '@lib/auth'
import jwtToPatreonMiddleware from '@middleware/jwt-patreon'

const router = express.Router()

router.get('/healthcheck', (req, res) => res.json({ status: 'ALIVE' }))

router.get(
  '/search',
  ratelimit,
  co(function* (req, res) {
    if (!req.query.username && !req.query.channel && !req.query.text) {
      return res.status(422).json({ error: 'Fill at least one parameter' })
    }

    const { logs, statusCode } = yield search(req.query)
    res.status(statusCode)
    return res.json(logs)
  }),
)

router.get(
  '/channels',
  co(function* (req, res) {
    const channelsFile = yield fs.readFileAsync('./channels.txt', 'utf8')
    const channels = channelsFile.trim().split('\n')
    res.json(channels)
  }),
)

router.get('/callback/patreon', (req, res) => {
  const resp = req.session.grant.response
  if (!resp.access_token) return res.json({ error: 'Authentication failed' })
  return res.json({ jwt: toJwt(resp.access_token) })
  // res.end(popupTools.popupResponse(profile))
})
router.post(
  '/auth/validate/patreon',
  jwtToPatreonMiddleware,
  async (req, res) => res.json(req.patreon?.included?.[0]?.attributes),
)
export default router
