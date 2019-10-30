const {parse} = require('path')
const readLastLines = require('read-last-lines')
const {indexCachePath, rustlePath} = require('../cache')
const {lineToMessage} = require('./shared')
const {fs, getFileByLine} = require('../../util')

const indexCacheStream = fs.createWriteStream(indexCachePath, {flags: 'a'})

const reloadCache = async () => {
  const allPathsNames = await fs.readdirSafe(rustlePath)
  const allPaths = allPathsNames.map(file => `${rustlePath}/${file}`)
}
