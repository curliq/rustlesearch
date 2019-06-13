const {readFileSync, writeFile} = require('fs')
const path = require('path')
const glob = require('glob')
const {Client} = require('@elastic/elasticsearch')
const _ = require('lodash')
const etl = require('etl')
const {promisify} = require('util')
const logger = require('@lib/logger').default
const {blacklistPath, indexCachePath, rustleDataPath} = require('./cache')

const pWriteFile = promisify(writeFile)

const blacklist = new Set(
  readFileSync(blacklistPath, {
    encoding: 'utf8',
    flag: 'a+',
  })
    .split('\n')
    .filter(name => name !== '')
    .map(name => name.toLowerCase()),
)

const messageRegex = /^\[(.*?)\]\s(.*?):\s(.*)$/

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

// const blacklist =

const lineToMessage = (line, channel) => {
  if (line.length <= 0) return
  try {
    const replacedLine = line.replace('\r', '')
    const matched = replacedLine.match(messageRegex)
    const [, tsStr, username, text] = matched
    const ts = Math.floor(new Date(tsStr) / 1000)
    if (!blacklist.has(username.toLowerCase())) {
      return {
        _id: `${username}-${ts}`,
        ts,
        channel,
        username,
        text,
      }
    } else logger.debug(`${username} in blacklist, ignoring message...`)
  } catch (e) {
    logger.warn(`Error: ${e.message}. ${channel}, ${line}, ${line.length}`)
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
          etl.elastic.index(client, process.env.INDEX_NAME, 'message', {
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

const allPaths = glob.sync(`${rustleDataPath}/*.txt`)
const ingestedPaths = readFileSync(indexCachePath, {
  encoding: 'utf8',
  flag: 'a+',
}).split('\n')
const pathsToIngest = allPaths.filter(x => !ingestedPaths.includes(x))
logger.info(`
  Number of days: ${allPaths.length}
  Days ingested: ${ingestedPaths.length}
  Days to ingest: ${pathsToIngest.length}
  `)
client
  .info()
  .then(() => pathsToMessages(pathsToIngest))
  .catch(err => {
    logger.error(`Failed to connect to Elastic: ${err}`)
    process.exit(1)
  })
