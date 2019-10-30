const {parse} = require('path')
const etl = require('etl')
const Promise = require('bluebird')
const {Client} = require('@elastic/elasticsearch')
const {parentPort, workerData} = require('worker_threads')
const {blacklistPath, indexCachePath} = require('../cache')
const {co, fs} = require('../../util')
const {blacklistLineToMessage} = require('./shared')

let SHOULD_EXIT = false

const blacklist = new Set(
  fs
    .inputFileSync(blacklistPath, 'utf8')
    .trim()
    .split('\n')
    .map(name => name.toLowerCase()),
)

const lineToMessageWithBlacklist = blacklistLineToMessage(blacklist)
const indexCacheStream = fs.createWriteStream(indexCachePath, {flags: 'a'})

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const indexPathsToMessages = co(function* indexPathsToMessages(filePath) {
  const [channel] = parse(filePath).name.split('::')

  yield etl
    .file(filePath)
    .pipe(etl.split())
    .pipe(etl.map(line => lineToMessageWithBlacklist(line, channel)))
    .pipe(etl.collect(8000))
    .pipe(
      etl.elastic.index(client, process.env.INDEX_NAME, null, {
        concurrency: 5,
        pipeline: 'rustlesearch-pipeline',
        pushErrors: true,
      }),
    )
    .promise()
    .catch(error => {
      console.error({error, message: 'Elastic error'})
      process.exit(1)
    })
  indexCacheStream.write(`${filePath}\n`)
  console.debug(`Indexed ${filePath}`)
  if (SHOULD_EXIT) {
    console.info('Exiting gracefully...')
    process.exit(0)
  }
})

const indexToElastic = async pathsToIngest => {
  await client
    .info()
    .then(() => Promise.each(pathsToIngest, indexPathsToMessages))
    .catch(error => {
      console.error('Failed to connect to Elastic:', error)
      throw error
    })
  process.exit(0)
}

parentPort.on('message', msg => {
  if (msg === 'shouldExit') SHOULD_EXIT = true
})
indexToElastic(workerData)
