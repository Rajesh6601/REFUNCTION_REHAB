const router      = require('express').Router()
const prisma      = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')

// All admin routes require valid JWT
router.use(requireAuth)

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const now        = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Support optional month/year query params for monthly stats
    const qMonth = req.query.month != null ? parseInt(req.query.month) : now.getMonth()  // 0-indexed
    const qYear  = req.query.year  != null ? parseInt(req.query.year)  : now.getFullYear()
    const monthStart = new Date(qYear, qMonth, 1)
    const monthEnd   = new Date(qYear, qMonth + 1, 1) // first day of next month

    const [
      totalPatients,
      newPatientsToday,
      newPatientsMonth,
      allPayments,
      paymentsToday,
      paymentsMonth,
      pendingPaymentRecords,
      patientsWithNoPayments,
      recentEnrollments,
      recentPayments,
      activePackages,
      visitsToday,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({ where: { enrolledAt: { gte: todayStart } } }),
      prisma.patient.count({ where: { enrolledAt: { gte: monthStart, lt: monthEnd } } }),
      prisma.payment.aggregate({ _sum: { amountPaid: true } }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: todayStart } },
        _sum: { amountPaid: true },
      }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
        _sum: { amountPaid: true },
      }),
      // Payment records with partial/pending status
      prisma.payment.aggregate({
        where: { status: { in: ['partial', 'pending'] } },
        _sum: { balanceDue: true },
        _count: true,
      }),
      // Patients who enrolled but have zero payment records
      prisma.patient.count({
        where: { payments: { none: {} } },
      }),
      prisma.patient.findMany({
        orderBy: { enrolledAt: 'desc' },
        take: 10,
        select: {
          id: true, fullName: true, mobile: true, program: true,
          sessionType: true, enrolledAt: true,
        },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { patient: { select: { fullName: true } } },
      }),
      prisma.treatmentPackage.count({ where: { status: 'active' } }),
      prisma.patientVisit.count({ where: { visitDate: { gte: todayStart } } }),
    ])

    // Packages needing attention: active with <=2 sessions remaining
    const activePackagesWithCounts = await prisma.treatmentPackage.findMany({
      where: { status: 'active' },
      include: {
        patient: { select: { id: true, fullName: true } },
        _count:  { select: { visits: true } },
      },
    })
    const attentionPackages = activePackagesWithCounts
      .filter(p => (p.totalSessions - p._count.visits) <= 2)
      .map(p => ({
        id:             p.id,
        patientId:      p.patient.id,
        patientName:    p.patient.fullName,
        packageName:    p.packageName,
        totalSessions:  p.totalSessions,
        sessionsUsed:   p._count.visits,
        remaining:      p.totalSessions - p._count.visits,
      }))

    // Payment mode breakdown
    const modeBreakdown = await prisma.payment.groupBy({
      by: ['paymentMode'],
      _sum:   { amountPaid: true },
      _count: { id: true },
    })

    res.json({
      totalPatients,
      newPatientsToday,
      newPatientsThisMonth: newPatientsMonth,
      totalRevenue:         allPayments._sum.amountPaid || 0,
      revenueToday:         paymentsToday._sum.amountPaid || 0,
      revenueThisMonth:     paymentsMonth._sum.amountPaid || 0,
      selectedMonth:        qMonth,
      selectedYear:         qYear,
      // Pending = patients with no payments + payment records in partial/pending status
      pendingPaymentsCount: patientsWithNoPayments + (pendingPaymentRecords._count || 0),
      pendingPaymentsValue: pendingPaymentRecords._sum.balanceDue || 0,
      patientsWithNoPayments,
      recentEnrollments,
      recentPayments,
      paymentModeBreakdown: modeBreakdown,
      activePackages,
      visitsToday,
      attentionPackages,
    })
  } catch (err) {
    console.error('[admin dashboard]', err)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

// ─── GET /api/admin/patients ──────────────────────────────────────────────────
router.get('/patients', async (req, res) => {
  try {
    const page    = parseInt(req.query.page)  || 1
    const limit   = parseInt(req.query.limit) || 20
    const search  = req.query.search || ''
    const program = req.query.program || ''
    const from    = req.query.from ? new Date(req.query.from) : undefined
    const to      = req.query.to   ? new Date(req.query.to)   : undefined

    const where = {
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { mobile:   { contains: search } },
          { id:       { contains: search } },
        ],
      }),
      ...(program && { program: { has: program } }),
      ...(from || to ? {
        enrolledAt: {
          ...(from && { gte: from }),
          ...(to   && { lte: to   }),
        },
      } : {}),
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { enrolledAt: 'desc' },
        skip:  (page - 1) * limit,
        take:  limit,
        select: {
          id: true, fullName: true, mobile: true, age: true, gender: true,
          program: true, sessionType: true, city: true, enrolledAt: true,
          _count: { select: { payments: true } },
          packages: {
            where: { status: 'active' },
            take: 3,
            select: {
              id: true, packageName: true, totalSessions: true, status: true,
              _count: { select: { visits: true } },
            },
          },
        },
      }),
      prisma.patient.count({ where }),
    ])

    res.json({ patients, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[admin patients]', err)
    res.status(500).json({ error: 'Failed to fetch patients' })
  }
})

