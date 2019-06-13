import Promise from 'bluebird'

export const co = fn => Promise.coroutine(fn)
export const fs = Promise.promisifyAll(require('fs'))
export const pad = n => `00${n}`.slice(-2)
export const getISODayDate = date =>
  `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDay())}`
