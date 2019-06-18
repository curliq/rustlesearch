import search from '@lib/elastic'
import { co, fs } from '@lib/util'
import express from 'express'
import ratelimit from '@middleware/rate-limiter'
// import popupTools from 'popup-tools'

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

export default router
