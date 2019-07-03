const {promises: fs} = require('fs')
const request = require('superagent')
const {DateTime} = require('luxon')
const Promise = require('bluebird')
const {inc, map, pipe, range, unnest} = require('ramda')
const logger = require('../api/lib/logger')
const {
  channelFilePath,
  downloadCachePath,
  rustleDataPath,
  discardCachePath,
} = require('./cache')

// "Constants"
const baseUrl = 'https://overrustlelogs.net'
const today = DateTime.utc()
// smol Functions
const fullDateFormat = date => date.toFormat('MMMM yyyy/yyyy-MM-dd')
const fileDateFormat = date => date.toFormat('yyyy-MM-dd')

const toPathAndUrl = ({channel, date}) => [
  `${rustleDataPath}/${channel}::${fileDateFormat(date)}.txt`,
  `${baseUrl}/${channel} chatlog/${fullDateFormat(date)}.txt`,
]

// swol Functions
const getUrlList = (channels, daysBack) =>
  pipe(
    inc,
    range(1),
    map(day => today.minus({days: day})),
    map(date => channels.map(channel => toPathAndUrl({channel, date}))),
    unnest,
  )(daysBack)

const downloadFile = async ([path, uri]) => {
  try {
    const {text: res} = await request.get(uri)
    await fs.writeFile(path, res)
    logger.info(`Wrote ${path} to disk.`)
  } catch {
    await fs.writeFile(downloadCachePath, `${path}\n`, {
      encoding: 'utf8',
      flag: 'a+',
    })
    logger.info(`${path} 404, wrote file to download cache.`)
  }
}

const main = async () => {
  const channelsFile = await fs.readFile(channelFilePath, {
    encoding: 'utf8',
    flag: 'a+',
  })

  const channels = channelsFile.trim().split('\n')

  const downloadCacheFile = await fs.readFile(downloadCachePath, {
    encoding: 'utf8',
    flag: 'a+',
  })

  const discardCacheFile = await fs.readFile(discardCachePath, {
    encoding: 'utf8',
    flag: 'a+',
  })

  const discardCache = new Set(discardCacheFile.trim().split('\n'))
  const downloadCache = new Set(downloadCacheFile.trim().split('\n'))
  const totalUrls = getUrlList(channels, parseInt(process.argv[2]) || 10)
  const downloadedUrlFiles = await fs.readdir(rustleDataPath)

  const downloadedUrls = new Set(
    downloadedUrlFiles.map(file => `${rustleDataPath}/${file}`),
  )

  const urlsToDownload = totalUrls.filter(
    url =>
      !(
        downloadedUrls.has(url[0]) ||
        downloadCache.has(url[0]) ||
        discardCache.has(url[0])
      ),
  )

  logger.info(`
  Beginning download.
  Total days to download: ${totalUrls.length}
  Days already downloaded: ${downloadedUrls.length}
  Days to download right now: ${urlsToDownload.length}`)

  Promise.map(urlsToDownload, downloadFile, {concurrency: 20})
}

if (require.main === module) main()
