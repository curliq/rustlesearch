import {Client} from '@elastic/elasticsearch'
import {DateTime} from 'luxon'
const elasticLocation = {node: process.env.ELASTIC_LOCATION}

export const elasticClient = new Client(elasticLocation)

export const generateElasticQuery = ({
  username,
  channel,
  text,
  startingDate,
  endingDate,
}) => {
  const must = []
  if (channel) {
    must.push({
      match: {channel: {query: channel, operator: 'And'}},
    })
  }

  if (username) {
    must.push({
      match: {username: {query: username, operator: 'AND'}},
    })
  }

  if (text) {
    must.push({
      match: {text: {query: text, operator: 'AND'}},
    })
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
                gte:
                  startingDate
                  || DateTime.utc()
                    .minus({days: 30})
                    .toFormat('X'),
                lt: endingDate || DateTime.utc().toFormat('X'),
                format: 'epoch_second',
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
