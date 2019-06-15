const {readFileSync, writeFile} = require('fs')
const path = require('path')
const fg = require('fast-glob')
const {Client} = require('@elastic/elasticsearch')
const _ = require('lodash')
const etl = require('etl')
const {promisify} = require('util')
const {DateTime} = require('luxon')
const logger = require('@lib/logger').default
const {blacklistPath, indexCachePath, rustleDataPath} = require('./cache')
const pWriteFile = promisify(writeFile)

const blacklist = new Set(
  readFileSync(blacklistPath, {
    encoding: 'utf8',
    flag: 'a+',
  })
    .trim()
    .split('\n')
    .map(name => name.toLowerCase()),
)

const messageRegex = /^\[(.*?)\]\s(.*?):\s(.*)$/

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const lineToMessage = (line, channel) => {
  if (line.length <= 0) return
  try {
    const replacedLine = line.replace('\r', '')
    const matched = replacedLine.match(messageRegex)
    const [, tsStr, username, text] = matched
    const parsedDate = DateTime.fromSQL(tsStr)
    const ts = parsedDate.toISO()
    const seconds = parsedDate.toSeconds()

    if (!blacklist.has(username.toLowerCase())) {
      return {
        _id: `${username}-${seconds}`,
        ts,
        channel,
        username,
        text,
      }
    } else logger.debug(`${username} in blacklist, ignoring message...`)
  } catch (e) {
    logger.warn({
      error: e.message,
      channel,
      message: line,
      messageLength: line.length,
    })
  }
}

const pathsToMessages = async paths => {
  for (const filePaths of _.chunk(paths, 10)) {
    for (const filePath of filePaths) {
      const channel = path.parse(filePath).name.split('::')[0]

      await etl
        .file(filePath)
        .pipe(etl.split())
        .pipe(etl.map(line => lineToMessage(line.text, channel)))
        .pipe(etl.collect(2000))
        .pipe(
          etl.elastic.index(client, process.env.INDEX_NAME, null, {
            concurrency: 10,
          }),
        )
        .promise()
    }
    await pWriteFile(indexCachePath, filePaths.join('\n') + '\n', {
      encoding: 'utf8',
      flag: 'a+',
    })
  }
}

const main = () => {
  const allPaths = fg.sync(`${rustleDataPath}/*.txt`)
  const ingestedPaths = readFileSync(indexCachePath, {
    encoding: 'utf8',
    flag: 'a+',
  }).split('\n')
  const pathsToIngest = allPaths.filter(x => !ingestedPaths.includes(x))
  logger.info({
    totalDaysOfLogs: allPaths.length,
    totalDaysIngested: ingestedPaths.length,
    totalDaysToIngest: pathsToIngest.length,
  })

  client
    .info()
    .then(() => pathsToMessages(pathsToIngest))
    .catch(err => {
      logger.error(`Failed to connect to Elastic: ${err}`)
      process.exit(1)
    })
}

if (require.main === module) main()
