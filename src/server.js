import Fastify from 'fastify'
import {logger} from '@lib/logger'
import {co} from '@lib/util'
import helmet from 'fastify-helmet'
import cors from 'fastify-cors'
import api from '@routes/api'

const prefix = process.env.ROUTE_PREFIX

const fastify = Fastify({
  // we are behind nginx, so we trust it as a proxy
  trustProxy: true,
  logger,
})

fastify.register(helmet)
fastify.register(cors)

fastify.register(api, {prefix})

fastify.addHook(
  'onError',
  co(function * (request, reply, error) {
    logger.error(error)
  }),
)

fastify.listen(process.env.APP_PORT, () => {
  logger.info(`App listening at http://localhost:${process.env.APP_PORT}`)
})

export default fastify
