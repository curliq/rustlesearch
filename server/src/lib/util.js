import Promise from 'bluebird'

export const co = fn => Promise.coroutine(fn)
