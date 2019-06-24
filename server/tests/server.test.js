const {range} = require('ramda')
const request = require('supertest')
const Promise = require('bluebird')
const app = require('../api')

const getManyRequests = (count, url, query) =>
  range(1, count).map(() =>
    request(app)
      .get(url)
      .query(query),
  )

describe('server test', () => {
  test('healthcheck passes', async () => {
    const response = await request(app).get('/healthcheck')
    expect(response.statusCode).toBe(200)
  })

  test('empty queries get rejected', async () => {
    const response = await request(app).get('/search')
    expect(response.statusCode).toBe(422)
  })

  test('we can query something', async () => {
    const response = await request(app)
      .get('/search')
      .query({channel: 'destinygg'})

    expect(response.statusCode).toBe(200)
  })

  test('the ratelimiter works', async done => {
    const requests = getManyRequests(20, '/search', {
      channel: 'destinygg',
    })

    const isTimedOut = response =>
      response.statusCode === 429 ? done() : response

    // at least one should throw a 429
    const results = await Promise.all(requests)
    results.forEach(response => isTimedOut(response))
  })

  test('we can get the channels', async done => {
    const {body} = await request(app).get('/channels')

    if (Array.isArray(body.channels)) return done()
    throw new Error('/channels does not return an array')
  })
})
