const {splitEvery} = require('ramda')
const {Worker} = require('worker_threads')
const {indexCachePath, rustlePath} = require('../cache')
const {fs, getFileByLine} = require('../../util')

const THREADS = parseInt(process.argv[2], 10) || 6

const indexToElastic = async () => {
  const allPathsNames = await fs.readdirSafe(rustlePath)
  const allPaths = allPathsNames.map(file => `${rustlePath}/${file}`)
  const ingestedPaths = await getFileByLine(indexCachePath, {set: true})
  const pathsToIngest = allPaths.filter(file => !ingestedPaths.has(file))
  const chunkLength = Math.ceil(pathsToIngest.length / THREADS)
  if (chunkLength < 1) return
  const chunkedPaths = splitEvery(chunkLength, pathsToIngest)

  const workers = chunkedPaths.map(pathChunk => {
    const worker = new Worker('./src/index_service/worker.js', {
      workerData: pathChunk,
    })

    return worker
  })

  process.on('SIGINT', () => {
    console.log('SIGINT received, starting graceful shutdown.')
    workers.forEach(worker => worker.postMessage('shouldExit'))
  })

  console.info({
    totalDaysIngested: ingestedPaths.size,
    totalDaysOfLogs: allPaths.length,
    totalDaysToIngest: pathsToIngest.length,
  })
}

if (require.main === module) {
  indexToElastic()
}

module.exports = {
  indexToElastic,
}
