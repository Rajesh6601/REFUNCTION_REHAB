const router = require('express').Router()
const prisma = require('../lib/prisma')

function generateReceiptNo() {
  const date = new Date()
  const yy   = String(date.getFullYear()).slice(2)
  const mm   = String(date.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `RFR-${yy}${mm}-${rand}`
}

// POST /api/payments
router.post('/', async (req, res) => {
  try {
    const {
      patientId, sessionNo, sessionDate, sessionDuration,
      services, subTotal, gst, totalAmount, amountPaid,
      balanceDue, advancePaid, paymentMode, paymentDate, transactionId,
      paymentDetails, status, remarks, collectedBy, authorisedBy,
    } = req.body

    if (!patientId || !totalAmount || !amountPaid || !paymentMode) {
      return res.status(400).json({ error: 'Missing required payment fields' })
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    if (!patient) return res.status(404).json({ error: 'Patient not found' })

    const payment = await prisma.payment.create({
      data: {
        receiptNo:       generateReceiptNo(),
        patientId,
        sessionNo:       sessionNo ? parseInt(sessionNo) : null,
        sessionDate:     sessionDate ? new Date(sessionDate) : new Date(),
        sessionDuration: sessionDuration || null,
        services:        services || [],
        subTotal:        parseFloat(subTotal) || 0,
        gst:             parseFloat(gst) || 0,
        totalAmount:     parseFloat(totalAmount),
        amountPaid:      parseFloat(amountPaid),
        balanceDue:      parseFloat(balanceDue) || 0,
        advancePaid:     parseFloat(advancePaid) || 0,
        paymentMode,
        paymentDate:     paymentDate ? new Date(paymentDate) : new Date(),
        transactionId:   transactionId || null,
        paymentDetails:  paymentDetails || null,
        status:          status || 'paid',
        remarks:         remarks || null,
        collectedBy:     collectedBy || 'Staff',
        authorisedBy:    authorisedBy || null,
      },
      include: { patient: { select: { fullName: true, mobile: true } } },
    })

    res.status(201).json({
      message:   'Payment recorded successfully',
      paymentId: payment.id,
      receiptNo: payment.receiptNo,
      payment,
    })
  } catch (err) {
    console.error('[payments POST]', err)
    res.status(500).json({ error: 'Failed to record payment' })
  }
})

// GET /api/payments/:id
router.get('/:id', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where:   { id: req.params.id },
      include: { patient: { select: { fullName: true, mobile: true, email: true } } },
    })
    if (!payment) return res.status(404).json({ error: 'Payment not found' })
    res.json(payment)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment' })
  }
})

// GET /api/payments/patient/:patientId
router.get('/patient/:patientId', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where:   { patientId: req.params.patientId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(payments)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' })
  }
})

module.exports = router