// ─── GET /api/admin/patients/export (CSV) ────────────────────────────────────
router.get('/patients/export', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true, fullName: true, mobile: true, email: true, age: true,
        gender: true, city: true, state: true, program: true,
        sessionType: true, preferredTime: true, enrolledAt: true,
      },
    })

    const header = 'ID,Full Name,Mobile,Email,Age,Gender,City,State,Program,Session Type,Preferred Time,Enrolled At\n'
    const rows   = patients.map(p =>
      [p.id, `"${p.fullName}"`, p.mobile, p.email || '', p.age, p.gender,
       p.city, p.state, `"${p.program.join(';')}"`, p.sessionType,
       p.preferredTime, p.enrolledAt.toISOString()].join(',')
    ).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="patients.csv"')
    res.send(header + rows)
  } catch (err) {
    res.status(500).json({ error: 'Export failed' })
  }
})

// ─── GET /api/admin/payments ──────────────────────────────────────────────────
router.get('/payments', async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1
    const limit  = parseInt(req.query.limit) || 20
    const status = req.query.status || ''
    const mode   = req.query.mode   || ''
    const from   = req.query.from   ? new Date(req.query.from) : undefined
    const to     = req.query.to     ? new Date(req.query.to)   : undefined

    const where = {
      ...(status && { status }),
      ...(mode   && { paymentMode: mode }),
      ...(from || to ? {
        paymentDate: {
          ...(from && { gte: from }),
          ...(to   && { lte: to   }),
        },
      } : {}),
    }

    const [payments, total, summary] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        skip:  (page - 1) * limit,
        take:  limit,
        include: { patient: { select: { fullName: true, mobile: true } } },
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where,
        _sum: { amountPaid: true, balanceDue: true, totalAmount: true },
      }),
    ])

    res.json({
      payments,
      total,
      page,
      pages:        Math.ceil(total / limit),
      totalCollected: summary._sum.amountPaid   || 0,
      totalPending:   summary._sum.balanceDue   || 0,
      totalCharged:   summary._sum.totalAmount  || 0,
    })
  } catch (err) {
    console.error('[admin payments]', err)
    res.status(500).json({ error: 'Failed to fetch payments' })
  }
})

// ─── GET /api/admin/payments/export (CSV) ────────────────────────────────────
router.get('/payments/export', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' },
      include: { patient: { select: { fullName: true, mobile: true } } },
    })

    const header = 'Receipt No,Patient,Mobile,Total Amount,Amount Paid,Balance Due,Payment Mode,Status,Payment Date\n'
    const rows   = payments.map(p =>
      [p.receiptNo, `"${p.patient.fullName}"`, p.patient.mobile,
       p.totalAmount, p.amountPaid, p.balanceDue, p.paymentMode,
       p.status, p.paymentDate.toISOString()].join(',')
    ).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"')
    res.send(header + rows)
  } catch (err) {
    res.status(500).json({ error: 'Export failed' })
  }
})

module.exports = router
