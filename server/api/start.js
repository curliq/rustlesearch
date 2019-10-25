/* eslint-disable global-require */
const cluster = require('cluster')
const {times} = require('ramda')
const config = require('./lib/config')
const logger = require('./lib/logger')
const {isProd} = require('./lib/environment')

const launch = () => cluster.fork()

const initMaster = () => {
  const workerCount = isProd() ? config.WORKER_COUNT : 1

  times(launch, workerCount)

  logger.info(`Started ${workerCount} workers.`)
  logger.info(`App listening at http://localhost:${config.APP_PORT}`)
}

const initWorker = () => {
  const app = require('./server')

  app.listen(config.APP_PORT)
}

cluster.on('exit', worker => {
  logger.error(`Worker ${worker.id} died...`)
  if (isProd()) cluster.fork()
  throw new Error('Application failed to run')
})

cluster.on('error', err => {
  logger.error({error: err.message})
})

if (cluster.isMaster) {
  initMaster()
} else {
  initWorker()
}
