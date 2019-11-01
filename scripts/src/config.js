const confic = require('confic')
const {join} = require('path')

module.exports = confic({
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
