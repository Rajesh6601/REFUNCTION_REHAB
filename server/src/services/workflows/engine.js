const welcomeMessage = require('./welcome-message')
const packageMilestone = require('./package-milestone')
const packageCompletion = require('./package-completion')
const appointmentReminder = require('./appointment-reminder')
const noShowFollowup = require('./no-show-followup')
const inactivePatient = require('./inactive-patient')

function startWorkflowEngine() {
  // Register event-driven workflows
  welcomeMessage.register()
  packageMilestone.register()
  packageCompletion.register()
  noShowFollowup.register()

  // Start cron-based workflows
  appointmentReminder.start()
  inactivePatient.start()

  console.log('[WorkflowEngine] Started — 4 event listeners, 2 cron jobs')
}

module.exports = { startWorkflowEngine }
