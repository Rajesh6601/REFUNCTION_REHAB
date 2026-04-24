import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ExternalLink, CheckCircle, ChevronRight, ChevronLeft, User, Phone, ClipboardList, Target } from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import { enrollPatient } from '../lib/api'

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScb3KFvvk-iOGo6paLy33IFogSPKgdG9HkLe7AyIjmRVXdZPQ/viewform'

// Schemas per step
const step1Schema = z.object({
  fullName:    z.string().min(2, 'Full name is required'),
  dob:         z.string().min(1, 'Date of birth is required'),
  age:         z.string().min(1, 'Age is required'),
  gender:      z.enum(['Male', 'Female', 'Other', 'Prefer not to say'], { required_error: 'Please select gender' }),
  bloodGroup:  z.string().optional(),
  nationality: z.string().optional(),
  occupation:  z.string().optional(),
})
const step2Schema = z.object({
  mobile:    z.string().min(10, 'Mobile number is required'),
  email:     z.string().email('Enter a valid email').optional().or(z.literal('')),
  address:   z.string().min(5, 'Address is required'),
  city:      z.string().min(2, 'City is required'),
  state:     z.string().min(2, 'State is required'),
  pinCode:   z.string().optional(),
  emergencyName:     z.string().min(2, 'Emergency contact name is required'),
  emergencyPhone:    z.string().min(10, 'Emergency contact number is required'),
  emergencyRelation: z.string().min(2, 'Relationship is required'),
})
const step3Schema = z.object({
  sessionType:   z.enum(['In-Person', 'Online', 'Home Visit'], { required_error: 'Please select session type' }),
  preferredTime: z.string().min(1, 'Select a preferred time'),
})
const step4Schema = z.object({
  fitnessLevel:   z.enum(['Beginner', 'Intermediate', 'Advanced'], { required_error: 'Please select fitness level' }),
  referralSource: z.string().optional(),
})

const schemas = [step1Schema, step2Schema, step3Schema, step4Schema]

const STEPS = [
  { label: 'Personal',   icon: User },
  { label: 'Contact',    icon: Phone },
  { label: 'Program',    icon: ClipboardList },
  { label: 'Goals',      icon: Target },
]

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="form-label">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}

function Select({ className = '', ...props }) {
  return (
    <select className={`input-field ${className}`} {...props} />
  )
}

