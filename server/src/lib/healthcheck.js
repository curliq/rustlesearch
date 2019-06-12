import http from 'http'

const options = {
  host: 'localhost',
  path: `${process.env.ROUTE_PREFIX}/healthcheck`,
  port: process.env.APP_PORT,
  timeout: 3000,
}

const req = http.request(options, res => {
  res.statusCode === 200 ? process.exit(0) : process.exit(1)
})

req.on('error', () => {
  process.exit(1)
})

req.end()
