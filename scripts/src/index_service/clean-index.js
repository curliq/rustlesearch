/* eslint-disable func-names */
const {parse} = require('path')
const {Promise} = require('bluebird')
const readLastLines = require('read-last-lines')
const etl = require('etl')
const {Client} = require('@elastic/elasticsearch')
const {lineToMessage} = require('./shared')
const {fs} = require('../../util')
const config = require('../config')

const client = new Client({node: config.elastic.url})

function parseISOToIndexMonth(date) {
  const yyyy = date.slice(0, 4)
  const MM = date.slice(5, 7)

  return `${yyyy}-${MM}-01`
}

const pathToCacheMaybe = indexCacheStream => async paths => {
  await etl
    .toStream(paths)
    .pipe(
      etl.map(async function(path) {
        const [channel] = parse(path).name.split('::')

        try {
          const line = await readLastLines.read(path, 1)

          this.push({channel, line, path})
        } catch (e) {
          console.log('Error: ', e)
        }
      }),
    )
    .pipe(
      etl.map(({channel, line, path}) => {
        const message = lineToMessage({text: line}, channel)

        if (message) {
          return {
            message,
            path,
          }
        }
        console.log(path)

        return undefined
      }),
    )
    .pipe(
      etl.map(async function({message, path}) {
        const exists = await client.exists({
          id: `${message.channel}-${message.username}-${message.ts}`,
          index: `${config.elastic.index}-${parseISOToIndexMonth(message.ts)}`,
        })

        if (exists.body) {
          this.push(path)
        }
      }),
    )
    .pipe(etl.map(path => indexCacheStream.write(`${path}\n`)))
    .promise()
    .catch(error => {
      console.error({error})
      process.exit(1)
    })
}

module.exports = async () => {
  const allPathsNames = await fs.readdirSafe(config.paths.orl)
  const allPaths = allPathsNames.map(file => `${config.paths.orl}/${file}`)
  await fs.remove(config.paths.indexCache)
  await fs.ensureFile(config.paths.indexCache)
  const indexCacheStream = fs.createWriteStream(config.paths.indexCache, {
    flags: 'a',
  })
  Promise.each(allPaths, pathToCacheMaybe(indexCacheStream))
}