export default function Enroll() {
  const [mode, setMode]             = useState(null)
  const [step, setStep]             = useState(0)
  const [stepData, setStepData]     = useState({})
  const [programs, setPrograms]     = useState([])
  const [preferredDays, setDays]    = useState([])
  const [conditions, setConditions] = useState([])
  const [goals, setGoals]           = useState([])
  const [submitted, setSubmitted]   = useState(false)
  const [enrolledId, setEnrolledId] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [apiError, setApiError]     = useState('')

  const {
    register, handleSubmit, formState: { errors }, trigger, getValues,
  } = useForm({ resolver: zodResolver(schemas[step]), mode: 'onChange' })

  const toggleArr = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])

  const onNext = async () => {
    const valid = await trigger()
    if (valid) {
      setStepData((prev) => ({ ...prev, ...getValues() }))
      setStep((s) => s + 1)
    }
  }

  const onSubmit = async (data) => {
    setApiError('')
    setLoading(true)
    try {
      const payload = {
        ...stepData,
        ...data,
        programs,
        preferredDays,
        conditions,
        fitnessGoals: goals,
      }
      const res = await enrollPatient(payload)
      setEnrolledId(res.data.patientId)
      setSubmitted(true)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!mode) {
    return (
      <PageWrapper>
        <section className="py-20 bg-light min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12">
              <span className="text-teal font-semibold text-sm uppercase tracking-widest">Join Us</span>
              <h1 className="font-display font-bold text-4xl md:text-5xl text-navy mt-2 mb-4">
                Patient Enrollment
              </h1>
              <p className="text-muted text-lg max-w-xl mx-auto">
                Choose how you'd like to enroll with ReFunction Rehab.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-6">
              <motion.div
                className="card p-8 text-center cursor-pointer border-2 border-transparent hover:border-teal transition-colors"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                onClick={() => setMode('quick')}
              >
                <div className="w-14 h-14 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
                  <ExternalLink size={24} className="text-teal" />
                </div>
                <h2 className="font-display font-bold text-xl text-navy mb-2">Quick Enroll</h2>
                <p className="text-muted text-sm mb-6">
                  Fill out our Google Form — quick, simple, and mobile-friendly.
                </p>
                <span className="btn-teal justify-center">Open Google Form</span>
              </motion.div>
              <motion.div
                className="card p-8 text-center cursor-pointer border-2 border-transparent hover:border-orange transition-colors"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                onClick={() => setMode('full')}
              >
                <div className="w-14 h-14 rounded-full bg-orange/10 flex items-center justify-center mx-auto mb-4">
                  <ClipboardList size={24} className="text-orange" />
                </div>
                <h2 className="font-display font-bold text-xl text-navy mb-2">Full Registration</h2>
                <p className="text-muted text-sm mb-6">
                  Complete patient profile with medical history, goals, and consent. All data stays private.
                </p>
                <span className="btn-primary justify-center">Start Registration</span>
              </motion.div>
            </div>
          </div>
        </section>
      </PageWrapper>
    )
  }

  if (mode === 'quick') {
    return (
      <PageWrapper>
        <section className="py-12 bg-light min-h-screen">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setMode(null)} className="text-teal text-sm hover:underline flex items-center gap-1">
                ← Back
              </button>
              <span className="text-muted text-sm">Quick Enrollment</span>
            </div>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-navy p-5 text-white">
                <h2 className="font-display font-bold text-xl">Patient Enrollment Form</h2>
                <p className="text-white/70 text-sm mt-1">ReFunction Rehab — Dr. Neha Trivedi</p>
              </div>
              <div className="p-4">
                <iframe
                  src={GOOGLE_FORM_URL}
                  width="100%"
                  height="700"
                  frameBorder="0"
                  marginHeight="0"
                  marginWidth="0"
                  title="Patient Enrollment Form"
                  className="rounded-lg"
                  style={{ minHeight: '700px' }}
                >
                  Loading form...
                </iframe>
              </div>
            </div>
          </div>
        </section>
      </PageWrapper>
    )
  }

  // Full multi-step form
  if (submitted) {
    return (
      <PageWrapper>
        <section className="py-24 bg-light min-h-screen flex items-center">
          <div className="max-w-lg mx-auto px-4 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <div className="w-20 h-20 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="font-display font-bold text-3xl text-navy mb-3">Enrollment Submitted!</h2>
              {enrolledId && (
                <div className="bg-teal/10 border border-teal/30 rounded-xl px-4 py-3 mb-4 text-sm">
                  <span className="text-muted">Your Patient ID: </span>
                  <span className="font-mono font-bold text-teal">{enrolledId}</span>
                  <p className="text-xs text-muted mt-1">Save this ID for future appointments and payments.</p>
                </div>
              )}
              <p className="text-muted mb-4">
                Thank you for enrolling with ReFunction Rehab. Dr. Neha's team will contact you within 24 hours to confirm your session.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
                <strong>Payment is optional right now.</strong> You can pay at any time later using your Patient ID or mobile number on the Payment page.
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/" className="btn-primary justify-center">Back to Home</Link>
                <Link to={`/payment${enrolledId ? `?patientId=${enrolledId}` : ''}`} className="btn-outline justify-center">Proceed to Payment</Link>
              </div>
            </motion.div>
          </div>
        </section>
      </PageWrapper>
    )
  }

  const PROGRAMS = ['Physiotherapy', 'General Health & Fitness', 'Kids Exercise', 'Post-Surgery Rehab', 'Sports Injury', 'Elderly Care', 'Other']
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const TIMES = ['Morning 6–9AM', 'Mid-Morning 9–12', 'Afternoon 12–3', 'Evening 3–6', 'Late Evening 6–9PM']
  const CONDITIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Arthritis', 'Osteoporosis', 'Asthma', 'Neurological Disorder', 'None']
  const GOALS = ['Pain Relief', 'Improved Mobility', 'Weight Management', 'Strength Building', 'Post-Surgery Recovery', 'Stress Relief', 'General Fitness', 'Kids Physical Development']

  return (
    <PageWrapper>
      <section className="py-12 bg-light min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          {/* Back */}
          <button onClick={() => setMode(null)} className="text-teal text-sm hover:underline flex items-center gap-1 mb-6">
            ← Back to options
          </button>

          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const active = i === step
              const done   = i < step
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="card p-8"
              >
                {/* STEP 1 — Personal */}
                {step === 0 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-navy mb-6">Personal Information</h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <Field label="Full Name" error={errors.fullName?.message} required>
                          <input {...register('fullName')} className={`input-field ${errors.fullName ? 'input-error' : ''}`} placeholder="Enter your full name" />
                        </Field>
                      </div>
                      <Field label="Date of Birth" error={errors.dob?.message} required>
                        <input type="date" {...register('dob')} className={`input-field ${errors.dob ? 'input-error' : ''}`} />
                      </Field>
                      <Field label="Age" error={errors.age?.message} required>
                        <input type="number" {...register('age')} className={`input-field ${errors.age ? 'input-error' : ''}`} placeholder="Age" min="1" max="120" />
                      </Field>
                      <Field label="Gender" error={errors.gender?.message} required>
                        <Select {...register('gender')} className={errors.gender ? 'input-error' : ''}>
                          <option value="">Select gender</option>
                          <option>Male</option><option>Female</option>
                          <option>Other</option><option>Prefer not to say</option>
                        </Select>
                      </Field>
                      <Field label="Blood Group" error={errors.bloodGroup?.message}>
                        <Select {...register('bloodGroup')}>
                          <option value="">Select (optional)</option>
                          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
                        </Select>
                      </Field>
                      <Field label="Occupation">
                        <input {...register('occupation')} className="input-field" placeholder="e.g. Software Engineer" />
                      </Field>
                      <Field label="Nationality">
                        <input {...register('nationality')} className="input-field" placeholder="e.g. Indian" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* STEP 2 — Contact */}
                {step === 1 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-navy mb-6">Contact & Emergency</h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Mobile Number" error={errors.mobile?.message} required>
                        <input {...register('mobile')} className={`input-field ${errors.mobile ? 'input-error' : ''}`} placeholder="10-digit mobile number" />
                      </Field>
                      <Field label="Email Address" error={errors.email?.message}>
                        <input type="email" {...register('email')} className={`input-field ${errors.email ? 'input-error' : ''}`} placeholder="email@example.com" />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Home Address" error={errors.address?.message} required>
                          <input {...register('address')} className={`input-field ${errors.address ? 'input-error' : ''}`} placeholder="Street, Area" />
                        </Field>
                      </div>
                      <Field label="City" error={errors.city?.message} required>
                        <input {...register('city')} className={`input-field ${errors.city ? 'input-error' : ''}`} placeholder="City" />
                      </Field>
                      <Field label="State" error={errors.state?.message} required>
                        <input {...register('state')} className={`input-field ${errors.state ? 'input-error' : ''}`} placeholder="State" defaultValue="Karnataka" />
                      </Field>
                      <Field label="Pin Code">
                        <input {...register('pinCode')} className="input-field" placeholder="6-digit pin code" />
                      </Field>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="font-semibold text-navy mb-4">Emergency Contact</h3>
                      <div className="grid sm:grid-cols-3 gap-5">
                        <Field label="Name" error={errors.emergencyName?.message} required>
                          <input {...register('emergencyName')} className={`input-field ${errors.emergencyName ? 'input-error' : ''}`} placeholder="Contact name" />
                        </Field>
                        <Field label="Phone" error={errors.emergencyPhone?.message} required>
                          <input {...register('emergencyPhone')} className={`input-field ${errors.emergencyPhone ? 'input-error' : ''}`} placeholder="Mobile number" />
                        </Field>
                        <Field label="Relationship" error={errors.emergencyRelation?.message} required>
                          <input {...register('emergencyRelation')} className={`input-field ${errors.emergencyRelation ? 'input-error' : ''}`} placeholder="e.g. Spouse" />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 — Program */}
                {step === 2 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-navy mb-6">Program Selection</h2>
                    <div className="mb-5">
                      <label className="form-label">Type of Program <span className="text-red-400">*</span></label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {PROGRAMS.map((p) => (
                          <button
                            key={p} type="button"
                            onClick={() => toggleArr(programs, setPrograms, p)}
                            className={`px-3 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                              programs.includes(p) ? 'bg-teal border-teal text-white' : 'bg-white border-gray-200 text-text hover:border-teal'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Session Type" error={errors.sessionType?.message} required>
                        <Select {...register('sessionType')} className={errors.sessionType ? 'input-error' : ''}>
                          <option value="">Select</option>
                          <option>In-Person</option><option>Online</option><option>Home Visit</option>
                        </Select>
                      </Field>
                      <Field label="Preferred Time" error={errors.preferredTime?.message} required>
                        <Select {...register('preferredTime')} className={errors.preferredTime ? 'input-error' : ''}>
                          <option value="">Select</option>
                          {TIMES.map(t => <option key={t}>{t}</option>)}
                        </Select>
                      </Field>
                    </div>
                    <div className="mt-5">
                      <label className="form-label">Preferred Days</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {DAYS.map((d) => (
                          <button
                            key={d} type="button"
                            onClick={() => toggleArr(preferredDays, setDays, d)}
                            className={`w-12 h-12 rounded-xl text-sm font-semibold border-2 transition-colors ${
                              preferredDays.includes(d) ? 'bg-navy border-navy text-white' : 'bg-white border-gray-200 text-text hover:border-navy'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5">
                      <label className="form-label">Existing Medical Conditions (if any)</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {CONDITIONS.map((c) => (
                          <button
                            key={c} type="button"
                            onClick={() => toggleArr(conditions, setConditions, c)}
                            className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
                              conditions.includes(c) ? 'bg-orange border-orange text-white' : 'bg-white border-gray-200 text-text hover:border-orange'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 — Goals */}
                {step === 3 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-navy mb-6">Goals & Preferences</h2>
                    <div className="mb-5">
                      <label className="form-label">Your Health Goals</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {GOALS.map((g) => (
                          <button
                            key={g} type="button"
                            onClick={() => toggleArr(goals, setGoals, g)}
                            className={`px-3 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                              goals.includes(g) ? 'bg-teal border-teal text-white' : 'bg-white border-gray-200 text-text hover:border-teal'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Fitness Level" error={errors.fitnessLevel?.message} required>
                        <Select {...register('fitnessLevel')} className={errors.fitnessLevel ? 'input-error' : ''}>
                          <option value="">Select</option>
                          <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                        </Select>
                      </Field>
                      <Field label="How did you hear about us?">
                        <Select {...register('referralSource')}>
                          <option value="">Select (optional)</option>
                          {['Social Media', 'Friend/Family', 'Doctor Referral', 'Online Search', 'Advertisement', 'Other'].map(s => <option key={s}>{s}</option>)}
                        </Select>
                      </Field>
                    </div>
                    {/* Consent */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="font-semibold text-navy mb-4">Consent Declaration</h3>
                      <div className="space-y-3">
                        {[
                          'I confirm all information provided is accurate and complete.',
                          'I consent to physiotherapy assessment and treatment by ReFunction Rehab.',
                          'I agree that my medical information will be kept confidential.',
                          'I understand that results may vary and there are no guarantees.',
                        ].map((text, i) => (
                          <label key={i} className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" required className="mt-1 w-4 h-4 accent-teal" />
                            <span className="text-sm text-muted">{text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {apiError && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    {apiError}
                  </div>
                )}

                {/* Nav buttons */}
                <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="btn-outline text-sm py-2.5 px-5"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                  ) : <span />}

                  {step < STEPS.length - 1 ? (
                    <button type="button" onClick={onNext} className="btn-primary text-sm py-2.5 px-6">
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button type="submit" disabled={loading} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-60">
                      {loading ? 'Submitting…' : <><CheckCircle size={16} /> Submit Enrollment</>}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </form>
        </div>
      </section>
    </PageWrapper>
  )
}
