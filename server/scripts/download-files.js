const {existsSync, promises: fs} = require('fs')
const request = require('superagent')
const {DateTime} = require('luxon')
const Promise = require('bluebird')
const {inc, map, pipe, range, unnest, reject, isNil, last} = require('ramda')
const logger = require('../api/lib/logger')
const {
  channelFilePath,
  downloadCachePath,
  rustleDataPath,
  discardCachePath,
  monthsPath,
} = require('./cache')

// "Constants"
const baseUrl = 'https://overrustlelogs.net'
const today = DateTime.utc()
// smol Functions
const fullDateFormat = date => date.toFormat('MMMM yyyy/yyyy-MM-dd')
const fileDateFormat = date => date.toFormat('yyyy-MM-dd')
const dateFromMonths = months => DateTime.fromFormat(last(months), 'LLLL yyyy')

const toPathAndUrl = ({channel: {channel, startDate}, date}) => {
  if (startDate < date) {
    return [
      `${rustleDataPath}/${channel}::${fileDateFormat(date)}.txt`,
      `${baseUrl}/${channel} chatlog/${fullDateFormat(date)}.txt`,
    ]
  }

  return null
}

// swol Functions
const getUrlList = (channels, daysBack) =>
  pipe(
    inc,
    range(1),
    map(day => today.minus({days: day})),
    map(date => channels.map(channel => toPathAndUrl({channel, date}))),
    unnest,
    reject(isNil),
  )(daysBack)

const listFromPath = async (filePath, isSet = false) => {
  const file = await fs.readFile(filePath, {
    encoding: 'utf8',
    flag: 'a+',
  })

  const arr = file.trim().split('\n')
  if (isSet) return new Set(arr)

  return arr
}

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

const cachedGet = async (path, uri) => {
  // eslint-disable-next-line no-sync
  if (!existsSync(path)) {
    try {
      const {text: res} = await request.get(uri)
      await fs.writeFile(path, res)
      logger.debug(`Wrote ${path} to disk.`)
    } catch (error) {
      logger.warn(error)

      return null
    }
  }

  return fs.readFile(path, {encoding: 'utf8'})
}

const getChannelStart = async channel => {
  const months = await cachedGet(
    `${monthsPath}/${channel}.json`,
    `${baseUrl}/api/v1/${channel}/months.json`,
  )

  return {channel, startDate: dateFromMonths(JSON.parse(months))}
}

const main = async () => {
  const channels = await listFromPath(channelFilePath)

  const processedChannels = await Promise.map(channels, getChannelStart, {
    concurrency: 20,
  })

  const totalUrls = getUrlList(
    processedChannels,
    parseInt(process.argv[2]) || 10,
  )

  const discardCache = await listFromPath(discardCachePath, true)
  const downloadCache = await listFromPath(downloadCachePath, true)
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
