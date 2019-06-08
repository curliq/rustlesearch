const winston = require('winston')
const expressWinston = require('express-winston')

const levels = {
  ...winston.config.syslog.levels,
  warn: 4,
}

const winstonConfig = {
  levels,
  transports: [
    new winston.transports.Console({level: process.env.LOG_LEVEL}),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
}

const logger = winston.createLogger(winstonConfig)
const expressLogger = expressWinston.logger(winstonConfig)

module.exports = {expressLogger, logger}
