import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Stethoscope, CalendarDays, CheckCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import { lookupPatient, getAvailableSlots, createAppointment } from '../lib/api'

const STEPS = [
  { label: 'Find Record', icon: Search },
  { label: 'Service',     icon: Stethoscope },
  { label: 'Date & Time', icon: CalendarDays },
  { label: 'Confirm',     icon: CheckCircle },
]

const SERVICES = ['Physiotherapy', 'General Health & Fitness', 'Kids Exercise', 'Post-Surgery Rehab', 'Sports Injury', 'Elderly Care']
const SESSION_TYPES = ['In-Person', 'Online', 'Home Visit']

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

function formatDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function Book() {
  const [searchParams] = useSearchParams()
  const [step, setStep]             = useState(0)
  const [query, setQuery]           = useState('')
  const [patient, setPatient]       = useState(null)
  const [lookupError, setLookupError] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)

  const [serviceType, setServiceType]   = useState('')
  const [sessionType, setSessionType]   = useState('')

  const [calMonth, setCalMonth]     = useState(new Date().getMonth())
  const [calYear, setCalYear]       = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState('')
  const [slotsData, setSlotsData]   = useState(null)
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [selectedSlot, setSelectedSlot] = useState(null)

  const [notes, setNotes]           = useState('')
  const [booking, setBooking]       = useState(null)
  const [bookingError, setBookingError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  // Auto-lookup if patientId is in URL (e.g. from /enroll success)
  useEffect(() => {
    const pid = searchParams.get('patientId')
    if (pid && !patient) {
      setQuery(pid)
      setLookupLoading(true)
      lookupPatient(pid)
        .then((res) => {
          setPatient(res.data)
          setServiceType(res.data.program?.[0] || '')
          setSessionType(res.data.sessionType || 'In-Person')
          setStep(1)
        })
        .catch(() => {
          setLookupError('Could not find patient record. Please search manually.')
        })
        .finally(() => setLookupLoading(false))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Step 0: Lookup
  const handleLookup = async () => {
    if (!query.trim()) return
    setLookupError('')
    setLookupLoading(true)
    try {
      const res = await lookupPatient(query.trim())
      setPatient(res.data)
      setServiceType(res.data.program?.[0] || '')
      setSessionType(res.data.sessionType || 'In-Person')
      setStep(1)
    } catch (err) {
      setLookupError(err.response?.data?.error || 'Patient not found')
    } finally {
      setLookupLoading(false)
    }
  }

  // Step 2: Fetch slots for selected date
  const handleDateClick = async (day) => {
    if (!day) return
    const dateStr = formatDate(calYear, calMonth, day)
    const today = new Date().toISOString().slice(0, 10)
    if (dateStr < today) return

    setSelectedDate(dateStr)
    setSelectedSlot(null)
    setSlotsLoading(true)
    try {
      const res = await getAvailableSlots(dateStr)
      setSlotsData(res.data)
    } catch {
      setSlotsData({ slots: [], blocked: true, reason: 'Failed to load slots' })
    } finally {
      setSlotsLoading(false)
    }
  }

  // Step 3: Confirm booking
  const handleBook = async () => {
    setBookingError('')
    setBookingLoading(true)
    try {
      const res = await createAppointment({
        patientId: patient.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        serviceType,
        sessionType,
        notes: notes || undefined,
      })
      setBooking(res.data)
      setStep(4) // success state
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to book appointment')
    } finally {
      setBookingLoading(false)
    }
  }

  const canGoNext = () => {
    if (step === 1) return serviceType && sessionType
    if (step === 2) return selectedDate && selectedSlot
    return false
  }

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const calDays = buildCalendarDays(calYear, calMonth)

  // Success state
  if (step === 4 && booking) {
    return (
      <PageWrapper>
        <section className="py-24 bg-light min-h-screen flex items-center">
          <div className="max-w-lg mx-auto px-4 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="font-display font-bold text-3xl text-navy mb-3">Appointment Booked!</h2>
              <div className="bg-teal/10 border border-teal/30 rounded-xl px-4 py-3 mb-4 text-sm">
                <span className="text-muted">Booking ID: </span>
                <span className="font-mono font-bold text-teal">{booking.id}</span>
              </div>
              <div className="card p-5 text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Patient</span>
                  <span className="font-medium text-navy">{booking.patient?.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Date</span>
                  <span className="font-medium text-navy">{new Date(booking.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Time</span>
                  <span className="font-medium text-navy">{booking.startTime} - {booking.endTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Service</span>
                  <span className="font-medium text-navy">{booking.serviceType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Session Type</span>
                  <span className="font-medium text-navy">{booking.sessionType}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/" className="btn-primary justify-center">Back to Home</Link>
                <button onClick={() => { setStep(0); setPatient(null); setBooking(null); setSelectedDate(''); setSelectedSlot(null); setNotes(''); setSlotsData(null) }}
                  className="btn-outline justify-center">Book Another</button>
              </div>
            </motion.div>
          </div>
        </section>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <section className="py-12 bg-light min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const active = i === step
              const done = i < step
              return (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    done ? 'bg-teal text-white' : active ? 'bg-navy text-white' : 'bg-white border-2 border-gray-200 text-muted'
                  }`}>
                    {done ? <CheckCircle size={16} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? 'text-navy' : done ? 'text-teal' : 'text-muted'}`}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 w-6 sm:w-10 mx-1 sm:mx-2 rounded ${i < step ? 'bg-teal' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="card p-8"
            >
              {/* STEP 0 — Find Record */}
              {step === 0 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-navy mb-2">Find Your Record</h2>
                  <p className="text-muted text-sm mb-6">Enter your Patient ID or registered mobile number</p>
                  <div className="flex gap-3">
                    <input
                      className="input-field flex-1"
                      placeholder="Patient ID or Mobile Number"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                    />
                    <button
                      onClick={handleLookup}
                      disabled={lookupLoading || !query.trim()}
                      className="btn-primary text-sm py-2.5 px-5 disabled:opacity-60"
                    >
                      {lookupLoading ? 'Searching...' : <><Search size={16} /> Search</>}
                    </button>
                  </div>
                  {lookupError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <div>
                        {lookupError}
                        <div className="mt-2">
                          <Link to="/enroll" className="text-teal font-medium hover:underline">Not enrolled yet? Register here</Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 1 — Select Service */}
              {step === 1 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-navy mb-2">Select Service</h2>
                  <p className="text-muted text-sm mb-6">Welcome back, <strong>{patient?.fullName}</strong></p>

                  <div className="mb-5">
                    <label className="form-label">Service Type <span className="text-red-400">*</span></label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {SERVICES.map(s => (
                        <button
                          key={s} type="button"
                          onClick={() => setServiceType(s)}
                          className={`px-4 py-3 rounded-xl text-sm font-medium border-2 text-left transition-colors ${
                            serviceType === s ? 'bg-teal/10 border-teal text-teal' : 'bg-white border-gray-200 text-text hover:border-teal'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Session Type <span className="text-red-400">*</span></label>
                    <div className="flex gap-3 mt-2">
                      {SESSION_TYPES.map(t => (
                        <button
                          key={t} type="button"
                          onClick={() => setSessionType(t)}
                          className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                            sessionType === t ? 'bg-navy/10 border-navy text-navy' : 'bg-white border-gray-200 text-text hover:border-navy'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 — Pick Date & Time (combined) */}
              {step === 2 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-navy mb-2">Pick Date & Time</h2>
                  <p className="text-muted text-sm mb-6">Select a date, then choose an available time slot</p>

                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={() => {
                      if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
                      else setCalMonth(m => m - 1)
                    }} className="p-2 rounded-lg hover:bg-light transition-colors">
                      <ChevronLeft size={18} className="text-navy" />
                    </button>
                    <span className="font-semibold text-navy">{MONTH_NAMES[calMonth]} {calYear}</span>
                    <button type="button" onClick={() => {
                      if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
                      else setCalMonth(m => m + 1)
                    }} className="p-2 rounded-lg hover:bg-light transition-colors">
                      <ChevronRight size={18} className="text-navy" />
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAY_NAMES.map(d => (
                      <div key={d} className="text-center text-xs font-semibold text-muted py-2">{d}</div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calDays.map((day, i) => {
                      if (!day) return <div key={`e-${i}`} />
                      const dateStr = formatDate(calYear, calMonth, day)
                      const isPast = dateStr < todayStr
                      const isSelected = dateStr === selectedDate
                      const isToday = dateStr === todayStr

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          disabled={isPast}
                          onClick={() => handleDateClick(day)}
                          className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isPast ? 'text-gray-300 cursor-not-allowed' :
                            isSelected ? 'bg-teal text-white' :
                            isToday ? 'bg-navy/10 text-navy hover:bg-teal/20' :
                            'text-navy hover:bg-teal/10'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>

                  {/* Time slots for selected date */}
                  {selectedDate && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      {slotsLoading ? (
                        <p className="text-muted text-sm text-center py-4">Loading available slots...</p>
                      ) : slotsData?.blocked ? (
                        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 text-center">
                          {slotsData.reason || 'This date is unavailable'}
                        </div>
                      ) : slotsData?.slots?.length > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-navy mb-3">
                            Available slots for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {slotsData.slots.map((slot) => {
                              const isFull = slot.available <= 0
                              const isSelected = selectedSlot?.startTime === slot.startTime
                              return (
                                <button
                                  key={slot.startTime}
                                  type="button"
                                  disabled={isFull}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`px-3 py-2.5 rounded-xl text-sm border-2 transition-colors ${
                                    isFull ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' :
                                    isSelected ? 'bg-teal/10 border-teal text-teal' :
                                    'bg-white border-gray-200 text-navy hover:border-teal'
                                  }`}
                                >
                                  <div className="font-semibold">{slot.startTime} - {slot.endTime}</div>
                                  <div className={`text-xs mt-0.5 ${isFull ? 'text-gray-300' : slot.available <= 1 ? 'text-amber-500' : 'text-green-600'}`}>
                                    {isFull ? 'Full' : `${slot.available} spot${slot.available !== 1 ? 's' : ''} left`}
                                  </div>
                                  {slot.label && <div className="text-xs text-muted mt-0.5">{slot.label}</div>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-amber-600 text-center py-4">No available slots on this date. Try another date.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 — Confirm & Book */}
              {step === 3 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-navy mb-6">Confirm Your Appointment</h2>

                  <div className="bg-light rounded-xl p-5 space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Patient</span>
                      <span className="font-medium text-navy">{patient?.fullName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Patient ID</span>
                      <span className="font-mono text-navy">{patient?.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Date</span>
                      <span className="font-medium text-navy">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Time</span>
                      <span className="font-medium text-navy">{selectedSlot?.startTime} - {selectedSlot?.endTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Service</span>
                      <span className="font-medium text-navy">{serviceType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Session Type</span>
                      <span className="font-medium text-navy">{sessionType}</span>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="form-label">Notes (optional)</label>
                    <textarea
                      className="input-field mt-1"
                      rows={3}
                      placeholder="Any special requests or information..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {bookingError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                      {bookingError}
                    </div>
                  )}

                  <button
                    onClick={handleBook}
                    disabled={bookingLoading}
                    className="btn-primary w-full text-sm py-3 justify-center disabled:opacity-60"
                  >
                    {bookingLoading ? 'Booking...' : <><CheckCircle size={16} /> Confirm Appointment</>}
                  </button>
                </div>
              )}

              {/* Nav buttons */}
              {step > 0 && step < 3 && (
                <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="btn-outline text-sm py-2.5 px-5"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    disabled={!canGoNext()}
                    onClick={() => setStep(s => s + 1)}
                    className="btn-primary text-sm py-2.5 px-6 disabled:opacity-40"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
              {step === 3 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="btn-outline text-sm py-2.5 px-5"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  )
}
