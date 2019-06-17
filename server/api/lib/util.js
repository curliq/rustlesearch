import Promise from 'bluebird'

export const co = fn => Promise.coroutine(fn)
export const fs = Promise.promisifyAll(require('fs'))

export const capitalize = string => {
  return string[0].toUpperCase() + string.slice(1).toLowerCase()
}
