module.exports = (req, res, next) => {
  req.realIp = req.headers['X-Real-IP']
  next()
}
