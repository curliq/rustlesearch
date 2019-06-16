import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import grace from 'express-graceful-shutdown'
import session from 'express-session'
import RedisStore from 'connect-redis'
import {redisSession} from '@lib/redis'
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
    ignore: [`/healthcheck`],
    honorDNT: true,
  }),
)

app.use(helmet())

const Store = RedisStore(session)
app.use(
  session({
    store: new Store({client: redisSession}),
    secret: process.env.KEY_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
)

app.use(api)

export default app
