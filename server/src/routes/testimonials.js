const router      = require('express').Router()
const prisma      = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')

// ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────

// GET /api/testimonials — all approved testimonials (public)
router.get('/', async (req, res) => {
  try {
    const { service, featured, limit } = req.query

    const where = {
      isApproved: true,
      ...(service  && { service }),
      ...(featured === 'true' && { isFeatured: true }),
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: parseInt(limit) }),
    })

    res.json({ testimonials })
  } catch (err) {
    console.error('[testimonials list]', err)
    res.status(500).json({ error: 'Failed to fetch testimonials' })
  }
})

// GET /api/testimonials/:id — single testimonial (public, must be approved)
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: req.params.id },
    })
    if (!testimonial || !testimonial.isApproved) {
      return res.status(404).json({ error: 'Testimonial not found' })
    }
    res.json({ testimonial })
  } catch (err) {
    console.error('[testimonial get]', err)
    res.status(500).json({ error: 'Failed to fetch testimonial' })
  }
})

// ─── ADMIN ROUTES (protected) ───────────────────────────────────────────────

// GET /api/testimonials/admin/all — all testimonials including unapproved (protected)
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1
    const limit  = parseInt(req.query.limit) || 20
    const status = req.query.status || ''   // approved, pending, all
    const service = req.query.service || ''

    const where = {
      ...(status === 'approved' && { isApproved: true }),
      ...(status === 'pending'  && { isApproved: false }),
      ...(service && { service }),
    }

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.testimonial.count({ where }),
    ])

    res.json({ testimonials, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[admin testimonials list]', err)
    res.status(500).json({ error: 'Failed to fetch testimonials' })
  }
})

// POST /api/testimonials/admin — create testimonial (protected)
router.post('/admin', requireAuth, async (req, res) => {
  try {
    const {
      patientName, patientInitials, age, gender, condition, service,
      rating, reviewText, videoUrl, photoUrl, treatmentDuration,
      outcome, consentGiven,
    } = req.body

    if (!patientName || !condition || !service || !reviewText) {
      return res.status(400).json({ error: 'Patient name, condition, service, and review text are required' })
    }
    if (!consentGiven) {
      return res.status(400).json({ error: 'Patient consent is required' })
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        patientName,
        patientInitials: patientInitials || null,
        age:               age ? parseInt(age) : null,
        gender:            gender || null,
        condition,
        service,
        rating:            rating ? parseInt(rating) : 5,
        reviewText,
        videoUrl:          videoUrl || null,
        photoUrl:          photoUrl || null,
        treatmentDuration: treatmentDuration || null,
        outcome:           outcome || null,
        consentGiven:      true,
        isApproved:        false,
        isFeatured:        false,
      },
    })

    res.status(201).json({ testimonial, message: 'Testimonial created successfully' })
  } catch (err) {
    console.error('[admin testimonial create]', err)
    res.status(500).json({ error: 'Failed to create testimonial' })
  }
})

// PATCH /api/testimonials/admin/:id — update testimonial (protected)
router.patch('/admin/:id', requireAuth, async (req, res) => {
  try {
    const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Testimonial not found' })
    }

    const {
      patientName, patientInitials, age, gender, condition, service,
      rating, reviewText, videoUrl, photoUrl, treatmentDuration,
      outcome, isApproved, isFeatured, consentGiven,
    } = req.body

    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: {
        ...(patientName     !== undefined && { patientName }),
        ...(patientInitials !== undefined && { patientInitials }),
        ...(age             !== undefined && { age: age ? parseInt(age) : null }),
        ...(gender          !== undefined && { gender }),
        ...(condition       !== undefined && { condition }),
        ...(service         !== undefined && { service }),
        ...(rating          !== undefined && { rating: parseInt(rating) }),
        ...(reviewText      !== undefined && { reviewText }),
        ...(videoUrl        !== undefined && { videoUrl }),
        ...(photoUrl        !== undefined && { photoUrl }),
        ...(treatmentDuration !== undefined && { treatmentDuration }),
        ...(outcome         !== undefined && { outcome }),
        ...(isApproved      !== undefined && { isApproved }),
        ...(isFeatured      !== undefined && { isFeatured }),
        ...(consentGiven    !== undefined && { consentGiven }),
      },
    })

    res.json({ testimonial, message: 'Testimonial updated successfully' })
  } catch (err) {
    console.error('[admin testimonial update]', err)
    res.status(500).json({ error: 'Failed to update testimonial' })
  }
})

// DELETE /api/testimonials/admin/:id — delete testimonial (protected)
router.delete('/admin/:id', requireAuth, async (req, res) => {
  try {
    const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Testimonial not found' })
    }

    await prisma.testimonial.delete({ where: { id: req.params.id } })
    res.json({ message: 'Testimonial deleted successfully' })
  } catch (err) {
    console.error('[admin testimonial delete]', err)
    res.status(500).json({ error: 'Failed to delete testimonial' })
  }
})

module.exports = router
