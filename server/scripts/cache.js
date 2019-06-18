import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const cachePath = './cache'
const dataPath = './data'
const elasticPath = join(dataPath, 'esdata')

export const rustleDataPath = join(dataPath, 'rustle')
export const channelFilePath = join('.', 'channels.txt')
export const downloadCachePath = join(cachePath, 'download_cache.txt')
export const indexCachePath = join(cachePath, 'ingest_cache.txt')
export const blacklistPath = join(cachePath, 'blacklist.txt')

if (!existsSync(cachePath)) mkdirSync(cachePath)
if (!existsSync(rustleDataPath)) mkdirSync(rustleDataPath, { recursive: true })
if (!existsSync(elasticPath)) mkdirSync(elasticPath, { recursive: true })
