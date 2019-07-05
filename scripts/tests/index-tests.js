const {rustlePath, indexCachePath} = require('../src/cache')
const {DateTime} = require('luxon')
const {Client} = require('@elastic/elasticsearch')
const {initElastic} = require('../src/init-elastic')
const {indexToElastic} = require('../src/index-to-elastic')
const {fs} = require('../util')

const yesterday = DateTime.utc()
  .minus({days: 1})
  .set({millisecond: 0})

const responseDateFormat = date => date.toFormat("yyyy-MM-dd HH:mm:ss 'UTC'")
const fileDateFormat = date => date.toFormat('yyyy-MM-dd')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const fileDate = fileDateFormat(yesterday)

const mockData = `[${responseDateFormat(yesterday)}] johnpyp: wow cool bro
[${responseDateFormat(yesterday.plus({minutes: 2}))}] alice: wow nice bro`

const partialBadMockData = `
[${responseDateFormat(yesterday)}] johnpyp: wow cool bro
[${responseDateFormat(yesterday.plus({minutes: 2}))}] aliceasdfasdfsdfasdfsfas: 
[${responseDateFormat(yesterday.plus({minutes: 4}))}] alice: 
[${responseDateFormat(yesterday.plus({minutes: 6}))}] ce:
df

`

const expectedSearchResult = [
  {
    channel: 'Destiny',
    text: 'wow cool bro',
    ts: yesterday.toISO(),
    username: 'johnpyp',
  },
  {
    channel: 'Destinygg',
    text: 'wow cool bro',
    ts: yesterday.toISO(),
    username: 'johnpyp',
  },
  {
    channel: 'Destiny',
    text: 'wow nice bro',
    ts: yesterday.plus({minutes: 2}).toISO(),
    username: 'alice',
  },
  {
    channel: 'Destinygg',
    text: 'wow nice bro',
    ts: yesterday.plus({minutes: 2}).toISO(),
    username: 'alice',
  },
]

const getPathFromChannel = channel =>
  `${rustlePath}/${channel}::${fileDate}.txt`

const client = new Client({
  node: process.env.ELASTIC_LOCATION,
})

const resetIndex = async () => {
  await client.indices.delete({index: process.env.INDEX_NAME})
  await initElastic('1s')
}

module.exports = () => {
  beforeAll(async () => {
    await fs.outputFile(getPathFromChannel('Destiny'), mockData)
    await fs.outputFile(getPathFromChannel('Destinygg'), mockData)
    await initElastic('1s')
  })

  afterAll(async () => {
    await fs.remove(rustlePath)
  })

  describe('indexes expected amount of documents', () => {
    test('indexes expected amount of documents', async () => {
      await indexToElastic()
      await sleep(1000)
      const result = await client.count({index: process.env.INDEX_NAME})
      expect(result.body.count).toBe(4)
    })
  })

  describe('indexes correct documents', () => {
    test('indexes correct documents', async () => {
      const result = await client.search({index: process.env.INDEX_NAME})
      const messages = result.body.hits.hits.map(log => log._source)
      expect(messages).toEqual(expect.arrayContaining(expectedSearchResult))
    })
  })

  describe('respects ingest cache', () => {
    test('respects ingest cache', async () => {
      await resetIndex()
      await fs.remove(indexCachePath)
      await fs.outputFile(indexCachePath, getPathFromChannel('Destiny'), {
        flag: 'a',
      })
      await indexToElastic()
      await sleep(1000)
      const result = await client.count({index: process.env.INDEX_NAME})
      expect(result.body.count).toBe(2)
    })
  })

  describe('rejects bad data', () => {
    test('rejects bad data', async () => {
      await resetIndex()
      await fs.remove(rustlePath)
      await fs.outputFile(
        getPathFromChannel('Destinygg'),
        partialBadMockData.trim(),
      )
      await indexToElastic()
      await sleep(1000)
      const result = await client.count({index: process.env.INDEX_NAME})
      expect(result.body.count).toBe(1)
    })
  })
}
