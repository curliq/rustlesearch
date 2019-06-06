const fs = require('fs')
const path = require('path')
const glob = require('glob')
const { Client } = require('@elastic/elasticsearch')
const _ = require('lodash')
const base_path = './data/rustle'
const message_regex = /^\[(.*?)\]\s(.*?):\s(.*)$/
const client = new Client({ node: 'http://localhost:9200' })

let success_count = 0
let count = 0

const messages_to_bulk_array = messages => {
  return messages
    .map(message => {
      return [
        {
          index: {
            _index: 'oversearch',
            _id: message.username + message.ts
          }
        },
        message
      ]
    })
    .flat()
}
const contents_to_messages = (contents, channel) => {
  let messages = []
  for (line of contents) {
    try {
      const replaced_line = line.replace('\r', '')
      const matched = replaced_line.match(message_regex)
      const [__, ts_str, username, text] = matched
      const ts = new Date(ts_str)
      messages.push({
        ts: ts.toISOString(),
        channel,
        username,
        text
      })
      success_count += 1
    } catch (e) {
      // console.log(e)
      count += 1
    }
  }
  return messages
}
const bulk_to_es = async messages => {
  for (let mchunk of _.chunk(messages, 4000)) {
    const formatted_messages = messages_to_bulk_array(mchunk)

    const { body: bulkResponses } = await client.bulk({
      body: formatted_messages
    })
    if (bulkResponses.errors) {
      console.log(bulkResponses)
    }
  }
}
const paths_to_messages = async paths => {
  for (let file_path of paths) {
    const contents = fs
      .readFileSync(file_path, { encoding: 'utf8' })
      .split('\n')
    const channel = path.parse(file_path).name.split('::')[0]
    const messages = contents_to_messages(contents, channel)
    await bulk_to_es(messages)
  }
}

const all_paths = glob.sync(`${base_path}/*.txt`)
console.log(all_paths.length)
const cache = fs.readFileSync('./cache.txt', { encoding: 'utf8' }).split('\n')
console.log(cache.length)
const paths = all_paths.filter(x => !cache.includes(x))
console.log(paths.length)
paths_to_messages(paths)
console.log(`${count} / ${count + success_count}`)
