const express = require('express')
const search = require('../lib/elastic')
const {co} = require('../lib/util')
const ratelimit = require('../middleware/rate-limiter')
const channels = require('../lib/channels')

const router = express.Router()

router.get('/healthcheck', (req, res) => res.json({status: 'ALIVE'}))

router.get(
  '/search',
  ratelimit,
  co(function* searchLogs(req, res) {
    if (!req.query.username && !req.query.channel && !req.query.text)
      return res.status(422).json({error: 'Fill at least one parameter'})

    const {logs, statusCode} = yield search(req.query)
    res.status(statusCode)

    return res.json(logs)
  }),
)

router.get('/channels', (req, res) => {
  res.json({channels})
})

module.exports = router
