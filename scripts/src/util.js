const Promise = require('bluebird')
const {promises: fs} = require('fs')

const co = fn => Promise.coroutine(fn)

const capitalise = string =>
  string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()

const getFileByLine = async (filePath, isSet = false) => {
  const file = await fs.readFile(filePath, {
    encoding: 'utf8',
    flag: 'a+',
  })

  const arr = file.trim().split('\n')
  if (isSet) return new Set(arr)

  return arr
}

module.exports = {
  capitalise,
  co,
  getFileByLine,
}
