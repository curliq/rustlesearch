const fs = require('fs')
const request = require('request')
const util = require('util')
const fg = require('fast-glob')
const {DateTime} = require('luxon')
const Promise = require('bluebird')
const R = require('ramda')

const {existsSync, mkdirSync} = fs

// Promisify functions
const rp = util.promisify(request)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

// "Constants"
const baseUrl = 'https://overrustlelogs.net'
const basePath = './data/rustle'

if (!existsSync(basePath)) mkdirSync(basePath, {recursive: true})

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
  `${basePath}/${channel}::${fileDateFormat(date)}.txt`,
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

const downloadFile = async([path, url], json = false) => {
  const res = await rp({uri: url, json})
  if (res.statusCode === 200) {
    await writeFile(path, res.body)
    console.log(`Wrote ${path} to disk.`)
  } else {
    await writeFile('./download_cache.txt', path + '\n', {
      encoding: 'utf8',
      flag: 'a',
    })
    console.log(`${path} 404, wrote file to download cache.`)
  }
}

// Main
const main = async() => {
  // make file if it doesnt exist
  const channelsFile = await readFile('./channels.txt', {
    flag: 'a+',
  })
  const downloadCacheFile = await readFile('./download_cache.txt', {flag: 'a+'})
  const channels = parseByLine(channelsFile.toString())
  const downloadCache = parseByLine(downloadCacheFile.toString())

  const allUrls = getUrlList(channels, parseInt(process.argv[2]) || 10)
  const urlsDownloaded = await fg.async(`${basePath}/*.txt`)
  const urls = allUrls.filter(
    x => !(urlsDownloaded.includes(x[0]) || downloadCache.includes(x[0])),
  )

  console.log(allUrls.length, urlsDownloaded.length, urls.length)

  Promise.map(urls, downloadFile, {concurrency: 20})
}

main()
