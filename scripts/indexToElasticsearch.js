const fs = require('fs')
const path = require('path')
const glob = require('glob')
const {Client} = require('@elastic/elasticsearch')
const _ = require('lodash')
const util = require('util')
const etl = require('etl')
const {logger} = require('../src/lib/logger')

const basePath = './data/rustle'
const messageRegex = /^\[(.*?)\]\s(.*?):\s(.*)$/

const elasticLocation = {node: process.env.ELASTIC_LOCATION}
const client = new Client(elasticLocation)

const writeFile = util.promisify(fs.writeFile)

const lineToMessage = (line, channel) => {
  try {
    const replacedLine = line.replace('\r', '')
    const matched = replacedLine.match(messageRegex)
    const [, tsStr, username, text] = matched
    const ts = new Date(tsStr)
    return {
      ts: ts.toISOString(),
      channel,
      username,
      text,
    }
  } catch (e) {
    console.error(e)
  }
}

const pathsToMessages = async paths => {
  for (let filePaths of _.chunk(paths, 50)) {
    for (let filePath of filePaths) {
      const channel = path.parse(filePath).name.split('::')[0]

      await etl
        .file(filePath)
        .pipe(etl.split())
        .pipe(etl.map(line => lineToMessage(line.text, channel)))
        .pipe(etl.collect(2000))
        .pipe(
          etl.elastic.index(client, 'oversearch', 'message', {
            concurrency: 10,
          })
        )
        .promise()
    }
    await writeFile('./cache.txt', filePaths.join('\n') + '\n', {
      encoding: 'utf8',
      flag: 'a',
    })
  }
}

const allPaths = glob.sync(`${basePath}/*.txt`)
const cache = fs.readFileSync('./cache.txt', {encoding: 'utf8'}).split('\n')
const paths = allPaths.filter(x => !cache.includes(x))
client
  .info()
  .then(() => pathsToMessages(paths))
  .catch(err => {
    logger.crit(`Failed to connect to Elastic: ${err}`)
    process.exit(1)
  })
