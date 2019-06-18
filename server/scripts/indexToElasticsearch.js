import { readFileSync, writeFile } from 'fs'
import path from 'path'
import fg from 'fg'
import { Client } from '@elastic/elasticsearch'
import _ from 'lodash'
import etl from 'etl'
import { promisify } from 'util'
import { DateTime } from 'luxon'
import logger from '@lib/logger'
import { blacklistPath, indexCachePath, rustleDataPath } from './cache'

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
  if (line.length <= 0) return undefined
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
    }
    logger.debug(`${username} in blacklist, ignoring message...`)
    return undefined
  } catch (e) {
    logger.warn({
      error: e.message,
      channel,
      message: line,
      messageLength: line.length,
    })
    return undefined
  }
}

const pathsToMessages = async (paths) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const filePaths of _.chunk(paths, 10)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const filePath of filePaths) {
      const channel = path.parse(filePath).name.split('::')[0]

      // eslint-disable-next-line no-await-in-loop
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
    // eslint-disable-next-line no-await-in-loop
    await pWriteFile(indexCachePath, `${filePaths.join('\n')}\n`, {
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
    .catch((err) => {
      logger.error(`Failed to connect to Elastic: ${err}`)
      process.exit(1)
    })
}

if (require.main === module) main()
