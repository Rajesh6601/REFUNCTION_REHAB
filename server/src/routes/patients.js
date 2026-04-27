const router      = require('express').Router()
const prisma      = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')

// POST /api/patients/enroll
router.post('/enroll', async (req, res) => {
  try {
    const {
      fullName, dob, age, gender, bloodGroup, nationality, occupation,
      mobile, alternateMobile, email, address, city, state, pinCode,
      emergencyName, emergencyPhone, emergencyRelation,
      programs, sessionType, preferredDays, preferredTime,
      conditions, fitnessLevel, referralSource,
      fitnessGoals, paymentPreference,
      consentGiven, enrolledAt,
    } = req.body

    if (!fullName || !mobile || !gender) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Generate sequential patient ID (RF-0001, RF-0002, …)
    const [{ nextval }] = await prisma.$queryRaw`SELECT nextval('patient_serial_seq')`
    const patientId = `RF-${String(nextval).padStart(4, '0')}`

    const patient = await prisma.patient.create({
      data: {
        id: patientId,
        fullName,
        dob:              dob ? new Date(dob) : null,
        age:              parseInt(age),
        gender,
        bloodGroup:       bloodGroup || null,
        mobile,
        alternateMobile:  alternateMobile || null,
        email:            email || null,
        address:          address || null,
        city:             city || null,
        state:            state || null,
        pinCode:          pinCode || null,
        emergencyName:    emergencyName || null,
        emergencyPhone:   emergencyPhone || null,
        emergencyRelation:emergencyRelation || null,
        program:          Array.isArray(programs) ? programs : [],
        sessionType:      sessionType || 'In-Person',
        preferredDays:    Array.isArray(preferredDays) ? preferredDays : [],
        preferredTime:    preferredTime || '',
        conditions:       Array.isArray(conditions) ? conditions : [],
        fitnessGoals:     Array.isArray(fitnessGoals) ? fitnessGoals : [],
        fitnessLevel:     fitnessLevel || null,
        referralSource:   referralSource || null,
        paymentPreference:paymentPreference || null,
        consentGiven:     Boolean(consentGiven),
        enrolledAt:       enrolledAt ? new Date(enrolledAt) : new Date(),
      },
    })

    res.status(201).json({
      message: 'Enrollment successful',
      patientId: patient.id,
      patient: {
        id:       patient.id,
        fullName: patient.fullName,
        mobile:   patient.mobile,
        enrolledAt: patient.enrolledAt,
      },
    })
  } catch (err) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'mobile'
      if (field === 'mobile') {
        return res.status(409).json({ error: 'A patient with this mobile number is already enrolled' })
      }
      return res.status(409).json({ error: 'Enrollment failed due to a duplicate record. Please try again.' })
    }
    console.error('[enroll]', err)
    res.status(500).json({ error: 'Failed to enroll patient' })
  }
})

// GET /api/patients/search?q=
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || ''
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { mobile:   { contains: q } },
          { id:       { contains: q } },
        ],
      },
      select: {
        id: true, fullName: true, mobile: true, age: true,
        gender: true, program: true, sessionType: true, enrolledAt: true,
      },
      take: 20,
      orderBy: { enrolledAt: 'desc' },
    })
    res.json(patients)
  } catch (err) {
    res.status(500).json({ error: 'Search failed' })
  }
})

// GET /api/patients/:id
router.get('/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!patient) return res.status(404).json({ error: 'Patient not found' })
    res.json(patient)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient' })
  }
})

// PATCH /api/patients/:id — edit patient details
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const {
      fullName, dob, age, gender, bloodGroup,
      mobile, alternateMobile, email, address, city, state, pinCode,
      emergencyName, emergencyPhone, emergencyRelation,
      program, sessionType, preferredDays, preferredTime,
      conditions, fitnessGoals, fitnessLevel, referralSource,
      paymentPreference, enrolledAt,
    } = req.body

    const data = {}
    if (fullName !== undefined)          data.fullName          = fullName
    if (dob !== undefined)               data.dob               = dob ? new Date(dob) : null
    if (age !== undefined)               data.age               = parseInt(age)
    if (gender !== undefined)            data.gender            = gender
    if (bloodGroup !== undefined)        data.bloodGroup        = bloodGroup || null
    if (mobile !== undefined)            data.mobile            = mobile
    if (alternateMobile !== undefined)   data.alternateMobile   = alternateMobile || null
    if (email !== undefined)             data.email             = email || null
    if (address !== undefined)           data.address           = address || null
    if (city !== undefined)              data.city              = city || null
    if (state !== undefined)             data.state             = state || null
    if (pinCode !== undefined)           data.pinCode           = pinCode || null
    if (emergencyName !== undefined)     data.emergencyName     = emergencyName || null
    if (emergencyPhone !== undefined)    data.emergencyPhone    = emergencyPhone || null
    if (emergencyRelation !== undefined) data.emergencyRelation = emergencyRelation || null
    if (program !== undefined)           data.program           = Array.isArray(program) ? program : []
    if (sessionType !== undefined)       data.sessionType       = sessionType
    if (preferredDays !== undefined)     data.preferredDays     = Array.isArray(preferredDays) ? preferredDays : []
    if (preferredTime !== undefined)     data.preferredTime     = preferredTime
    if (conditions !== undefined)        data.conditions        = Array.isArray(conditions) ? conditions : []
    if (fitnessGoals !== undefined)      data.fitnessGoals      = Array.isArray(fitnessGoals) ? fitnessGoals : []
    if (fitnessLevel !== undefined)      data.fitnessLevel      = fitnessLevel || null
    if (referralSource !== undefined)    data.referralSource    = referralSource || null
    if (paymentPreference !== undefined) data.paymentPreference = paymentPreference || null
    if (enrolledAt !== undefined)        data.enrolledAt        = new Date(enrolledAt)

    const patient = await prisma.patient.update({
      where: { id },
      data,
    })

    res.json({ message: 'Patient updated', patient })
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A patient with this mobile number already exists' })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Patient not found' })
    }
    console.error('[patch patient]', err)
    res.status(500).json({ error: 'Failed to update patient' })
  }
})

module.exports = router
