import app from '@api/server'
import request from 'supertest'
<<<<<<< HEAD:server/src/__tests__/server.test.js
const getApiURL = path => `${process.env.ROUTE_PREFIX}/${path}`
=======

const getApiURL = path =>
  `${process.env.ROUTE_PREFIX}/${path}`
>>>>>>> move src to api:api/__tests__/server.test.js

const getManyRequests = (n, url, query) => {
  const requests = []
  for (let i = 0; i < n; i += 1) {
    const req = request(app)
      .get(getApiURL(url))
      .query(query)
    requests.push(req)
  }
  return requests
}

describe('server test', () => {
  test('healthcheck passes', async() => {
    const response = await request(app).get(getApiURL('healthcheck'))
    expect(response.statusCode).toBe(200)
    expect(response.text).toBe('ALIVE')
  })

  test('we can query something', async() => {
    const response = await request(app)
      .get(getApiURL('search'))
      .query({channel: 'destinygg'})

    expect(response.statusCode).toBe(200)
  })

  test('the ratelimiter works', async done => {
    const requests = getManyRequests(20, 'search', {
      channel: 'destinygg',
    })
    // at least one should throw a 429
    for await (const response of requests)
      if (response.statusCode === 429) done()
  })
})
