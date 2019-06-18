import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import grace from 'express-graceful-shutdown'
import api from '@routes/api'
import loggerMiddleware from '@middleware/express-logger'
import logger from '@lib/logger'
import extendReq from '@middleware/request-extender'

const app = express()

// behind nginx
app.set('trust proxy', 1)
const graceOptions = {
  logger,
  forceTimeout: 10000,
}

app.use(grace(graceOptions))
app.use(
  cors({
    exposedHeaders: ['Retry-After', 'X-RateLimit-Reset'],
  }),
)

app.use(extendReq)

app.use(
  loggerMiddleware({
    level: 'info',
    ignore: ['/healthcheck'],
    honorDNT: true,
  }),
)

app.use(helmet())

app.use(express.json())
app.use(api)

export default app
