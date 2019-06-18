import http from 'http'

const options = {
  host: 'localhost',
  path: `${process.env.ROUTE_PREFIX}/healthcheck`,
  port: process.env.APP_PORT,
  timeout: 3000,
}

const req = http.request(options, (res) => {
  if (res.statusCode === 200) return process.exit(0)
  return process.exit(1)
})

req.on('error', () => {
  process.exit(1)
})

req.end()
