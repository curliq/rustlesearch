const fs = require('fs')
const path = require('path')
const glob = require('glob')
const { Client } = require('@elastic/elasticsearch')
const _ = require('lodash')
const util = require('util')
const etl = require('etl')

const base_path = './data/rustle'
const message_regex = /^\[(.*?)\]\s(.*?):\s(.*)$/
const client = new Client({ node: 'http://localhost:9200' })
const writeFile = util.promisify(fs.writeFile)

const lineToMessage = (line, channel) => {
  try {
    const replaced_line = line.replace('\r', '')
    const matched = replaced_line.match(message_regex)
    const [__, ts_str, username, text] = matched
    const ts = new Date(ts_str)
    return {
      ts: ts.toISOString(),
      channel,
      username,
      text
    }
  } catch (e) {
    // console.log(e)
  }
}
const paths_to_messages = async paths => {
  for (let file_paths of _.chunk(paths.slice(0, 50), 50)) {
    for (let file_path of file_paths) {
      const channel = path.parse(file_path).name.split('::')[0]

      await etl
        .file(file_path)
        .pipe(etl.split())
        .pipe(etl.map(line => lineToMessage(line.text, channel)))
        .pipe(etl.collect(2000))
        .pipe(
          etl.elastic.index(client, 'oversearch', 'message', {
            concurrency: 10
          })
        )
        .promise()
    }
    await writeFile('./cache.txt', file_paths.join('\n') + '\n', {
      encoding: 'utf8',
      flag: 'a'
    })
  }
}

const all_paths = glob.sync(`${base_path}/*.txt`)
const cache = fs.readFileSync('./cache.txt', { encoding: 'utf8' }).split('\n')
const paths = all_paths.filter(x => !cache.includes(x))
paths_to_messages(paths)
// paths_to_messages(paths)
