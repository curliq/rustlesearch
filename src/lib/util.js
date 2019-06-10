const Promise = require('bluebird')

const co = fn => Promise.coroutine(fn)

module.exports = {co}
