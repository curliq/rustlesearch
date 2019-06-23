const config = require('./config')

const isProd = () => config.NODE_ENV === 'production'
const isTest = () => config.NODE_ENV === 'test'
const isDev = () => config.NODE_ENV === 'development'

module.exports = {
  isDev,
  isProd,
  isTest,
}
