import {Client} from '@elastic/elasticsearch'
import {DateTime} from 'luxon'
const elasticLocation = {node: process.env.ELASTIC_LOCATION}
const capitalize = string => {
  return string[0].toUpperCase() + string.slice(1).toLowerCase()
}
export const elasticClient = new Client(elasticLocation)

export const generateElasticQuery = ({
  username,
  channel,
  text,
  startingDate,
  endingDate,
}) => {
  const defaultStartingDate = DateTime.utc()
    .minus({days: 30})
    .toFormat('X')
  const defaultEndingDate = DateTime.utc().toFormat('X')
  const filter = []
  const must = []

  if (channel) filter.push({term: {channel: capitalize(channel)}})
  if (username) filter.push({term: {username: username.toLowerCase()}})
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
                gte: startingDate || defaultStartingDate,
                lte: endingDate || defaultEndingDate,
                format: 'epoch_second',
              },
            },
          },
          ...filter,
        ],
        must: must,
      },
    },
    sort: [{ts: {order: 'desc'}}],
  }
}
