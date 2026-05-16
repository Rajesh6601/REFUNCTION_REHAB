const SITE_URL = 'https://refunctionrehab.in'

const templates = {
  welcome: [
    {
      name: 'welcome_v1',
      text: `Hi {{name}}, welcome to ReFunction Rehab! We're excited to have you on board. Your journey to better health starts now.\n\nBook your first appointment: ${SITE_URL}/book`,
    },
    {
      name: 'welcome_v2',
      text: `Hello {{name}}! Thank you for enrolling with ReFunction Rehab. We look forward to helping you achieve your health goals.\n\nGet started: ${SITE_URL}/book`,
    },
    {
      name: 'welcome_v3',
      text: `Welcome aboard, {{name}}! ReFunction Rehab is here to support your recovery and wellness journey. Let's get started!\n\nBook an appointment: ${SITE_URL}/book`,
    },
  ],

  milestone: [
    {
      name: 'milestone_v1',
      text: `Great progress, {{name}}! You've completed {{visitNumber}} sessions of your {{packageName}} package. Keep up the amazing work!\n\nManage your visits: ${SITE_URL}`,
    },
    {
      name: 'milestone_v2',
      text: `Hi {{name}}, milestone reached! {{visitNumber}} out of {{totalSessions}} sessions done for {{packageName}}. You're doing great!\n\nVisit us: ${SITE_URL}`,
    },
    {
      name: 'milestone_v3',
      text: `{{name}}, congratulations on completing {{visitNumber}} sessions! Your dedication to {{packageName}} is paying off. Stay consistent!\n\nLearn more: ${SITE_URL}`,
    },
  ],

  completion: [
    {
      name: 'completion_v1',
      text: `Congratulations, {{name}}! You've completed all {{totalSessions}} sessions of your {{packageName}} package. We're proud of your commitment!\n\nReady for the next step? Book again: ${SITE_URL}/book`,
    },
    {
      name: 'completion_v2',
      text: `Hi {{name}}, you did it! All {{totalSessions}} sessions of {{packageName}} are done. Your dedication is inspiring!\n\nContinue your journey: ${SITE_URL}/book`,
    },
    {
      name: 'completion_v3',
      text: `{{name}}, package complete! You've finished all {{totalSessions}} sessions of {{packageName}}. Excellent work on your recovery!\n\nEnroll for your next package: ${SITE_URL}/book`,
    },
  ],

  reminder: [
    {
      name: 'reminder_v1',
      text: `Hi {{name}}, this is a reminder for your {{serviceType}} appointment tomorrow at {{time}}. We look forward to seeing you!\n\nView details: ${SITE_URL}`,
    },
    {
      name: 'reminder_v2',
      text: `Hello {{name}}, just a heads up — your {{serviceType}} session is scheduled for tomorrow at {{time}}. See you there!\n\nVisit: ${SITE_URL}`,
    },
    {
      name: 'reminder_v3',
      text: `Reminder: {{name}}, your appointment for {{serviceType}} is tomorrow at {{time}}. Please arrive 5 minutes early.\n\nReFunction Rehab: ${SITE_URL}`,
    },
  ],

  noShow: [
    {
      name: 'noshow_v1',
      text: `Hi {{name}}, we noticed you missed your {{serviceType}} appointment today. We hope everything is okay. Would you like to reschedule?\n\nBook a new slot: ${SITE_URL}/book`,
    },
    {
      name: 'noshow_v2',
      text: `Hello {{name}}, we missed you at your {{serviceType}} session today! Your health matters to us. Let's get you rebooked.\n\nReschedule now: ${SITE_URL}/book`,
    },
    {
      name: 'noshow_v3',
      text: `{{name}}, we noticed you couldn't make it to your {{serviceType}} appointment. No worries — let's find a time that works better for you.\n\nBook again: ${SITE_URL}/book`,
    },
  ],

  reEngagement: [
    {
      name: 'reengagement_v1',
      text: `Hi {{name}}, we haven't seen you at ReFunction Rehab in a while! Your active package is waiting for you. Let's get back on track.\n\nBook your next visit: ${SITE_URL}/book`,
    },
    {
      name: 'reengagement_v2',
      text: `Hello {{name}}, it's been a while since your last visit. Consistency is key to recovery — we'd love to see you again!\n\nSchedule now: ${SITE_URL}/book`,
    },
    {
      name: 'reengagement_v3',
      text: `{{name}}, we miss you! Your treatment package is still active. Don't lose your progress — book your next session today.\n\nBook here: ${SITE_URL}/book`,
    },
    {
      name: 'reengagement_v4',
      text: `Hi {{name}}, your recovery journey isn't over yet! You still have sessions remaining in your package. Let's continue where we left off.\n\nVisit: ${SITE_URL}/book`,
    },
  ],
}

/**
 * Pick a random template of the given type and substitute variables.
 * Returns { message, templateName }.
 */
function renderTemplate(type, vars = {}) {
  const pool = templates[type]
  if (!pool || pool.length === 0) {
    throw new Error(`Unknown template type: ${type}`)
  }

  const tmpl = pool[Math.floor(Math.random() * pool.length)]
  let message = tmpl.text

  for (const [key, value] of Object.entries(vars)) {
    message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }

  return { message, templateName: tmpl.name }
}

module.exports = { renderTemplate }
