const {join} = require('path')
const fs = require('fs-extra')

const dataPath = process.env.DATA_PATH || './data'
const cachePath = join(dataPath, 'cache')
const monthsPath = join(dataPath, 'months')
const rustleDataPath = join(dataPath, 'rustle')
const channelFilePath = join('.', 'channels.txt')
const downloadCachePath = join(cachePath, 'download_cache.txt')
const indexCachePath = join(cachePath, 'ingest_cache.txt')
const blacklistPath = join(cachePath, 'blacklist.txt')
const discardCachePath = join(cachePath, 'discard_cache.txt')

fs.ensureDirSync(cachePath)
fs.ensureDirSync(rustleDataPath)
fs.ensureDirSync(monthsPath)

module.exports = {
  blacklistPath,
  cachePath,
  channelFilePath,
  dataPath,
  discardCachePath,
  downloadCachePath,
  indexCachePath,
  monthsPath,
  rustleDataPath,
}
