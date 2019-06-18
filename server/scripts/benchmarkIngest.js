import Promise from 'bluebird'
import R from 'ramda'
import { co } from '@lib/util'
import { Client } from '@elastic/elasticsearch'
import logger from '@lib/logger'

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const averageDelta = ([x, ...xs]) => {
  if (x === undefined) return NaN
  return xs.reduce(([acc, last], x) => [acc + (x - last), x], [0, x])[0] / xs.length
}

const getCount = co(function* (timeout) {
  yield Promise.delay(timeout * 1000 * 60)
  const result = yield client.count({
    index: process.env.INDEX_NAME,
  })
  logger.info({ elapsedTime: `${timeout}m`, currentMessages: result.body.count })
  return result.body.count
})

const main = () => Promise.map(R.range(0, 10), getCount)
  .then(averageDelta)
  .then(speed => logger.info({ message: 'Benchmark Finished', speed: `${speed} / m` }))

if (require.main === module) main()
