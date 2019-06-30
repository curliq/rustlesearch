const {readFileSync, promises: fs} = require('fs')
const {parse} = require('path')
const etl = require('etl')
const Promise = require('bluebird')
const {DateTime} = require('luxon')
const {Client} = require('@elastic/elasticsearch')
const {capitalise, co} = require('../api/lib/util')
const logger = require('../api/lib/logger')
const config = require('../api/lib/config')
const {blacklistPath, indexCachePath, rustleDataPath} = require('./cache')
const {performance} = require('perf_hooks')

let SHOULD_EXIT = false

const blacklist = new Set(
  readFileSync(blacklistPath, {
    encoding: 'utf8',
    flag: 'a+',
  })
    .trim()
    .split('\n')
    .map(name => name.toLowerCase()),
)

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
    logger.debug({channel, line, message: 'Cannot be parsed'})

    // eslint-disable-next-line no-undefined
    return undefined
  }

  const {tsStr, username, text} = matched.groups
  const parsedDate = DateTime.fromSQL(tsStr)
  const ts = parsedDate.toISO()

  if (blacklist.has(username.toLowerCase())) {
    logger.debug(`${username} in blacklist, ignoring message...`)

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
  node: config.ELASTIC_LOCATION,
})

const indexPathsToMessages = co(function* indexPathsToMessages(filePath) {
  const startTime = performance.now()
  const [channel] = parse(filePath).name.split('::')

  yield etl
    .file(filePath)
    .pipe(etl.split())
    .pipe(etl.map(line => lineToMessage(line, channel)))
    .pipe(etl.collect(2000))
    .pipe(
      etl.elastic.index(client, config.INDEX_NAME, null, {
        concurrency: 10,
      }),
    )
    .promise()
    .catch(error => logger.error({error, message: 'Elastic error'}))

  yield fs.writeFile(indexCachePath, `${filePath}\n`, {
    encoding: 'utf8',
    flag: 'a+',
  })
  logger.debug(`Indexed ${filePath} in ${performance.now() - startTime}`)
  if (SHOULD_EXIT) {
    logger.info('Exiting gracefully...')
    process.exit(0)
  }
})

const main = async () => {
  const allPathsNames = await fs.readdir(rustleDataPath)
  const allPaths = allPathsNames.map(file => `${rustleDataPath}/${file}`)

  const ingestedPaths = await fs.readFile(indexCachePath, {
    encoding: 'utf8',
    flag: 'a+',
  })

  const ingestedPathList = ingestedPaths.split('\n')

  const pathsToIngest = allPaths.filter(
    file => !ingestedPathList.includes(file),
  )

  logger.info({
    totalDaysIngested: ingestedPathList.length,
    totalDaysOfLogs: allPaths.length,
    totalDaysToIngest: pathsToIngest.length,
  })

  client
    .info()
    .then(() => Promise.each(pathsToIngest, indexPathsToMessages))
    .catch(error => {
      logger.error(`Failed to connect to Elastic: ${error}`)
      throw error
    })
}

process.on('SIGINT', () => {
  console.log('SIGINT received, starting graceful shutdown.')
  SHOULD_EXIT = true
})

if (require.main === module) main()
