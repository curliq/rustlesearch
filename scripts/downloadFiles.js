const fs = require('fs')
const request = require('request')
const _ = require('lodash')
const util = require('util')
const glob = require('glob')
const {subDays, format} = require('date-fns')

const rp = util.promisify(request)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const channelFileLocation = './channels.txt'
const baseUrl = 'https://overrustlelogs.net'
const basePath = './data/rustle'

function getUrlList(channels, daysBack, farthestYears) {
  const urls = []
  for (const dayBack of _.range(1, daysBack)) {
    const d = subDays(new Date(), dayBack)
    const fullFormat = format(d, 'MMMM YYYY/YYYY-MM-DD')
    const dateFormat = format(d, 'YYYY-MM-DD')
    const yearFormat = format(d, 'YYYY')
    for (const channel of channels) {
      if (parseInt(yearFormat) >= farthestYears[channel]) {
        const path = `${basePath}/${channel}::${dateFormat}.txt`
        const url = `${baseUrl}/${channel} chatlog/${fullFormat}.txt`
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
  for (const channel of channels) {
    const {body: contents} = await rp({
      uri: `${baseUrl}/api/v1/${channel}/months.json`,
      json: true,
    })
    farthestYears[channel] = parseInt(contents[contents.length - 1].slice(-4))
  }
  return farthestYears
}

async function main() {
  const channelsFile = await readFile(channelFileLocation)
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
  for (const chunk of _.chunk(urls, 20))
    await Promise.all(chunk.map(downloadFile))
}

main()
