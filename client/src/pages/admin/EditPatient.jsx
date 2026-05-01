import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Save, ArrowLeft, Package, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getPatient, updatePatient, getPatientPackages, recordVisit, deleteVisit } from '../../lib/api'

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

  // Package state
  const [packages, setPackages]       = useState([])
  const [pkgLoading, setPkgLoading]   = useState(false)
  const [expandedPkg, setExpandedPkg] = useState(null)
  const [visitForm, setVisitForm]     = useState(null) // packageId being marked
  const [visitDate, setVisitDate]     = useState(new Date().toISOString().split('T')[0])
  const [visitNotes, setVisitNotes]   = useState('')
  const [visitSaving, setVisitSaving] = useState(false)

  const fetchPackages = async () => {
    setPkgLoading(true)
    try {
      const res = await getPatientPackages(id)
      // Sort: active first, then completed, then expired
      const order = { active: 0, completed: 1, expired: 2 }
      const sorted = [...res.data].sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3))
      setPackages(sorted)
    } catch { /* ignore */ }
    finally { setPkgLoading(false) }
  }

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
    fetchPackages()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const toggleArr = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])

  const handleMarkVisit = async (pkgId) => {
    setVisitSaving(true)
    try {
      await recordVisit(pkgId, { visitDate, treatmentNotes: visitNotes })
      setVisitForm(null)
      setVisitNotes('')
      setVisitDate(new Date().toISOString().split('T')[0])
      await fetchPackages()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record visit')
    } finally {
      setVisitSaving(false)
    }
  }

  const handleDeleteVisit = async (pkgId, visitId) => {
    if (!window.confirm('Delete this visit?')) return
    try {
      await deleteVisit(pkgId, visitId)
      await fetchPackages()
    } catch {
      alert('Failed to delete visit')
    }
  }

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

        {/* Packages & Visits */}
        <div className="card p-8 mt-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-navy flex items-center gap-2">
              <Package size={22} className="text-teal" /> Packages & Visits
            </h2>
            <Link to={`/payment?patientId=${id}`} className="btn-teal text-sm py-2 px-4">
              <Plus size={15} /> New Package
            </Link>
          </div>

          {pkgLoading ? (
            <p className="text-muted text-sm text-center py-8">Loading packages...</p>
          ) : packages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted text-sm mb-3">No treatment packages yet.</p>
              <Link to={`/payment?patientId=${id}`} className="text-teal text-sm font-medium hover:underline">
                Create a package via Payment page
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => {
                const visitsDone = pkg._count?.visits ?? pkg.visits?.length ?? 0
                const remaining  = pkg.totalSessions - visitsDone
                const pct        = pkg.totalSessions > 0 ? Math.round((visitsDone / pkg.totalSessions) * 100) : 0
                const isExpanded = expandedPkg === pkg.id
                const statusColor = pkg.status === 'active' ? 'bg-green-100 text-green-700'
                  : pkg.status === 'completed' ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-100 text-red-700'

                return (
                  <div key={pkg.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Package header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-light transition-colors"
                      onClick={() => setExpandedPkg(isExpanded ? null : pkg.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div>
                          <div className="font-semibold text-navy text-sm flex items-center gap-2">
                            {pkg.packageName}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                              {pkg.status}
                            </span>
                          </div>
                          <div className="text-xs text-muted mt-0.5">
                            {visitsDone} / {pkg.totalSessions} sessions
                            {pkg.payment?.receiptNo && <> &middot; {pkg.payment.receiptNo}</>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {pkg.status === 'active' && remaining <= 2 && remaining > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            <AlertTriangle size={12} /> {remaining} left
                          </span>
                        )}
                        {/* Progress bar */}
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pkg.status === 'completed' ? 'bg-blue-500' :
                              pkg.status === 'expired' ? 'bg-red-400' : 'bg-teal'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-light/50">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                          <div>
                            <span className="text-muted text-xs">Start Date</span>
                            <div className="font-medium text-navy">{new Date(pkg.startDate).toLocaleDateString('en-IN')}</div>
                          </div>
                          <div>
                            <span className="text-muted text-xs">Expiry</span>
                            <div className="font-medium text-navy">{pkg.expiryDate ? new Date(pkg.expiryDate).toLocaleDateString('en-IN') : 'None'}</div>
                          </div>
                          <div>
                            <span className="text-muted text-xs">Remaining</span>
                            <div className="font-medium text-navy">{remaining} sessions</div>
                          </div>
                          <div>
                            <span className="text-muted text-xs">Receipt</span>
                            <div className="font-medium text-navy">{pkg.payment?.receiptNo || '—'}</div>
                          </div>
                        </div>

                        {/* Mark Visit button (active only) */}
                        {pkg.status === 'active' && (
                          <div className="mb-4">
                            {visitForm === pkg.id ? (
                              <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-3">
                                <div className="grid sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="form-label text-xs">Visit Date</label>
                                    <input type="date" className="input-field text-sm" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                                  </div>
                                  <div>
                                    <label className="form-label text-xs">Treatment Notes</label>
                                    <input className="input-field text-sm" placeholder="Notes..." value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    disabled={visitSaving}
                                    onClick={() => handleMarkVisit(pkg.id)}
                                    className="btn-teal text-xs py-2 px-3 disabled:opacity-60"
                                  >
                                    {visitSaving ? 'Saving...' : 'Confirm Visit'}
                                  </button>
                                  <button type="button" onClick={() => setVisitForm(null)} className="btn-outline text-xs py-2 px-3">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setVisitForm(pkg.id)}
                                className="btn-teal text-xs py-2 px-3"
                              >
                                <Plus size={14} /> Mark Visit
                              </button>
                            )}
                          </div>
                        )}

                        {/* Visit log table */}
                        {pkg.visits && pkg.visits.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-muted uppercase border-b border-gray-200">
                                  <th className="text-left py-2 pr-3">Visit #</th>
                                  <th className="text-left py-2 pr-3">Date</th>
                                  <th className="text-left py-2 pr-3">Notes</th>
                                  <th className="text-left py-2 pr-3">Marked By</th>
                                  <th className="py-2 w-10"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {pkg.visits.map((v) => (
                                  <tr key={v.id} className="border-b border-gray-100">
                                    <td className="py-2 pr-3 font-medium text-navy">{v.visitNumber}</td>
                                    <td className="py-2 pr-3 text-muted">{new Date(v.visitDate).toLocaleDateString('en-IN')}</td>
                                    <td className="py-2 pr-3 text-muted">{v.treatmentNotes || '—'}</td>
                                    <td className="py-2 pr-3 text-muted">{v.markedBy || '—'}</td>
                                    <td className="py-2">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteVisit(pkg.id, v.id)}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-muted text-xs text-center py-4">No visits recorded yet</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
