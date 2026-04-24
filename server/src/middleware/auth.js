const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — no token provided' })
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.staff = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized — invalid or expired token' })
  }
}

module.exports = { requireAuth }
