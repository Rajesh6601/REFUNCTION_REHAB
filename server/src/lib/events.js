const { EventEmitter } = require('events')

const eventBus = global.__eventBus || new EventEmitter()
eventBus.setMaxListeners(20)

if (process.env.NODE_ENV !== 'production') {
  global.__eventBus = eventBus
}

/**
 * Safely emit an event — errors in listeners never crash HTTP handlers.
 */
eventBus.safeEmit = function (event, data) {
  try {
    this.emit(event, data)
  } catch (err) {
    console.error(`[EventBus] Error emitting "${event}":`, err)
  }
}

module.exports = eventBus
