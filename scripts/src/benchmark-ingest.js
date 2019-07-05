const Promise = require('bluebird')
const {range} = require('ramda')
const {Client} = require('@elastic/elasticsearch')
const {co} = require('../util')

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const averageDelta = timeseries => {
  const changes = timeseries.length - 1
  const [start] = timeseries
  const end = timeseries[changes]

  return parseInt((end - start) / changes)
}

const getCount = co(function* getCount(timeout) {
  yield Promise.delay(timeout * 1000 * 60)

  const result = yield client.count({
    index: process.env.INDEX_NAME,
  })

  console.info({
    currentMessages: result.body.count,
    elapsedTime: `${timeout}m`,
    formatted: result.body.count.toLocaleString('en-US'),
  })

  return result.body.count
})

const main = () => {
  console.log(process.argv[2])

  return Promise.map(
    range(0, process.argv[2] ? parseInt(process.argv[2]) : 10),
    getCount,
  )

    .then(averageDelta)
    .then(speed =>
      console.info({
        message: 'Benchmark Finished',
        speed: `${speed} / m`,
      }),
    )
}
if (require.main === module) main()
