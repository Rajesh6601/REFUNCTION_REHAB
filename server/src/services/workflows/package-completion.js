const prisma = require('../../lib/prisma')
const eventBus = require('../../lib/events')
const { renderTemplate } = require('../notifications/templates')
const { sendWhatsApp } = require('../notifications/whatsapp')

function register() {
  eventBus.on('package:completed', async ({ packageId, patientId }) => {
    try {
      const pkg = await prisma.treatmentPackage.findUnique({
        where: { id: packageId },
        select: { id: true, packageName: true, totalSessions: true },
      })
      if (!pkg) return

      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true, fullName: true, mobile: true, whatsappConsent: true },
      })
      if (!patient || !patient.whatsappConsent) return

      const firstName = patient.fullName.split(' ')[0]
      const { message, templateName } = renderTemplate('completion', {
        name: firstName,
        packageName: pkg.packageName,
        totalSessions: String(pkg.totalSessions),
      })

      await sendWhatsApp({
        patientId: patient.id,
        mobile: patient.mobile,
        message,
        type: 'completion',
        templateName,
        metadata: { packageId },
      })
    } catch (err) {
      console.error('[Workflow:package-completion]', err)
    }
  })
}

module.exports = { register }
