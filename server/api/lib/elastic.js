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
  if (channel) must.push({match: {channel: channel}})

  if (username) must.push({match: {username: username}})

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
              date: {
                gte:
                  startingDate
                  || DateTime.utc()
                    .minus({days: 30})
                    .toSeconds(),
                lt: endingDate || DateTime.utc().toSeconds(),
                format: 'epoch_seconds',
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
