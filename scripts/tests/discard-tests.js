/* eslint-disable no-sync */
const {discardDownloads} = require('../src/discard-downloads')
const {
  rustlePath,
  discardCachePath,
  indexCachePath,
  dataPath,
} = require('../src/cache')
const {DateTime} = require('luxon')
const {fs, getFileByLine} = require('../util')

const yesterday = DateTime.utc().minus({days: 1})
// const fullDateFormat = date => date.toFormat('MMMM yyyy/yyyy-MM-dd')
const responseDateFormat = date => date.toFormat("yyyy-MM-dd HH:mm:ss 'UTC'")
const fileDateFormat = date => date.toFormat('yyyy-MM-dd')
const fileDate = fileDateFormat(yesterday)

const getPathFromChannel = channel =>
  `${rustlePath}/${channel}::${fileDate}.txt`

const mockData = `[${responseDateFormat(yesterday)}] johnpyp: wow cool bro
[${responseDateFormat(yesterday.plus({minutes: 2}))}] alice: wow nice bro`

module.exports = () => {
  beforeAll(async () => {
    await fs.outputFile(getPathFromChannel('Destiny'), mockData)
    await fs.outputFile(getPathFromChannel('Destinygg'), mockData)
    await fs.outputFile(getPathFromChannel('Katerino'), mockData)
  })

  afterAll(async () => {
    await fs.remove(dataPath)
  })

  describe('does not discard any files without ingest', () => {
    test('', async () => {
      await discardDownloads()
      expect(fs.pathExistsSync(getPathFromChannel('Destiny'))).toBe(true)
      expect(fs.pathExistsSync(getPathFromChannel('Destinygg'))).toBe(true)
      expect(fs.pathExistsSync(getPathFromChannel('Katerino'))).toBe(true)
      expect(fs.inputFileSync(discardCachePath, 'utf8')).toBe('')
    })
  })

  describe('discards file in ingest', () => {
    test('', async () => {
      const downloadedFilePath1 = getPathFromChannel('Destiny')
      const downloadedFilePath2 = getPathFromChannel('Katerino')

      await fs.outputFile(indexCachePath, `${downloadedFilePath1}\n`, {
        flag: 'a',
      })

      await fs.outputFile(indexCachePath, `${downloadedFilePath2}\n`, {
        flag: 'a',
      })
      await discardDownloads()
      expect(fs.pathExistsSync(getPathFromChannel('Destiny'))).toBe(false)
      expect(fs.pathExistsSync(getPathFromChannel('Destinygg'))).toBe(true)
      expect(fs.pathExistsSync(getPathFromChannel('Katerino'))).toBe(false)
      const discardContents = await getFileByLine(discardCachePath)

      expect(discardContents[0]).toBe(`${downloadedFilePath1}`)
      expect(discardContents[1]).toBe(`${downloadedFilePath2}`)
    })
  })

  describe('respects discard cache', () => {
    test('', async () => {
      const downloadedFilePath1 = getPathFromChannel('Destiny')
      const downloadedFilePath2 = getPathFromChannel('Katerino')

      await fs.outputFile(downloadedFilePath1, mockData)
      await discardDownloads()
      expect(fs.pathExistsSync(getPathFromChannel('Destiny'))).toBe(true)
      expect(fs.pathExistsSync(getPathFromChannel('Destinygg'))).toBe(true)
      expect(fs.pathExistsSync(getPathFromChannel('Katerino'))).toBe(false)
      const discardContents = await getFileByLine(discardCachePath)

      expect(discardContents[0]).toBe(`${downloadedFilePath1}`)
      expect(discardContents[1]).toBe(`${downloadedFilePath2}`)
    })
  })
}
