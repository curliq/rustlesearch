const {Client} = require('@elastic/elasticsearch')
const Promise = require('bluebird')
const R = require('ramda')
const {co} = require('@lib/util')
const logger = require('@lib/logger')

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const averageDelta = ([x, ...xs]) => {
  if (x === undefined) return NaN
  else {
    return (
      xs.reduce(([acc, last], x) => [acc + (x - last), x], [0, x])[0]
      / xs.length
    )
  }
}

const getCount = co(function* (timeout) {
  yield Promise.delay(timeout * 1000 * 60)
  const result = yield client.count({
    index: process.env.INDEX_NAME,
  })
  console.log(timeout, result.body.count)
  return result.body.count
})

const main = () =>
  Promise.map(R.range(0, 10), getCount)
    .then(averageDelta)
    .then(speed => logger.info({message: 'Benchmark Finished', speed}))

if (require.main === module) main()
