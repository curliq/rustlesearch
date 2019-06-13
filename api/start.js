import '@lib/config'
import cluster from 'cluster'
import http from 'http'
import logger from '@lib/logger'
import {isProd} from '@lib/environment'

if (cluster.isMaster) {
  const workerCount = isProd()
    ? process.env.WORKER_COUNT
    : 1

  for (let i = 0; i < workerCount; i += 1) cluster.fork()

  logger.info(`Started ${workerCount} workers`)
  logger.info(
    `App listening at http://localhost:${process.env.APP_PORT}`,
  )
} else {
  const app = require('./server')
  const server = http.createServer(app)
  server.listen(process.env.APP_PORT)
}

cluster.on('exit', worker => {
  logger.error(`Worker ${worker.id} died...`)
  isProd() ? cluster.fork() : process.exit(1)
})

cluster.on('error', err => {
  logger.error(
    `Got error from worker process: ${err.message}`,
  )
})
