import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getPatient, updatePatient } from '../../lib/api'

const PROGRAMS   = ['Physiotherapy', 'General Health & Fitness', 'Kids Exercise', 'Post-Surgery Rehab', 'Sports Injury', 'Elderly Care', 'Other']
const DAYS       = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIMES      = ['Morning 6–9AM', 'Mid-Morning 9–12', 'Afternoon 12–3', 'Evening 3–6', 'Late Evening 6–9PM']
const CONDITIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Arthritis', 'Osteoporosis', 'Asthma', 'Neurological Disorder', 'None']
const GOALS      = ['Pain Relief', 'Improved Mobility', 'Weight Management', 'Strength Building', 'Post-Surgery Recovery', 'Stress Relief', 'General Fitness', 'Kids Physical Development']

function Field({ label, required, children }) {
  return (
    <div>
      <label className="form-label">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Select({ className = '', ...props }) {
  return <select className={`input-field ${className}`} {...props} />
}

export default function EditPatient() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm]       = useState(null)
  const [programs, setPrograms]     = useState([])
  const [preferredDays, setDays]    = useState([])
  const [conditions, setConditions] = useState([])
  const [goals, setGoals]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getPatient(id)
        const p = res.data
        setForm({
          fullName:          p.fullName || '',
          dob:               p.dob ? p.dob.slice(0, 10) : '',
          age:               p.age?.toString() || '',
          gender:            p.gender || '',
          bloodGroup:        p.bloodGroup || '',
          mobile:            p.mobile || '',
          alternateMobile:   p.alternateMobile || '',
          email:             p.email || '',
          address:           p.address || '',
          city:              p.city || '',
          state:             p.state || '',
          pinCode:           p.pinCode || '',
          emergencyName:     p.emergencyName || '',
          emergencyPhone:    p.emergencyPhone || '',
          emergencyRelation: p.emergencyRelation || '',
          sessionType:       p.sessionType || 'In-Person',
          preferredTime:     p.preferredTime || '',
          fitnessLevel:      p.fitnessLevel || '',
          referralSource:    p.referralSource || '',
          paymentPreference: p.paymentPreference || '',
          enrolledAt:        p.enrolledAt ? p.enrolledAt.slice(0, 10) : '',
        })
        setPrograms(p.program || [])
        setDays(p.preferredDays || [])
        setConditions(p.conditions || [])
        setGoals(p.fitnessGoals || [])
      } catch {
        setError('Failed to load patient')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const toggleArr = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await updatePatient(id, {
        ...form,
        age: parseInt(form.age),
        program: programs,
        preferredDays,
        conditions,
        fitnessGoals: goals,
      })
      navigate('/admin/patients')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update patient')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-24 text-muted">Loading patient…</div>
      </AdminLayout>
    )
  }

  if (!form) {
    return (
      <AdminLayout>
        <div className="text-center py-24 text-red-500">{error || 'Patient not found'}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/patients" className="p-2 rounded-lg hover:bg-light transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-navy">Edit Patient</h1>
            <p className="text-muted text-sm mt-0.5">ID: {id}</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="card p-8 mb-5">
            <h2 className="font-display font-bold text-xl text-navy mb-5">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Field label="Full Name" required>
                  <input className="input-field" value={form.fullName} onChange={set('fullName')} />
                </Field>
              </div>
              <Field label="Date of Birth">
                <input type="date" className="input-field" value={form.dob} onChange={set('dob')} />
              </Field>
              <Field label="Age" required>
                <input type="number" className="input-field" value={form.age} onChange={set('age')} min="1" max="120" />
              </Field>
              <Field label="Gender" required>
                <Select value={form.gender} onChange={set('gender')}>
                  <option value="">Select gender</option>
                  <option>Male</option><option>Female</option>
                  <option>Other</option><option>Prefer not to say</option>
                </Select>
              </Field>
              <Field label="Blood Group">
                <Select value={form.bloodGroup} onChange={set('bloodGroup')}>
                  <option value="">Select (optional)</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
                </Select>
              </Field>
              <Field label="Enrollment Date">
                <input type="date" className="input-field" value={form.enrolledAt} onChange={set('enrolledAt')} />
              </Field>
            </div>
          </div>

          {/* Contact & Emergency */}
          <div className="card p-8 mb-5">
            <h2 className="font-display font-bold text-xl text-navy mb-5">Contact & Emergency</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Mobile Number" required>
                <input className="input-field" value={form.mobile} onChange={set('mobile')} />
              </Field>
              <Field label="Alternate Mobile">
                <input className="input-field" value={form.alternateMobile} onChange={set('alternateMobile')} />
              </Field>
              <Field label="Email Address">
                <input type="email" className="input-field" value={form.email} onChange={set('email')} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Home Address">
                  <input className="input-field" value={form.address} onChange={set('address')} />
                </Field>
              </div>
              <Field label="City">
                <input className="input-field" value={form.city} onChange={set('city')} />
              </Field>
              <Field label="State">
                <input className="input-field" value={form.state} onChange={set('state')} />
              </Field>
              <Field label="Pin Code">
                <input className="input-field" value={form.pinCode} onChange={set('pinCode')} />
              </Field>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-navy mb-4">Emergency Contact</h3>
              <div className="grid sm:grid-cols-3 gap-5">
                <Field label="Name">
                  <input className="input-field" value={form.emergencyName} onChange={set('emergencyName')} />
                </Field>
                <Field label="Phone">
                  <input className="input-field" value={form.emergencyPhone} onChange={set('emergencyPhone')} />
                </Field>
                <Field label="Relationship">
                  <input className="input-field" value={form.emergencyRelation} onChange={set('emergencyRelation')} />
                </Field>
              </div>
            </div>
          </div>

          {/* Program Selection */}
          <div className="card p-8 mb-5">
            <h2 className="font-display font-bold text-xl text-navy mb-5">Program Selection</h2>
            <div className="mb-5">
              <label className="form-label">Type of Program</label>
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
              <Field label="Session Type">
                <Select value={form.sessionType} onChange={set('sessionType')}>
                  <option value="">Select</option>
                  <option>In-Person</option><option>Online</option><option>Home Visit</option>
                </Select>
              </Field>
              <Field label="Preferred Time">
                <Select value={form.preferredTime} onChange={set('preferredTime')}>
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
              <label className="form-label">Existing Medical Conditions</label>
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

          {/* Goals & Preferences */}
          <div className="card p-8 mb-5">
            <h2 className="font-display font-bold text-xl text-navy mb-5">Goals & Preferences</h2>
            <div className="mb-5">
              <label className="form-label">Health Goals</label>
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
              <Field label="Fitness Level">
                <Select value={form.fitnessLevel} onChange={set('fitnessLevel')}>
                  <option value="">Select</option>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </Select>
              </Field>
              <Field label="Referral Source">
                <Select value={form.referralSource} onChange={set('referralSource')}>
                  <option value="">Select (optional)</option>
                  {['Social Media', 'Friend/Family', 'Doctor Referral', 'Online Search', 'Advertisement', 'Other'].map(s => <option key={s}>{s}</option>)}
                </Select>
              </Field>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Link to="/admin/patients" className="btn-outline text-sm py-2.5 px-5">Cancel</Link>
            <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5 px-6 disabled:opacity-60">
              {saving ? 'Saving…' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
