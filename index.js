require('module-alias/register')

const Fastify = require('fastify')
const {logger} = require('@lib/logger')
const {co} = require('@lib/util')
const {elasticClient} = require('@lib/elastic')

const prefix = process.env.ROUTE_PREFIX

const fastify = Fastify({
  // we are behind nginx, so we trust it as a proxy
  trustProxy: true,
  logger,
})

fastify.register(require('fastify-helmet'))
fastify.register(require('fastify-cors'))

fastify.register(require('@routes/api'), {prefix})

fastify.addHook(
  'onError',
  co(function * (request, reply, error) {
    logger.error(error)
  }),
)

fastify.listen(process.env.APP_PORT, () => {
  elasticClient
    .info()
    .then(() =>
      logger.info(`App listening at http://localhost:${process.env.APP_PORT}`),
    )
    .catch(err => {
      logger.error(`Failed to connect to Elastic: ${err}`)
      process.exit(1)
    })
})
