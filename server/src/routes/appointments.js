const router      = require('express').Router()
const prisma      = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateSlots(startTime, endTime, duration) {
  const slots = []
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  let cur = sh * 60 + sm
  const end = eh * 60 + em
  while (cur + duration <= end) {
    const slotStart = `${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`
    const slotEnd   = `${String(Math.floor((cur + duration) / 60)).padStart(2, '0')}:${String((cur + duration) % 60).padStart(2, '0')}`
    slots.push({ startTime: slotStart, endTime: slotEnd })
    cur += duration
  }
  return slots
}

// ─── PUBLIC: GET /api/appointments/slots?date=YYYY-MM-DD ─────────────────────
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query
    if (!date) return res.status(400).json({ error: 'date query param is required' })

    const targetDate = new Date(date + 'T00:00:00')
    const dayOfWeek  = targetDate.getDay() // 0=Sun

    // 1. Get availability blocks for this day of week
    const availability = await prisma.doctorAvailability.findMany({
      where: { dayOfWeek, isActive: true },
      orderBy: { startTime: 'asc' },
    })

    // 2. Get overrides for this date
    const dayStart = new Date(date + 'T00:00:00')
    const dayEnd   = new Date(date + 'T23:59:59')
    const overrides = await prisma.slotOverride.findMany({
      where: { date: { gte: dayStart, lte: dayEnd } },
    })

    // Check for day-level block (override with no startTime = whole day blocked)
    const dayBlocked = overrides.some(o => o.isBlocked && !o.startTime)
    if (dayBlocked) {
      const reason = overrides.find(o => o.isBlocked && !o.startTime)?.reason
      return res.json({ date, blocked: true, reason: reason || 'Unavailable', slots: [] })
    }

    // 3. Generate time slots from availability
    const allSlots = []
    for (const block of availability) {
      const slots = generateSlots(block.startTime, block.endTime, block.slotDuration)
      for (const slot of slots) {
        // Check slot-level overrides
        const slotBlocked = overrides.some(o =>
          o.isBlocked && o.startTime && o.startTime === slot.startTime
        )
        if (!slotBlocked) {
          allSlots.push({
            startTime:    slot.startTime,
            endTime:      slot.endTime,
            sessionType:  block.sessionType,
            label:        block.label,
            maxPatients:  block.maxPatients,
          })
        }
      }
    }

    // 4. Count existing non-cancelled appointments per slot
    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: { gte: dayStart, lte: dayEnd },
        status: { notIn: ['cancelled'] },
      },
      select: { startTime: true },
    })

    const bookingCounts = {}
    for (const appt of appointments) {
      bookingCounts[appt.startTime] = (bookingCounts[appt.startTime] || 0) + 1
    }

    // 5. Calculate availability, filter past slots if today
    const now = new Date()
    const isToday = date === now.toISOString().slice(0, 10)

    const result = allSlots.map(slot => {
      const booked    = bookingCounts[slot.startTime] || 0
      const available = Math.max(0, slot.maxPatients - booked)
      return { ...slot, booked, available }
    }).filter(slot => {
      if (!isToday) return true
      // Slot must be at least 2 hours from now
      const [h, m] = slot.startTime.split(':').map(Number)
      const slotTime = new Date(now)
      slotTime.setHours(h, m, 0, 0)
      return slotTime.getTime() > now.getTime() + 2 * 60 * 60 * 1000
    })

    res.json({ date, blocked: false, slots: result })
  } catch (err) {
    console.error('[appointments slots]', err)
    res.status(500).json({ error: 'Failed to fetch slots' })
  }
})

// ─── PUBLIC: POST /api/appointments/lookup ────────────────────────────────────
router.post('/lookup', async (req, res) => {
  try {
    const { q } = req.body
    if (!q || q.trim().length < 3) {
      return res.status(400).json({ error: 'Search query must be at least 3 characters' })
    }

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { id: q.trim() },
          { mobile: q.trim() },
        ],
      },
      select: {
        id: true, fullName: true, mobile: true, program: true,
        sessionType: true, preferredTime: true,
      },
    })

    if (!patient) return res.status(404).json({ error: 'Patient not found' })
    res.json(patient)
  } catch (err) {
    console.error('[appointments lookup]', err)
    res.status(500).json({ error: 'Lookup failed' })
  }
})

