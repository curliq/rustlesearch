const {join} = require('path')

const dataPath = process.env.DATA_PATH || './data'
const channelsListPath = join('.', 'channels.txt')
const cachePath = join(dataPath, 'cache')
const monthsPath = join(dataPath, 'months')
const rustlePath = join(dataPath, 'rustle')
const blacklistPath = join(dataPath, 'blacklist.txt')
const downloadCachePath = join(cachePath, 'download_cache.txt')
const indexCachePath = join(cachePath, 'ingest_cache.txt')
const discardCachePath = join(cachePath, 'discard_cache.txt')

module.exports = {
  blacklistPath,
  cachePath,
  channelsListPath,
  dataPath,
  discardCachePath,
  downloadCachePath,
  indexCachePath,
  monthsPath,
  rustlePath,
}
