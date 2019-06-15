const rp = require('request-promise')
const fg = require('fast-glob')
const {DateTime} = require('luxon')
const Promise = require('bluebird')
const R = require('ramda')
const logger = require('@lib/logger').default
const {rustleDataPath, downloadCachePath, channelFilePath} = require('./cache')
const {fs} = require('@lib/util')

// "Constants"
const baseUrl = 'https://overrustlelogs.net'
const today = DateTime.utc()

// Smol Functions
const notEq = R.complement(R.equals)
const fullDateFormat = date => date.toFormat('MMMM yyyy/yyyy-MM-dd')
const fileDateFormat = date => date.toFormat('yyyy-MM-dd')

const parseByLine = R.pipe(
  R.split('\n'),
  R.filter(notEq('')),
)

const toPathAndUrl = ({channel, date}) => [
  `${rustleDataPath}/${channel}::${fileDateFormat(date)}.txt`,
  `${baseUrl}/${channel} chatlog/${fullDateFormat(date)}.txt`,
]

// Swol Functions
const getUrlList = (channels, daysBack) =>
  R.pipe(
    R.inc,
    R.range(1),
    R.map(day => today.minus({days: day})),
    R.map(date => channels.map(channel => toPathAndUrl({channel, date}))),
    R.unnest,
  )(daysBack)

const downloadFile = async([path, uri]) => {
  try {
    const res = await rp({uri})
    await fs.writeFileAsync(path, res.body)
    logger.info(`Wrote ${path} to disk.`)
  } catch {
    await fs.writeFileAsync(downloadCachePath, path + '\n', {
      encoding: 'utf8',
      flag: 'a+',
    })
    logger.info(`${path} 404, wrote file to download cache.`)
  }
}

const main = async() => {
  const channelsFile = await fs.readFileAsync(channelFilePath, {
    flag: 'a+',
  })
  const channels = parseByLine(channelsFile.toString())

  const downloadCacheFile = await fs.readFileAsync(downloadCachePath, {
    flag: 'a+',
  })
  const downloadCache = parseByLine(downloadCacheFile.toString())

  const totalUrls = getUrlList(channels, parseInt(process.argv[2]) || 10)
  const downloadedUrls = await fg.async(`${rustleDataPath}/*.txt`)
  const urlsToDownload = totalUrls.filter(
    x => !(downloadedUrls.includes(x[0]) || downloadCache.includes(x[0])),
  )

  logger.info(`
  Beginning download.
  Total days to download: ${totalUrls.length}
  Days already downloaded: ${downloadedUrls.length}
  Days to download right now: ${urlsToDownload.length}`)

  Promise.map(urlsToDownload, downloadFile)
}

if (require.main === module) main()
