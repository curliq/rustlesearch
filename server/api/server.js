import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import grace from 'express-graceful-shutdown'
import api from '@routes/api'
import loggerMiddleware from '@middleware/express-logger'
import logger from '@lib/logger'
import extendReq from '@middleware/request-extender'

const graceOptions = {
  logger,
  forceTimeout: 10000,
}

const prefix = process.env.ROUTE_PREFIX
const app = express()

// behind nginx
app.set('trust proxy', 1)

app.use(grace(graceOptions))
app.use(cors())
app.use(extendReq)
app.use(
  loggerMiddleware({
    level: 'info',
    ignore: [`${prefix}/healthcheck`],
    honorDNT: true,
  }),
)
app.use(helmet())
app.use(prefix, api)

export default app
