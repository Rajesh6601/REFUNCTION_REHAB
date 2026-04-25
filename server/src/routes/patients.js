const router  = require('express').Router()
const prisma  = require('../lib/prisma')

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
      consentGiven,
    } = req.body

    if (!fullName || !mobile || !gender) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const patient = await prisma.patient.create({
      data: {
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
      return res.status(409).json({ error: 'A patient with this mobile number is already enrolled' })
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

module.exports = router
