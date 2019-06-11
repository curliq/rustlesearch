import express from 'express'
import {logger} from '@lib/logger'
import helmet from 'helmet'
import cors from 'cors'
import api from '@routes/api'
const prefix = process.env.ROUTE_PREFIX

const app = express()

// behind nginx
app.set('trust proxy', 1)

app.use((req, res, next) => {
  logger.info(req)
  next()
})
app.use(cors())
app.use(helmet())
app.use(prefix, api)
app.use(function(err, req, res, next) {
  logger.error(err)
  res.status(500).send('Something broke!')
})

app.listen(process.env.APP_PORT, () => {
  logger.info(`App listening at http://localhost:${process.env.APP_PORT}`)
})

export default app
