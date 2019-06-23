const {join} = require('path')
const {existsSync, mkdirSync} = require('fs')

const cachePath = './cache'
const dataPath = './data'
const elasticPath = join(dataPath, 'esdata')
const rustleDataPath = join(dataPath, 'rustle')
const channelFilePath = join('.', 'channels.txt')
const downloadCachePath = join(cachePath, 'download_cache.txt')
const indexCachePath = join(cachePath, 'ingest_cache.txt')
const blacklistPath = join(cachePath, 'blacklist.txt')

if (!existsSync(cachePath)) mkdirSync(cachePath)
if (!existsSync(rustleDataPath)) mkdirSync(rustleDataPath, {recursive: true})
if (!existsSync(elasticPath)) mkdirSync(elasticPath, {recursive: true})

module.exports = {
  blacklistPath,
  channelFilePath,
  downloadCachePath,
  indexCachePath,
  rustleDataPath,
}
