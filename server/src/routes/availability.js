const router      = require('express').Router()
const prisma      = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')

router.use(requireAuth)

// ─── GET /api/admin/availability ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const blocks = await prisma.doctorAvailability.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })
    res.json(blocks)
  } catch (err) {
    console.error('[availability GET]', err)
    res.status(500).json({ error: 'Failed to fetch availability' })
  }
})

// ─── POST /api/admin/availability ────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, slotDuration, maxPatients, sessionType, label } = req.body

    if (dayOfWeek == null || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'dayOfWeek must be 0-6' })
    }
    if (!startTime || !endTime || startTime >= endTime) {
      return res.status(400).json({ error: 'startTime must be before endTime' })
    }

    const block = await prisma.doctorAvailability.create({
      data: {
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        slotDuration:  slotDuration  ? parseInt(slotDuration)  : 30,
        maxPatients:   maxPatients   ? parseInt(maxPatients)   : 1,
        sessionType:   sessionType   || 'In-Person',
        label:         label         || null,
      },
    })
    res.status(201).json(block)
  } catch (err) {
    console.error('[availability POST]', err)
    res.status(500).json({ error: 'Failed to create availability' })
  }
})

// ─── PATCH /api/admin/availability/:id ───────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, slotDuration, maxPatients, sessionType, label, isActive } = req.body
    const data = {}
    if (dayOfWeek !== undefined)    data.dayOfWeek    = parseInt(dayOfWeek)
    if (startTime !== undefined)    data.startTime    = startTime
    if (endTime !== undefined)      data.endTime      = endTime
    if (slotDuration !== undefined) data.slotDuration = parseInt(slotDuration)
    if (maxPatients !== undefined)  data.maxPatients  = parseInt(maxPatients)
    if (sessionType !== undefined)  data.sessionType  = sessionType
    if (label !== undefined)        data.label        = label || null
    if (isActive !== undefined)     data.isActive     = isActive

    const block = await prisma.doctorAvailability.update({
      where: { id: req.params.id },
      data,
    })
    res.json(block)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Availability block not found' })
    console.error('[availability PATCH]', err)
    res.status(500).json({ error: 'Failed to update availability' })
  }
})

// ─── DELETE /api/admin/availability/:id ──────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await prisma.doctorAvailability.delete({ where: { id: req.params.id } })
    res.json({ message: 'Availability block deleted' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Availability block not found' })
    console.error('[availability DELETE]', err)
    res.status(500).json({ error: 'Failed to delete availability' })
  }
})

// ─── GET /api/admin/availability/overrides?from=&to= ─────────────────────────
router.get('/overrides', async (req, res) => {
  try {
    const { from, to } = req.query
    const where = {}
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to)   where.date.lte = new Date(to)
    }

    const overrides = await prisma.slotOverride.findMany({
      where,
      orderBy: { date: 'asc' },
    })
    res.json(overrides)
  } catch (err) {
    console.error('[availability overrides GET]', err)
    res.status(500).json({ error: 'Failed to fetch overrides' })
  }
})

// ─── POST /api/admin/availability/overrides ──────────────────────────────────
router.post('/overrides', async (req, res) => {
  try {
    const { date, startTime, endTime, isBlocked, reason } = req.body
    if (!date) return res.status(400).json({ error: 'date is required' })

    const override = await prisma.slotOverride.create({
      data: {
        date:      new Date(date),
        startTime: startTime || null,
        endTime:   endTime   || null,
        isBlocked: isBlocked !== undefined ? isBlocked : true,
        reason:    reason    || null,
      },
    })
    res.status(201).json(override)
  } catch (err) {
    console.error('[availability overrides POST]', err)
    res.status(500).json({ error: 'Failed to create override' })
  }
})

// ─── DELETE /api/admin/availability/overrides/:id ────────────────────────────
router.delete('/overrides/:id', async (req, res) => {
  try {
    await prisma.slotOverride.delete({ where: { id: req.params.id } })
    res.json({ message: 'Override deleted' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Override not found' })
    console.error('[availability overrides DELETE]', err)
    res.status(500).json({ error: 'Failed to delete override' })
  }
})

module.exports = router
