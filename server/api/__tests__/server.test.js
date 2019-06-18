import app from '@api/server'
import request from 'supertest'

const getManyRequests = (n, url, query) => {
  const requests = []
  for (let i = 0; i < n; i += 1) {
    const req = request(app)
      .get(url)
      .query(query)
    requests.push(req)
  }
  return requests
}

describe('server test', () => {
  test('healthcheck passes', async () => {
    const response = await request(app).get('/healthcheck')
    expect(response.statusCode).toBe(200)
  })

  test('we can query something', async () => {
    const response = await request(app)
      .get('/search')
      .query({ channel: 'destinygg' })

    expect(response.statusCode).toBe(200)
  })

  test('the ratelimiter works', async done => {
    const requests = getManyRequests(20, '/search', {
      channel: 'destinygg',
    })
    // at least one should throw a 429
    for await (const response of requests) {
      if (response.statusCode === 429) done()
    }
  })
})
