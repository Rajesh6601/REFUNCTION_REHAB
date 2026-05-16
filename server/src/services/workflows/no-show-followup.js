const prisma = require('../../lib/prisma')
const eventBus = require('../../lib/events')
const { renderTemplate } = require('../notifications/templates')
const { sendWhatsApp } = require('../notifications/whatsapp')

function register() {
  eventBus.on('appointment:no-show', async ({ appointmentId, patientId }) => {
    try {
      const appt = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { id: true, serviceType: true, appointmentDate: true, startTime: true },
      })
      if (!appt) return

      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true, fullName: true, mobile: true, whatsappConsent: true },
      })
      if (!patient || !patient.whatsappConsent) return

      const firstName = patient.fullName.split(' ')[0]
      const { message, templateName } = renderTemplate('noShow', {
        name: firstName,
        serviceType: appt.serviceType,
        date: appt.appointmentDate.toISOString().slice(0, 10),
        time: appt.startTime,
      })

      await sendWhatsApp({
        patientId: patient.id,
        mobile: patient.mobile,
        message,
        type: 'no-show',
        templateName,
        metadata: { appointmentId },
      })
    } catch (err) {
      console.error('[Workflow:no-show-followup]', err)
    }
  })
}

module.exports = { register }
