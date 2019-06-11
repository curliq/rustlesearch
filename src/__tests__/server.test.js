import app from '@src/server'
import request from 'supertest'
const getApiURL = path => `${process.env.ROUTE_PREFIX}/${path}`

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
