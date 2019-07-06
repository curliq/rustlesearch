const Promise = require('bluebird')
const {range, append} = require('ramda')
const {Client} = require('@elastic/elasticsearch')
const {co} = require('../util')

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const averageDelta = timeseries => {
  if (timeseries.length < 2) return 0
  const changes = timeseries.length - 1
  const [start] = timeseries
  const end = timeseries[changes]

  return parseInt((end - start) / changes)
}

const getCount = co(function* getCount(total, timeout) {
  const result = yield client.count({
    index: process.env.INDEX_NAME,
  })

  const newTotal = append(result.body.count, total)

  console.info({
    avg: averageDelta(newTotal).toLocaleString('en-US'),
    count: result.body.count.toLocaleString('en-US'),
    time: `${timeout}m`,
  })

  yield Promise.delay(1000 * 60)

  return newTotal
})

const main = () => {
  console.log(process.argv[2])
  const minutesRange = range(0, parseInt(process.argv[2]) || 10)

  return Promise.reduce(minutesRange, getCount, [])

    .then(averageDelta)
    .then(speed =>
      console.info({
        message: 'Benchmark Finished',
        speed: `${speed} / m`,
      }),
    )
}
if (require.main === module) main()
