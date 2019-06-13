import app from '@api/server'
import request from 'supertest'
<<<<<<< HEAD:server/src/__tests__/server.test.js
const getApiURL = path => `${process.env.ROUTE_PREFIX}/${path}`
=======

const getApiURL = path =>
  `${process.env.ROUTE_PREFIX}/${path}`
>>>>>>> move src to api:api/__tests__/server.test.js

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
})
