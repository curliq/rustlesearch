const fs = require('fs')
const request = require('request')
const util = require('util')
const fg = require('fast-glob')
const {subDays, format} = require('date-fns')
const Promise = require('bluebird')
const R = require('ramda')

const rp = util.promisify(request)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const baseUrl = 'https://overrustlelogs.net'
const basePath = './data/rustle'

const fullDateFormat = date => format(date, 'MMMM YYYY/YYYY-MM-DD')
const fileDateFormat = date => format(date, 'YYYY-MM-DD')
const yearDateFormat = date => parseInt(format(date, 'YYYY'))

const toPathAndUrl = ({channel, fileDate, fullDate}) => {
  return [
    `${basePath}/${channel}::${fileDate}.txt`,
    `${baseUrl}/${channel} chatlog/${fullDate}.txt`,
  ]
}
const getChannelMonths = async channel => {
  const {body: contents} = await rp({
    uri: `${baseUrl}/api/v1/${channel}/months.json`,
    json: true,
  })
  return [channel, parseInt(contents[contents.length - 1].slice(-4))]
}
const getUrlList = (channels, daysBack, farthestYears) =>
  R.pipe(
    R.map(dayBack => subDays(new Date(), dayBack)),
    R.map(d =>
      [fullDateFormat, fileDateFormat, yearDateFormat].map(fn => fn(d))
    ),
    R.map(([fullDate, fileDate, yearDate]) => {
      const isValidDate = channel => yearDate >= farthestYears[channel]
      const validChannels = channels.filter(channel => isValidDate(channel))
      return validChannels.map(channel =>
        toPathAndUrl({channel, fileDate, fullDate})
      )
    }),
    R.unnest
  )(R.range(1, daysBack))

const downloadFile = async([path, url], json = false) => {
  const res = await rp({uri: url, json})
  if (res.statusCode === 200) {
    await writeFile(path, res.body)
    console.log(`Wrote ${path} to disk.`)
    return path
  } else return false
}

const getFarthestYears = async channels => {
  const farthestYears = await Promise.map(channels, getChannelMonths, {
    concurrency: 20,
  })
  return R.fromPairs(farthestYears)
}

const main = async() => {
  const channelsFile = await readFile('./channels.txt')
  const channels = channelsFile
    .toString()
    .split('\n')
    .filter(x => x !== '')

  const farthestYears = await getFarthestYears(channels)
  console.log(farthestYears)
  const allUrls = getUrlList(channels, process.argv[2] || 10, farthestYears)
  const urlsDownloaded = await fg.async(`${basePath}/*.txt`)
  const urls = allUrls.filter(x => !urlsDownloaded.includes(x[0]))

  console.log(allUrls.length, urlsDownloaded.length, urls.length)
  Promise.map(urls, downloadFile, {concurrency: 20})
}

main()
