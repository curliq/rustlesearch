const fs = require('fs')
const request = require('request')
const _ = require('lodash')
const util = require('util')
const glob = require('glob')
const {subDays, format} = require('date-fns')

const rp = util.promisify(request)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const baseUrl = 'https://overrustlelogs.net'
const basePath = './data/rustle'

function getUrlList(channels, daysBack, farthestYears) {
  let urls = []
  for (let dayBack of _.range(1, daysBack)) {
    let d = subDays(new Date(), dayBack)
    let fullFormat = format(d, 'MMMM YYYY/YYYY-MM-DD')
    let dateFormat = format(d, 'YYYY-MM-DD')
    let yearFormat = format(d, 'YYYY')
    for (let channel of channels) {
      if (parseInt(yearFormat) >= farthestYears[channel]) {
        let path = `${basePath}/${channel}::${dateFormat}.txt`
        let url = `${baseUrl}/${channel} chatlog/${fullFormat}.txt`
        urls.push([path, url])
      }
    }
  }
  return urls
}
async function downloadFile([path, url], json = false) {
  const res = await rp({uri: url, json})
  if (res.statusCode === 200) {
    await writeFile(path, res.body)
    console.log(`Wrote ${path} to disk.`)
    return path
  } else return false
}
async function getFarthestYears(channels) {
  const farthestYears = {}
  for (let channel of channels) {
    let {body: contents} = await rp({
      uri: `${baseUrl}/api/v1/${channel}/months.json`,
      json: true,
    })
    farthestYears[channel] = parseInt(contents[contents.length - 1].slice(-4))
  }
  return farthestYears
}

async function main() {
  const channelsFile = await readFile('./channels.txt')
  const channels = channelsFile
    .toString()
    .split('\n')
    .filter(x => x !== '')
  console.log(channels)

  const farthestYears = await getFarthestYears(channels)
  console.log(farthestYears)

  const allUrls = getUrlList(channels, process.argv[2] || 10, farthestYears)
  const urlsDownloaded = glob.sync(`${basePath}/*.txt`)
  const urls = allUrls.filter(x => !urlsDownloaded.includes(x[0]))

  console.log(allUrls.length, urlsDownloaded.length, urls.length)
  for (let chunk of _.chunk(urls, 20)) {
    await Promise.all(chunk.map(downloadFile))
  }
}

main()
