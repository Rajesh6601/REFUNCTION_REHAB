const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const prisma  = require('../lib/prisma')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const staff = await prisma.staff.findUnique({ where: { email } })
    if (!staff) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, staff.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: staff.id, email: staff.email, role: staff.role, name: staff.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role },
    })
  } catch (err) {
    console.error('[auth login]', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// POST /api/auth/setup  — one-time admin creation (remove after first use in prod)
router.post('/setup', async (req, res) => {
  try {
    const count = await prisma.staff.count()
    if (count > 0) {
      return res.status(403).json({ error: 'Setup already completed' })
    }
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' })
    }
    const passwordHash = await bcrypt.hash(password, 12)
    const staff = await prisma.staff.create({
      data: { name, email, passwordHash, role: 'admin' },
    })
    res.status(201).json({ message: 'Admin account created', id: staff.id })
  } catch (err) {
    console.error('[auth setup]', err)
    res.status(500).json({ error: 'Setup failed' })
  }
})

module.exports = router
