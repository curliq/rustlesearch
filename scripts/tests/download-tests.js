/* eslint-disable no-sync */
const {downloadFiles} = require('../src/download-files')
const {
  downloadCachePath,
  rustleDataPath,
  discardCachePath,
  resetData,
} = require('../src/cache')
const nock = require('nock')
const {DateTime} = require('luxon')
const fs = require('fs-extra')

const yesterday = DateTime.utc().minus({days: 1})
const fullDateFormat = date => date.toFormat('MMMM yyyy/yyyy-MM-dd')
const responseDateFormat = date => date.toFormat("yyyy-MM-dd HH:mm:ss 'UTC'")
const fileDateFormat = date => date.toFormat('yyyy-MM-dd')
const fileDate = fileDateFormat(yesterday)

const getPathFromChannel = channel =>
  `${rustleDataPath}/${channel}::${fileDate}.txt`

const mockData = `[${responseDateFormat(yesterday)}] johnpyp: wow cool bro
[${responseDateFormat(yesterday.plus({minutes: 2}))}] alice: wow nice bro`

module.exports = () => {
  nock('https://overrustlelogs.net')
    .log(console.log)
    .persist()
    .get(encodeURI(`/Destiny chatlog/${fullDateFormat(yesterday)}.txt`))
    .reply(200, mockData)
    .get(encodeURI(`/Destinygg chatlog/${fullDateFormat(yesterday)}.txt`))
    .reply(200, mockData)
    .get(encodeURI(`/Katerino chatlog/${fullDateFormat(yesterday)}.txt`))
    .reply(404)
    .get('/api/v1/Destiny/months.json')
    .reply(200, ['August 2013'])
    .get('/api/v1/Destinygg/months.json')
    .reply(200, ['August 2013'])
    .get('/api/v1/Katerino/months.json')
    .reply(200, ['June 2018'])

  afterAll(async () => {
    nock.cleanAll()
    nock.enableNetConnect()
    await resetData()
  })

  describe('downloads files', () => {
    test('downloads files', async () => {
      await downloadFiles(['Destiny', 'Destinygg', 'Katerino'], 1)
      expect(fs.pathExistsSync(getPathFromChannel('Destiny'))).toBe(true)
      expect(fs.pathExistsSync(getPathFromChannel('Destinygg'))).toBe(true)
    })
  })

  describe('contains correct contents', () => {
    test('contains correct contents', async () => {
      const downloadedFilePath = getPathFromChannel('Destiny')

      const downloadedContents = await fs.readFile(downloadedFilePath, {
        encoding: 'utf8',
      })
      expect(downloadedContents).toBe(mockData)
    })
  })

  describe('fails to download 404', () => {
    test('fails to download 404', async () => {
      expect(fs.pathExistsSync(getPathFromChannel('Katerino'))).toBe(false)
    })
  })

  describe('writes 404 to download cache', () => {
    test('writes 404 to download cache', async () => {
      const downloadCacheContents = (await fs.readFile(downloadCachePath, {
        encoding: 'utf8',
      }))
        .trim()
        .split('\n')
      expect(downloadCacheContents[0]).toBe(getPathFromChannel('Katerino'))
    })
  })

  describe('respects download cache', () => {
    test('respects download cache', async () => {
      const downloadedFilePath = getPathFromChannel('Destiny')

      await fs.remove(downloadedFilePath)
      await fs.writeFile(downloadCachePath, `${downloadedFilePath}\n`, {
        encoding: 'utf8',
        flag: 'a+',
      })
      await downloadFiles(['Destiny'], 1)
      expect(fs.pathExistsSync(downloadedFilePath)).toBe(false)
    })
  })

  describe('respects discard cache', () => {
    test('respects discard cache', async () => {
      const downloadedFilePath = getPathFromChannel('Destiny')
      await fs.remove(downloadedFilePath)
      await fs.remove(downloadCachePath)
      await fs.writeFile(discardCachePath, `${downloadedFilePath}\n`, {
        encoding: 'utf8',
        flag: 'a+',
      })
      await downloadFiles(['Destiny'], 1)
      expect(fs.pathExistsSync(downloadedFilePath)).toBe(false)
    })
  })
}
