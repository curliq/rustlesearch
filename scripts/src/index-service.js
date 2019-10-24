/* eslint-disable node/no-unsupported-features/node-builtins */
const {parse} = require('path')
const etl = require('etl')
const Promise = require('bluebird')
const {Client} = require('@elastic/elasticsearch')
const {blacklistPath, indexCachePath} = require('./cache')
const {co, capitalise, fs} = require('../util')
// eslint-disable-next-line node/no-missing-require
const {parentPort, workerData} = require('worker_threads')

let SHOULD_EXIT = false

const blacklist = new Set(
  fs
    .inputFileSync(blacklistPath, 'utf8')
    .trim()
    .split('\n')
    .map(name => name.toLowerCase()),
)

const indexCacheStream = fs.createWriteStream(indexCachePath, {flags: 'a'})

function parseDateToISO(date) {
  const yyyy = date.slice(0, 4)
  const MM = date.slice(5, 7)
  const dd = date.slice(8, 10)
  const hh = date.slice(11, 13)
  const mm = date.slice(14, 16)
  const ss = date.slice(17, 19)

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.000Z`
}

const timestampRegex = '\\[(?<tsStr>.{23})\\]'
const usernameRegex = '(?<username>[a-z0-9_\\$]{3,25})'
const textRegex = '(?<text>.{1,512})'

const messageRegex = new RegExp(
  ['^', timestampRegex, '\\s', usernameRegex, ':\\s', textRegex].join(''),
  'iu',
)

const lineToMessage = (line, channel) => {
  // eslint-disable-next-line no-undefined
  if (line.text.length === 0) return undefined
  const replacedLine = line.text.replace('\r', '')
  const matched = replacedLine.match(messageRegex)

  // we cant parse that message yet
  if (!matched) {
    console.debug({channel, line, message: 'Cannot be parsed'})

    // eslint-disable-next-line no-undefined
    return undefined
  }

  const {tsStr, username, text} = matched.groups
  const ts = parseDateToISO(tsStr)

  if (blacklist.has(username.toLowerCase())) {
    console.debug(`${username} in blacklist, ignoring message...`)

    // eslint-disable-next-line no-undefined
    return undefined
  }

  return {
    channel: capitalise(channel),
    text,
    ts,
    username: username.toLowerCase(),
  }
}

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const indexPathsToMessages = co(function* indexPathsToMessages(filePath) {
  const [channel] = parse(filePath).name.split('::')

  yield etl
    .file(filePath)
    .pipe(etl.split())
    .pipe(etl.map(line => lineToMessage(line, channel)))
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
