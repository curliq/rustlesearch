import express from 'express'
import {logger, loggerMiddleware} from '@lib/logger'
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
  }),
)
app.use(helmet())
app.use(prefix, api)

app.listen(process.env.APP_PORT, () => {
  logger.info(`App listening at http://localhost:${process.env.APP_PORT}`)
})

export default app
