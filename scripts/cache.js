const {join} = require('path')
const {existsSync, mkdirSync} = require('fs')

const cachePath = './cache'
const dataPath = './data'
const elasticPath = join(dataPath, 'esdata')
const monthsPath = join(dataPath, 'months')
const rustleDataPath = join(dataPath, 'rustle')
const channelFilePath = join('.', 'channels.txt')
const downloadCachePath = join(cachePath, 'download_cache.txt')
const indexCachePath = join(cachePath, 'ingest_cache.txt')
const blacklistPath = join(cachePath, 'blacklist.txt')
const discardCachePath = join(cachePath, 'discard_cache.txt')

if (!existsSync(cachePath)) mkdirSync(cachePath)
if (!existsSync(rustleDataPath)) mkdirSync(rustleDataPath, {recursive: true})
if (!existsSync(elasticPath)) mkdirSync(elasticPath, {recursive: true})
if (!existsSync(monthsPath)) mkdirSync(monthsPath, {recursive: true})

module.exports = {
  blacklistPath,
  channelFilePath,
  discardCachePath,
  downloadCachePath,
  indexCachePath,
  monthsPath,
  rustleDataPath,
}
