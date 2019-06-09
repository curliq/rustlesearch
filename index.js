const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const {Client} = require('@elastic/elasticsearch')
const {logger, expressLogger} = require('./src/lib/logger')

const app = express()

const elasticLocation = {node: process.env.ELASTIC_LOCATION}
const client = new Client(elasticLocation)

const limiter = rateLimit({
  windowMs: 3000,
  max: 1,
})

app.use(cors())
app.use(expressLogger)
app.get('/ping', (req, res, next) => {
  res.json({msg: 'Pong'})
})

app.get('/api/search', limiter, async(req, res, next) => {
  const searchResult = await client.search({
    index: process.env.INDEX_NAME,
    body: generateESQuery(req.query),
  })

  res.json(searchResult.body.hits.hits.map(x => x['_source']))
})

app.listen(process.env.APP_PORT, () => {
  client
    .info()
    .then(() =>
      logger.info(`App listening at http://localhost:${process.env.APP_PORT}`)
    )
    .catch(err => {
      logger.crit(`Failed to connect to Elastic: ${err}`)
      process.exit(1)
    })
})

function generateESQuery({username, channel, text, startingDate, endingDate}) {
  let must = []
  if (channel) must.push({match: {channel: channel}})

  if (username) must.push({match: {username: username}})

  if (text) must.push({match: {text: {query: text, operator: 'AND'}}})

  return {
    size: 100,
    from: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              ts: {
                gte: startingDate || 'now-30d/h',
                lt: endingDate || 'now/h',
              },
            },
          },
        ],
        must: must,
      },
    },
    sort: [{ts: {order: 'desc'}}],
  }
}
