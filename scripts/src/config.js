const snakeCase = require('lodash.snakecase')
const isPlainObject = require('lodash.isplainobject')
const _ = require('lodash')
const {join} = require('path')

const shallowClone = obj => {
  return Object.create(
    Object.getPrototypeOf(obj),
    Object.getOwnPropertyDescriptors(obj),
  )
}

const suspect = (config, {inspect, parentTree} = {}) => {
  const configCopy = shallowClone(config)

  Object.keys(configCopy).forEach(key => {
    const dotPath = parentTree ? `${parentTree}.${key}` : key
    const envKey = snakeCase(dotPath).toUpperCase()
    const envVar = process.env[envKey]

    if (envVar) {
      const value = _.isNumber(configCopy[key]) ? _.toNumber(envVar) : envVar

      Object.defineProperty(configCopy, key, {
        value,
      })

      console.log('Environment override:', dotPath, envVar)

      return
    }

    if (configCopy[key] === null) {
      throw new Error(`Required key ${envKey} not found in environment.`)
    }

    if (isPlainObject(configCopy[key])) {
      configCopy[key] = suspect(configCopy[key], {
        parentTree: dotPath,
      })
    }
  })

  const final = Object.freeze(configCopy)
  if (inspect) console.log(final)

  return final
}

module.exports = suspect({
  elastic: {
    url: 'http://localhost:9200',
    index: 'rustlesearch',
  },
  download: {
    throttle: 500,
    days: 10,
  },
  index: {
    threads: 6,
    bulkSize: 2000,
  },
  paths: {
    data: 'data',
    channels: 'channels.json',
    get cache() {
      return join(this.data, 'cache')
    },
    get blacklist() {
      return join(this.cache, 'blacklist.txt')
    },
    get months() {
      return join(this.data, 'months')
    },
    get orl() {
      return join(this.data, 'orl')
    },
    get downloadCache() {
      return join(this.cache, 'download_cache.txt')
    },
    get indexCache() {
      return join(this.cache, 'index_cache.txt')
    },
    get discardCache() {
      return join(this.cache, 'discard_cache.txt')
    },
  },
})
