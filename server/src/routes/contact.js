const router = require('express').Router()
const prisma = require('../lib/prisma')

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, phone, message } = req.body
    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Name, phone and message are required' })
    }
    const inquiry = await prisma.contactInquiry.create({
      data: { name, phone, message },
    })
    res.status(201).json({ message: 'Inquiry saved', id: inquiry.id })
  } catch (err) {
    console.error('[contact]', err)
    res.status(500).json({ error: 'Failed to save inquiry' })
  }
})

module.exports = router
