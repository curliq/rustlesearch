const downloadTests = require('./download.js')
const fs = require('fs-extra')
const {dataPath} = require('../src/cache')

afterAll(async () => {
  await fs.remove(dataPath)
})
describe('Download', () => downloadTests())
