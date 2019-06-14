import {co} from '@lib/util'

export default co(function* (req, res, next) {
  req.realIp = req.headers['X-Real-IP']
  next()
})
