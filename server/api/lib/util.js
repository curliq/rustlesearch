const Promise = require('bluebird')

const co = fn => Promise.coroutine(fn)

const capitalise = string =>
  string[0].toUpperCase() + string.slice(1).toLowerCase()

module.exports = {
  capitalise,
  co,
}
