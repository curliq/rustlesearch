const fs = require('fs')
const path = require('path')
const glob = require('glob')
const {Client} = require('@elastic/elasticsearch')
const _ = require('lodash')
const util = require('util')
const etl = require('etl')
const logger = require('@lib/logger')

const basePath = './data/rustle'
const messageRegex = /^\[(.*?)\]\s(.*?):\s(.*)$/

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const writeFile = util.promisify(fs.writeFile)

const lineToMessage = (line, channel) => {
  if (line.length <= 0) return
  try {
    const replacedLine = line.replace('\r', '')
    const matched = replacedLine.match(messageRegex)
    const [, tsStr, username, text] = matched
    const ts = new Date(tsStr).toISOString()
    return {
      ts,
      channel,
      username,
      text,
    }
  } catch (e) {
    logger.warn(
      `Error: ${e.message}. ${channel}, ${line}, ${line.length}`,
    )
  }
}

const pathsToMessages = async paths => {
  for (let filePaths of _.chunk(paths, 10)) {
    for (let filePath of filePaths) {
      const channel = path
        .parse(filePath)
        .name.split('::')[0]

      await etl
        .file(filePath)
        .pipe(etl.split())
        .pipe(
          etl.map(line =>
            lineToMessage(line.text, channel),
          ),
        )
        .pipe(etl.collect(2000))
        .pipe(
          etl.elastic.index(
            client,
            process.env.INDEX_NAME,
            'message',
            {
              concurrency: 10,
            },
          ),
        )
        .promise()
    }
    await writeFile(
      './cache.txt',
      filePaths.join('\n') + '\n',
      {
        encoding: 'utf8',
        flag: 'a',
      },
    )
  }
}

const allPaths = glob.sync(`${basePath}/*.txt`)
const cache = fs
  .readFileSync('./cache.txt', {
    encoding: 'utf8',
    flag: 'a+',
  })
  .split('\n')
const paths = allPaths.filter(x => !cache.includes(x))
console.log(allPaths.length, cache.length, paths.length)
client
  .info()
  .then(() => pathsToMessages(paths))
  .catch(err => {
    logger.error(`Failed to connect to Elastic: ${err}`)
    process.exit(1)
  })
