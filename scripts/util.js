/* eslint-disable no-sync */
const Promise = require('bluebird')
const fs = require('fs-extra')

const co = fn => Promise.coroutine(fn)

const capitalise = string =>
  string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()

fs.inputFile = async (path, ...args) => {
  await fs.ensureFile(path)

  return fs.readFile(path, ...args)
}

fs.inputFileSync = (path, ...args) => {
  fs.ensureFileSync(path)

  return fs.readFileSync(path, ...args)
}

fs.readdirSafe = async (path, ...args) => {
  await fs.ensureDir(path)

  return fs.readdir(path, ...args)
}

fs.readdirSafeSync = async (path, ...args) => {
  fs.ensureDirSync(path)

  return fs.readdirSync(path, ...args)
}

const getFileByLine = async (filePath, isSet = false) => {
  const file = await fs.inputFile(filePath, 'utf8')
  const arr = file.trim().split('\n')
  if (isSet) return new Set(arr)

  return arr
}

module.exports = {
  capitalise,
  co,
  fs,
  getFileByLine,
}
