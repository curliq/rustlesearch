const {discardCachePath, indexCachePath} = require('./cache')
const {co, fs, getFileByLine} = require('../util')
const Promise = require('bluebird')

const deleteFile = co(function* deleteFile(filePath) {
  try {
    yield fs.remove(filePath)
    yield fs.outputFile(discardCachePath, `${filePath}\n`, {flag: 'a'})
    console.debug({filePath, message: 'Deleted & cached file'})
  } catch (error) {
    console.warn({
      error,
      filePath,
      message: 'File could either not be deleted or cached.',
    })
  }
})

const discardDownloads = async () => {
  const ingestedPaths = await getFileByLine(indexCachePath)
  const discardedPaths = await getFileByLine(discardCachePath, true)

  const pathsToDiscard = ingestedPaths
    .filter(file => !discardedPaths.has(file))
    .filter(Boolean)

  console.info({
    message: `Files to discard: ${pathsToDiscard.length}`,
  })
  await Promise.map(pathsToDiscard, deleteFile, {concurrency: 10})
  console.info({message: 'Finished discarding'})
}
if (require.main === module) discardDownloads()

module.exports = {
  discardDownloads,
}
