import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Star, Check, XCircle, Eye, Trash2, Edit3,
  Award, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getAdminTestimonials, createTestimonial,
  updateTestimonial, deleteTestimonial,
} from '../../lib/api'

const serviceOptions = [
  { value: 'seniors',          label: 'Physiotherapy for Seniors' },
  { value: 'womens-health',    label: "Women's Health" },
  { value: 'pain-management',  label: 'Pain Management' },
  { value: 'sports-rehab',     label: 'Sports Injury Rehab' },
  { value: 'post-surgery',     label: 'Post-Surgery Rehab' },
  { value: 'kids',             label: 'Kids Exercise Program' },
]

const emptyForm = {
  patientName: '', patientInitials: '', age: '', gender: '',
  condition: '', service: '', rating: 5, reviewText: '',
  videoUrl: '', photoUrl: '', treatmentDuration: '', outcome: '',
  consentGiven: false,
}

function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={22} style={n <= value ? { color: '#F5A623', fill: '#F5A623' } : { color: '#D1D5DB' }} />
        </button>
      ))}
    </div>
  )
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [pages, setPages]               = useState(1)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  // Filters
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterService, setFilterService] = useState('')

  // Modal
  const [showModal, setShowModal]       = useState(false)
  const [editingId, setEditingId]       = useState(null)
  const [form, setForm]                 = useState({ ...emptyForm })
  const [saving, setSaving]             = useState(false)
  const [formError, setFormError]       = useState('')

  // Selected for bulk actions
  const [selected, setSelected]         = useState(new Set())

  const fetchList = () => {
    setLoading(true)
    getAdminTestimonials({ page, limit: 15, status: filterStatus, service: filterService })
      .then((res) => {
        setTestimonials(res.data.testimonials || [])
        setTotal(res.data.total || 0)
        setPages(res.data.pages || 1)
      })
      .catch(() => setError('Failed to load testimonials'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [page, filterStatus, filterService])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (t) => {
    setEditingId(t.id)
    setForm({
      patientName:       t.patientName,
      patientInitials:   t.patientInitials || '',
      age:               t.age || '',
      gender:            t.gender || '',
      condition:         t.condition,
      service:           t.service,
      rating:            t.rating,
      reviewText:        t.reviewText,
      videoUrl:          t.videoUrl || '',
      photoUrl:          t.photoUrl || '',
      treatmentDuration: t.treatmentDuration || '',
      outcome:           t.outcome || '',
      consentGiven:      t.consentGiven,
    })
    setFormError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.patientName || !form.condition || !form.service || !form.reviewText) {
      setFormError('Patient name, condition, service, and review text are required.')
      return
    }
    if (!form.consentGiven) {
      setFormError('Patient consent is mandatory.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editingId) {
        await updateTestimonial(editingId, form)
      } else {
        await createTestimonial(form)
      }
      setShowModal(false)
      fetchList()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const toggleApprove = async (t) => {
    try {
      await updateTestimonial(t.id, { isApproved: !t.isApproved })
      fetchList()
    } catch {}
  }

  const toggleFeatured = async (t) => {
    try {
      await updateTestimonial(t.id, { isFeatured: !t.isFeatured })
      fetchList()
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial permanently?')) return
    try {
      await deleteTestimonial(id)
      fetchList()
    } catch {}
  }

  const bulkApprove = async () => {
    const ids = [...selected]
    if (ids.length === 0) return
    try {
      await Promise.all(ids.map((id) => updateTestimonial(id, { isApproved: true })))
      setSelected(new Set())
      fetchList()
    } catch {}
  }

  const bulkDelete = async () => {
    const ids = [...selected]
    if (ids.length === 0) return
    if (!window.confirm(`Delete ${ids.length} testimonial(s) permanently?`)) return
    try {
      await Promise.all(ids.map((id) => deleteTestimonial(id)))
      setSelected(new Set())
      fetchList()
    } catch {}
  }

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === testimonials.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(testimonials.map((t) => t.id)))
    }
  }

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy">Testimonials</h1>
          <p className="text-muted text-sm mt-1">{total} total testimonials</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={filterService}
          onChange={(e) => { setFilterService(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
        >
          <option value="">All Services</option>
          {serviceOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
          <span className="text-sm font-medium text-navy">{selected.size} selected</span>
          <button onClick={bulkApprove} className="text-sm px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600">
            Approve Selected
          </button>
          <button onClick={bulkDelete} className="text-sm px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600">
            Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-muted hover:text-navy ml-auto">
            Clear
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-muted">Loading...</div>
      )}

      {/* Table */}
      {!loading && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-light text-left">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={testimonials.length > 0 && selected.size === testimonials.length}
                      onChange={toggleAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold text-navy">Patient</th>
                  <th className="px-4 py-3 font-semibold text-navy">Condition</th>
                  <th className="px-4 py-3 font-semibold text-navy">Rating</th>
                  <th className="px-4 py-3 font-semibold text-navy">Status</th>
                  <th className="px-4 py-3 font-semibold text-navy">Featured</th>
                  <th className="px-4 py-3 font-semibold text-navy">Date</th>
                  <th className="px-4 py-3 font-semibold text-navy text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted">
                      No testimonials found. Click "Add Testimonial" to create one.
                    </td>
                  </tr>
                ) : (
                  testimonials.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-light/50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(t.id)}
                          onChange={() => toggleSelect(t.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy">{t.patientName}</div>
                        <div className="text-muted text-xs">
                          {serviceOptions.find((s) => s.value === t.service)?.label || t.service}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text">{t.condition}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} style={i < t.rating ? { color: '#F5A623', fill: '#F5A623' } : { color: '#D1D5DB' }} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleApprove(t)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                            t.isApproved
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          {t.isApproved ? 'Approved' : 'Pending'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleFeatured(t)}
                          className={`transition-colors ${t.isFeatured ? '' : 'opacity-30 hover:opacity-60'}`}
                          title={t.isFeatured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <Award size={18} style={{ color: t.isFeatured ? '#F5A623' : '#9CA3AF' }} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">
                        {new Date(t.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Edit">
                            <Edit3 size={16} className="text-navy" />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-sm text-muted">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
          >
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 z-10 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-navy">
                  {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-xl">
                  <AlertCircle size={16} /> {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Patient Name */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Patient Name *</label>
                  <input
                    value={form.patientName}
                    onChange={(e) => set('patientName', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    placeholder="e.g. Ramesh K."
                  />
                </div>

                {/* Initials */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Initials (for privacy)</label>
                  <input
                    value={form.patientInitials}
                    onChange={(e) => set('patientInitials', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    placeholder="e.g. R.K."
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => set('age', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    placeholder="e.g. 62"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => set('gender', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Condition Treated *</label>
                  <input
                    value={form.condition}
                    onChange={(e) => set('condition', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    placeholder="e.g. Chronic Back Pain"
                  />
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Service Category *</label>
                  <select
                    value={form.service}
                    onChange={(e) => set('service', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  >
                    <option value="">Select service</option>
                    {serviceOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Rating *</label>
                  <StarInput value={form.rating} onChange={(v) => set('rating', v)} />
                </div>

                {/* Treatment Duration */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Treatment Duration</label>
                  <input
                    value={form.treatmentDuration}
                    onChange={(e) => set('treatmentDuration', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    placeholder="e.g. 3 months"
                  />
                </div>

                {/* Outcome */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-navy mb-1">Outcome</label>
                  <input
                    value={form.outcome}
                    onChange={(e) => set('outcome', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    placeholder="e.g. Pain-free in 6 weeks"
                  />
                </div>

                {/* Review Text */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-navy mb-1">Review Text *</label>
                  <textarea
                    value={form.reviewText}
                    onChange={(e) => set('reviewText', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none"
                    placeholder="Patient's testimonial in their own words..."
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Video URL</label>
                  <input
                    value={form.videoUrl}
                    onChange={(e) => set('videoUrl', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    placeholder="YouTube or Vimeo link"
                  />
                </div>

                {/* Photo URL */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Photo URL</label>
                  <input
                    value={form.photoUrl}
                    onChange={(e) => set('photoUrl', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                    placeholder="Patient photo URL (with consent)"
                  />
                </div>

                {/* Consent */}
                <div className="sm:col-span-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consentGiven}
                      onChange={(e) => set('consentGiven', e.target.checked)}
                      className="mt-0.5 rounded"
                    />
                    <span className="text-sm text-text">
                      Patient has given consent for this testimonial to be displayed publicly on the ReFunction Rehab website. *
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary text-sm py-2.5 px-6 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Testimonial' : 'Create Testimonial'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