// ─── PUBLIC: POST /api/appointments ──────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { patientId, packageId, appointmentDate, startTime, endTime, serviceType, sessionType, notes } = req.body

    if (!patientId || !appointmentDate || !startTime || !endTime || !serviceType) {
      return res.status(400).json({ error: 'patientId, appointmentDate, startTime, endTime, and serviceType are required' })
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!patient) return res.status(404).json({ error: 'Patient not found' })

    // Capacity check + create in transaction
    const appointment = await prisma.$transaction(async (tx) => {
      // Get availability block for capacity info
      const dateObj = new Date(appointmentDate + 'T00:00:00')
      const dayOfWeek = dateObj.getDay()
      const block = await tx.doctorAvailability.findFirst({
        where: { dayOfWeek, isActive: true, startTime: { lte: startTime }, endTime: { gte: endTime } },
      })
      const maxPatients = block?.maxPatients || 1

      // Count current bookings for this slot
      const dayStart = new Date(appointmentDate + 'T00:00:00')
      const dayEnd   = new Date(appointmentDate + 'T23:59:59')
      const count = await tx.appointment.count({
        where: {
          appointmentDate: { gte: dayStart, lte: dayEnd },
          startTime,
          status: { notIn: ['cancelled'] },
        },
      })

      if (count >= maxPatients) {
        throw new Error('SLOT_FULL')
      }

      return tx.appointment.create({
        data: {
          patientId,
          packageId:       packageId || null,
          appointmentDate: new Date(appointmentDate + 'T00:00:00'),
          startTime,
          endTime,
          serviceType,
          sessionType:     sessionType || 'In-Person',
          notes:           notes || null,
        },
        include: {
          patient: { select: { fullName: true, mobile: true } },
        },
      })
    })

    res.status(201).json(appointment)
  } catch (err) {
    if (err.message === 'SLOT_FULL') {
      return res.status(409).json({ error: 'This slot is fully booked. Please choose another time.' })
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'You already have an appointment at this time.' })
    }
    console.error('[appointments POST]', err)
    res.status(500).json({ error: 'Failed to book appointment' })
  }
})

// ─── PUBLIC: PATCH /api/appointments/:id/cancel ──────────────────────────────
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { patientId, reason } = req.body

    const appt = await prisma.appointment.findUnique({ where: { id: req.params.id } })
    if (!appt) return res.status(404).json({ error: 'Appointment not found' })
    if (appt.patientId !== patientId) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' })
    }
    if (appt.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' })
    }

    // Must be at least 4 hours before appointment
    const apptDateTime = new Date(appt.appointmentDate)
    const [h, m] = appt.startTime.split(':').map(Number)
    apptDateTime.setHours(h, m, 0, 0)
    const hoursUntil = (apptDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntil < 4) {
      return res.status(400).json({ error: 'Appointments can only be cancelled at least 4 hours in advance' })
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        status: 'cancelled',
        cancellationReason: reason || null,
        cancelledAt: new Date(),
      },
    })
    res.json(updated)
  } catch (err) {
    console.error('[appointments cancel]', err)
    res.status(500).json({ error: 'Failed to cancel appointment' })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN-ONLY routes below this point
// ═══════════════════════════════════════════════════════════════════════════════
router.use(requireAuth)

// ─── GET /api/appointments (admin) ───────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page      = parseInt(req.query.page)  || 1
    const limit     = parseInt(req.query.limit) || 20
    const status    = req.query.status || ''
    const search    = req.query.search || ''
    const patientId = req.query.patientId || ''
    const from      = req.query.from ? new Date(req.query.from) : undefined
    const to        = req.query.to   ? new Date(req.query.to)   : undefined

    const where = {
      ...(status && { status }),
      ...(patientId && { patientId }),
      ...(search && {
        OR: [
          { patient: { fullName: { contains: search, mode: 'insensitive' } } },
          { patient: { mobile:   { contains: search } } },
          { patientId: { contains: search } },
        ],
      }),
      ...(from || to ? {
        appointmentDate: {
          ...(from && { gte: from }),
          ...(to   && { lte: to   }),
        },
      } : {}),
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: [{ appointmentDate: 'desc' }, { startTime: 'asc' }],
        skip:  (page - 1) * limit,
        take:  limit,
        include: {
          patient: { select: { fullName: true, mobile: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ])

    res.json({ appointments, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[appointments admin GET]', err)
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
})

// ─── GET /api/appointments/today (admin) ─────────────────────────────────────
router.get('/today', async (req, res) => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: { gte: todayStart, lte: todayEnd },
        status: { notIn: ['cancelled'] },
      },
      orderBy: { startTime: 'asc' },
      include: {
        patient: { select: { fullName: true, mobile: true } },
      },
    })
    res.json(appointments)
  } catch (err) {
    console.error('[appointments today]', err)
    res.status(500).json({ error: 'Failed to fetch today schedule' })
  }
})

// ─── PATCH /api/appointments/:id (admin) ─────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { status, notes, cancellationReason } = req.body
    const data = {}
    if (status !== undefined)             data.status             = status
    if (notes !== undefined)              data.notes              = notes
    if (cancellationReason !== undefined) data.cancellationReason = cancellationReason
    if (status === 'cancelled')           data.cancelledAt        = new Date()

    const appt = await prisma.appointment.update({
      where: { id: req.params.id },
      data,
      include: {
        patient: { select: { fullName: true, mobile: true } },
      },
    })
    res.json(appt)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Appointment not found' })
    console.error('[appointments admin PATCH]', err)
    res.status(500).json({ error: 'Failed to update appointment' })
  }
})

module.exports = router
