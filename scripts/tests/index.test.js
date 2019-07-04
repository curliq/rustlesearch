const downloadTests = require('./download-tests.js')
const indexTests = require('./index-tests.js')
const fs = require('fs-extra')
const {dataPath} = require('../src/cache')

afterAll(async () => {
  await fs.remove(dataPath)
})
describe('Download Files', () => downloadTests())
describe('Index to Elastic', () => indexTests())
