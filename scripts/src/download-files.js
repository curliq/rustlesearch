const request = require('superagent')
const {DateTime} = require('luxon')
const Promise = require('bluebird')
const {inc, map, pipe, range, unnest, reject, isNil, last} = require('ramda')
const {getFileByLine, fs} = require('../util')
const {
  channelsListPath,
  downloadCachePath,
  rustlePath,
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
      `${rustlePath}/${channel}::${fileDateFormat(date)}.txt`,
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

const downloadFile = async ([path, uri]) => {
  try {
    const {text: res} = await request.get(uri)
    await fs.outputFile(path, res)
    console.info(`Wrote ${path} to disk.`)
  } catch {
    await fs.outputFile(downloadCachePath, `${path}\n`, {flag: 'a'})
    console.info(`${path} 404, wrote file to download cache.`)
  }
}

const cachedGet = async (path, uri) => {
  // eslint-disable-next-line no-sync
  const pathExists = await fs.pathExists(path)

  if (!pathExists) {
    try {
      const {text: res} = await request.get(uri)
      await fs.outputFile(path, res)
      console.debug(`Wrote ${path} to disk.`)
    } catch (error) {
      console.warn(error)

      return null
    }
  }

  return fs.inputFile(path, 'utf8')
}

const getChannelStartDate = async channel => {
  const months = await cachedGet(
    `${monthsPath}/${channel}.json`,
    `${baseUrl}/api/v1/${channel}/months.json`,
  )

  return {channel, startDate: dateFromMonths(JSON.parse(months))}
}

const downloadFiles = async (channels, daysBack) => {
  const processedChannels = await Promise.map(channels, getChannelStartDate, {
    concurrency: 20,
  })

  const totalUrls = getUrlList(processedChannels, daysBack)
  const discardCache = await getFileByLine(discardCachePath, {set: true})
  const downloadCache = await getFileByLine(downloadCachePath, {set: true})
  const downloadedLogFiles = await fs.readdirSafe(rustlePath)

  const downloadedLogs = new Set(
    downloadedLogFiles.map(file => `${rustlePath}/${file}`),
  )

  const urlsToDownload = totalUrls.filter(
    url =>
      !(
        downloadedLogs.has(url[0]) ||
        downloadCache.has(url[0]) ||
        discardCache.has(url[0])
      ),
  )

  console.info(`
  Beginning download.
  Total days to download: ${totalUrls.length}
  Days already downloaded: ${downloadedLogs.size || 0}
  Days to download right now: ${urlsToDownload.length}`)

  await Promise.map(urlsToDownload, downloadFile, {concurrency: 20})
}

const main = async () => {
  const channels = await getFileByLine(channelsListPath)
  const daysBack = parseInt(process.argv[2] || 10)
  downloadFiles(channels, daysBack)
}
if (require.main === module) main()

module.exports = {
  downloadFiles,
}
