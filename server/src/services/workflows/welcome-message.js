const prisma = require('../../lib/prisma')
const eventBus = require('../../lib/events')
const { renderTemplate } = require('../notifications/templates')
const { sendWhatsApp } = require('../notifications/whatsapp')

function register() {
  eventBus.on('patient:enrolled', async ({ patientId }) => {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true, fullName: true, mobile: true, whatsappConsent: true },
      })

      if (!patient || !patient.whatsappConsent) return

      // Deduplicate: skip if a welcome notification was already sent/pending for this patient
      const existing = await prisma.notification.findFirst({
        where: { patientId: patient.id, type: 'welcome' },
      })
      if (existing) return

      const firstName = patient.fullName.split(' ')[0]
      const { message, templateName } = renderTemplate('welcome', { name: firstName })

      await sendWhatsApp({
        patientId: patient.id,
        mobile: patient.mobile,
        message,
        type: 'welcome',
        templateName,
      })
    } catch (err) {
      console.error('[Workflow:welcome-message]', err)
    }
  })
}

module.exports = { register }
