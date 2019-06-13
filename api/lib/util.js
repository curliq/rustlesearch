import Promise from 'bluebird'

export const co = fn => Promise.coroutine(fn)
export const fs = Promise.promisifyAll(require('fs'))
