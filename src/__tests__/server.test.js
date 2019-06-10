import fastify from '@src/server'

const getApiURL = path => `${process.env.ROUTE_PREFIX}/${path}`

describe('server test', () => {
  // clean up connections
  afterAll(() => fastify.close())

  test('healthcheck passes', async() => {
    const response = await fastify.inject({
      method: 'GET',
      url: getApiURL('healthcheck'),
    })

    expect(response.statusCode).toBe(200)
    expect(response.payload).toBe('ALIVE')
  })

  test('we can query something', async() => {
    const response = await fastify.inject({
      method: 'GET',
      url: getApiURL('search'),
      query: {
        channel: 'destiny',
      },
    })

    expect(response.statusCode).toBe(200)
  })
})
