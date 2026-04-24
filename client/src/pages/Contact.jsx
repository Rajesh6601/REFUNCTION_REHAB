import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import { sendContact } from '../lib/api'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [apiError, setApiError]   = useState('')
  const [form, setForm]           = useState({ name: '', phone: '', message: '' })

  const wa = "https://wa.me/919900911795?text=Hi%20Dr.%20Neha%2C%20I'd%20like%20to%20book%20a%20physiotherapy%20session."

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setLoading(true)
    try {
      await sendContact(form)
      setSubmitted(true)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="py-16 bg-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-teal text-sm font-semibold uppercase tracking-widest">Get In Touch</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl mt-2 mb-4 text-white">Contact Us</h1>
            <p className="text-white/70 text-lg">
              Ready to start your recovery journey? Reach out to us — we're here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="font-display font-bold text-2xl text-navy mb-8">Clinic Information</h2>

              {/* Batch badge */}
              <div className="flex items-center gap-3 bg-orange/10 border border-orange/20 rounded-2xl p-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-orange" />
                </div>
                <div>
                  <div className="font-semibold text-navy text-sm">Evening Batch Available</div>
                  <div className="text-orange font-bold">7PM – 8PM &nbsp;•&nbsp; <span className="text-sm font-medium">Few Spots Left!</span></div>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                {[
                  {
                    icon: Phone, label: 'Phone', href: 'tel:+919900911795',
                    value: '99009 11795', sub: 'Call us Mon–Sat, 6AM–9PM'
                  },
                  {
                    icon: MessageCircle, label: 'WhatsApp', href: wa,
                    value: 'WhatsApp Chat', sub: 'Quick response guaranteed'
                  },
                  {
                    icon: MapPin, label: 'Location', href: null,
                    value: 'Bengaluru, Karnataka', sub: 'India — full address shared on booking'
                  },
                  {
                    icon: Clock, label: 'Hours', href: null,
                    value: 'Mon–Sat: 6AM – 9PM', sub: 'Sunday: Closed'
                  },
                ].map((item) => {
                  const Icon = item.icon
                  const inner = (
                    <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-teal transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-teal" />
                      </div>
                      <div>
                        <div className="text-xs text-muted mb-0.5">{item.label}</div>
                        <div className="font-semibold text-navy">{item.value}</div>
                        <div className="text-muted text-sm">{item.sub}</div>
                      </div>
                    </div>
                  )
                  return item.href ? (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="block">
                      {inner}
                    </a>
                  ) : <div key={item.label}>{inner}</div>
                })}
              </div>

              {/* Map placeholder */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-muted">
                  <MapPin size={32} className="mx-auto mb-2 text-teal" />
                  <p className="text-sm font-medium">Bengaluru, Karnataka</p>
                  <p className="text-xs mt-1">Map available after booking confirmation</p>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="card p-8">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                    <h3 className="font-display font-bold text-xl text-navy mb-2">Message Sent!</h3>
                    <p className="text-muted">We'll get back to you within 24 hours. You can also WhatsApp us for a faster response.</p>
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 justify-center">
                      <MessageCircle size={18} /> Open WhatsApp
                    </a>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display font-bold text-2xl text-navy mb-2">Send Us a Message</h2>
                    <p className="text-muted text-sm mb-6">We'll get back to you as soon as possible.</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="form-label">Your Name <span className="text-red-400">*</span></label>
                        <input
                          type="text" required
                          className="input-field"
                          placeholder="Enter your full name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Phone Number <span className="text-red-400">*</span></label>
                        <input
                          type="tel" required
                          className="input-field"
                          placeholder="10-digit mobile number"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Message <span className="text-red-400">*</span></label>
                        <textarea
                          required rows={5}
                          className="input-field resize-none"
                          placeholder="Briefly describe your condition or what you're looking for..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />
                      </div>
                      {apiError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                          {apiError}
                        </div>
                      )}
                      <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
                        <Send size={18} /> {loading ? 'Sending…' : 'Send Message'}
                      </button>
                      <p className="text-center text-xs text-muted">
                        Or{' '}
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="text-teal font-medium hover:underline">
                          WhatsApp us directly
                        </a>{' '}
                        for the fastest response.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
