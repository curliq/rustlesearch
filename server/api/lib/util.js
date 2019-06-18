import Promise from 'bluebird'
import fsBasic from 'fs'

export const co = fn => Promise.coroutine(fn)
export const fs = Promise.promisifyAll(fsBasic)

export const capitalize = string => string[0].toUpperCase() + string.slice(1).toLowerCase()
