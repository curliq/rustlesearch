const {co} = require('@lib/util')

// doesn't do anything, just confirms the app is alive
const healthcheck = co(function * (fastify, options) {
  fastify.get(
    '/search',
    co(function * (req, res) {
      return 'ALIVE'
    }),
  )
})

module.exports = healthcheck
