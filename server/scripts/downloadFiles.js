import request from 'superagent'
import { DateTime } from 'luxon'
import Promise from 'bluebird'
import R from 'ramda'
import logger from '@lib/logger'
import { fs } from '@lib/util'
import { rustleDataPath, downloadCachePath, channelFilePath } from './cache'

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
const toPathAndUrl = ({ channel, date }) => [
  `${rustleDataPath}/${channel}::${fileDateFormat(date)}.txt`,
  `${baseUrl}/${channel} chatlog/${fullDateFormat(date)}.txt`,
]

// Swol Functions
const getUrlList = (channels, daysBack) => R.pipe(
  R.inc,
  R.range(1),
  R.map(day => today.minus({ days: day })),
  R.map(date => channels.map(channel => toPathAndUrl({ channel, date }))),
  R.unnest,
)(daysBack)

const downloadFile = async ([path, uri]) => {
  try {
    const { text: res } = await request.get(uri)
    await fs.writeFileAsync(path, res)
    logger.info(`Wrote ${path} to disk.`)
  } catch {
    await fs.writeFileAsync(downloadCachePath, `${path}\n`, {
      encoding: 'utf8',
      flag: 'a+',
    })
    logger.info(`${path} 404, wrote file to download cache.`)
  }
}

const main = async () => {
  const channelsFile = await fs.readFileAsync(channelFilePath, {
    flag: 'a+',
  })
  const channels = parseByLine(channelsFile.toString())

  const downloadCacheFile = await fs.readFileAsync(downloadCachePath, {
    flag: 'a+',
  })
  const downloadCache = parseByLine(downloadCacheFile.toString())

  const totalUrls = getUrlList(channels, parseInt(process.argv[2], 10) || 10)
  const downloadedUrlFiles = await fs.readdirAsync(rustleDataPath)
  const downloadedUrls = downloadedUrlFiles.map(
    file => `${rustleDataPath}/${file}`,
  )
  const urlsToDownload = totalUrls.filter(
    x => !(downloadedUrls.includes(x[0]) || downloadCache.includes(x[0])),
  )

  logger.info(`
  Beginning download.
  Total days to download: ${totalUrls.length}
  Days already downloaded: ${downloadedUrls.length}
  Days to download right now: ${urlsToDownload.length}`)

  Promise.map(urlsToDownload, downloadFile, { concurrency: 20 })
}

if (require.main === module) main()
