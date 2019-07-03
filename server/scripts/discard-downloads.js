const {promises: fs} = require('fs')
const {discardCachePath, indexCachePath} = require('./cache')
const logger = require('../api/lib/logger')
const {co} = require('../api/lib/util')
const Promise = require('bluebird')

const deleteFile = co(function* deleteFile(filePath) {
  try {
    yield fs.unlink(filePath)
    yield fs.writeFile(discardCachePath, `${filePath}\n`, {
      encoding: 'utf8',
      flag: 'a+',
    })
    logger.debug({filePath, message: 'Deleted & cached file'})
  } catch (error) {
    logger.warn({
      error,
      filePath,
      message: 'File could either not be deleted or cached.',
    })
  }
})

const main = async () => {
  const ingestedPaths = await fs.readFile(indexCachePath, {
    encoding: 'utf8',
    flag: 'a+',
  })

  const discardedPaths = await fs.readFile(discardCachePath, {
    encoding: 'utf8',
    flag: 'a+',
  })

  const ingestedPathsList = ingestedPaths.trim().split('\n')
  const discardedPathsSet = new Set(discardedPaths.trim().split('\n'))

  const pathsToDiscard = ingestedPathsList
    .filter(file => !discardedPathsSet.has(file))
    .filter(Boolean)

  logger.info({
    message: `Files to discard: ${pathsToDiscard.length}`,
  })
  await Promise.map(pathsToDiscard, deleteFile, {concurrency: 10})
  logger.info({message: 'Finished discarding'})
}

main()
