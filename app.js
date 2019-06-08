const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const {Client} = require('@elastic/elasticsearch')
const morgan = require('morgan')

const PORT = 5000
const app = express()
const client = new Client({node: 'http://localhost:9200'})

const limiter = rateLimit({
  windowMs: 3000,
  max: 1,
})

app.use(cors())
app.use(morgan(':remote-addr :method :url :status - :response-time ms'))
app.get('/ping', (req, res, next) => {
  res.json({msg: 'Pong'})
})

app.get('/api/search', limiter, async(req, res, next) => {
  const searchResult = await client.search({
    index: 'oversearch',
    body: generateESQuery(req.query),
  })

  res.json(searchResult.body.hits.hits.map(x => x['_source']))
})

app.listen(PORT, function() {
  console.log(`App listening at http://localhost:${PORT}`)
})

function generateESQuery({username, channel, text, startingDate, endingDate}) {
  let must = []
  if (channel) {
    must.push({match: {channel: channel}})
  }
  if (username) {
    must.push({match: {username: username}})
  }
  if (text) {
    must.push({match: {text: {query: text, operator: 'AND'}}})
  }

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
