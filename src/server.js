import express from 'express'
import loggerMiddleware from '@middleware/express-logger'
import helmet from 'helmet'
import cors from 'cors'
import api from '@routes/api'

const prefix = process.env.ROUTE_PREFIX

const app = express()

// behind nginx
app.set('trust proxy', 1)

app.use(cors())
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
