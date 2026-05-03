import { useEffect, useState, useCallback } from 'react'
import { Clock, Plus, Trash2, X } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getAvailability, createAvailability, updateAvailability, deleteAvailability,
  getSlotOverrides, createSlotOverride, deleteSlotOverride,
} from '../../lib/api'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SESSION_TYPES = ['In-Person', 'Online', 'Home Visit']

const emptyBlock = { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', slotDuration: 30, maxPatients: 1, sessionType: 'In-Person', label: '' }
const emptyOverride = { date: '', startTime: '', endTime: '', isBlocked: true, reason: '' }

export default function AdminAvailability() {
  const [blocks, setBlocks]         = useState([])
  const [overrides, setOverrides]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState({ ...emptyBlock })
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)

  const [showOverrideForm, setShowOverrideForm] = useState(false)
  const [overrideForm, setOverrideForm]         = useState({ ...emptyOverride })
  const [overrideSaving, setOverrideSaving]     = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [avail, ovr] = await Promise.all([
        getAvailability(),
        getSlotOverrides({}),
      ])
      setBlocks(avail.data)
      setOverrides(ovr.data)
    } catch {
      // keep empty
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editId) {
        await updateAvailability(editId, form)
      } else {
        await createAvailability(form)
      }
      setShowForm(false)
      setEditId(null)
      setForm({ ...emptyBlock })
      fetchData()
    } catch {
      // keep form open
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this availability block?')) return
    try {
      await deleteAvailability(id)
      fetchData()
    } catch { /* ignore */ }
  }

  const handleToggle = async (block) => {
    try {
      await updateAvailability(block.id, { isActive: !block.isActive })
      fetchData()
    } catch { /* ignore */ }
  }

  const handleEdit = (block) => {
    setForm({
      dayOfWeek: block.dayOfWeek,
      startTime: block.startTime,
      endTime: block.endTime,
      slotDuration: block.slotDuration,
      maxPatients: block.maxPatients,
      sessionType: block.sessionType,
      label: block.label || '',
    })
    setEditId(block.id)
    setShowForm(true)
  }

  const handleOverrideSave = async () => {
    setOverrideSaving(true)
    try {
      await createSlotOverride(overrideForm)
      setShowOverrideForm(false)
      setOverrideForm({ ...emptyOverride })
      fetchData()
    } catch { /* ignore */ }
    finally { setOverrideSaving(false) }
  }

  const handleOverrideDelete = async (id) => {
    if (!confirm('Delete this override?')) return
    try {
      await deleteSlotOverride(id)
      fetchData()
    } catch { /* ignore */ }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-navy">Availability</h1>
        <p className="text-muted text-sm mt-1">Manage weekly doctor schedule and date-specific overrides</p>
      </div>

      {/* ─── Section A: Weekly Schedule ──────────────────────────────────── */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-navy flex items-center gap-2">
            <Clock size={18} className="text-teal" /> Weekly Schedule
          </h2>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyBlock }) }}
            className="btn-teal text-sm py-2 px-4">
            <Plus size={15} /> Add Slot
          </button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="bg-light rounded-xl p-4 mb-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-navy">{editId ? 'Edit' : 'New'} Availability Block</h3>
              <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-muted hover:text-navy">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-muted">Day</label>
                <select className="input-field text-sm py-2 mt-1" value={form.dayOfWeek}
                  onChange={(e) => setForm({ ...form, dayOfWeek: parseInt(e.target.value) })}>
                  {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Start Time</label>
                <input type="time" className="input-field text-sm py-2 mt-1" value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">End Time</label>
                <input type="time" className="input-field text-sm py-2 mt-1" value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Slot Duration (min)</label>
                <input type="number" className="input-field text-sm py-2 mt-1" value={form.slotDuration}
                  onChange={(e) => setForm({ ...form, slotDuration: parseInt(e.target.value) || 30 })} min={10} max={120} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Max Patients/Slot</label>
                <input type="number" className="input-field text-sm py-2 mt-1" value={form.maxPatients}
                  onChange={(e) => setForm({ ...form, maxPatients: parseInt(e.target.value) || 1 })} min={1} max={20} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Session Type</label>
                <select className="input-field text-sm py-2 mt-1" value={form.sessionType}
                  onChange={(e) => setForm({ ...form, sessionType: e.target.value })}>
                  {SESSION_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-medium text-muted">Label (optional)</label>
                <input className="input-field text-sm py-2 mt-1" placeholder="e.g. Morning Batch" value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-5 disabled:opacity-60">
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <p className="text-muted text-sm text-center py-8">Loading...</p>
        ) : blocks.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">No availability blocks configured</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-light">
                <tr>
                  {['Day', 'Time', 'Duration', 'Capacity', 'Type', 'Label', 'Active', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blocks.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-light/50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-navy">{DAY_NAMES[b.dayOfWeek]}</td>
                    <td className="px-4 py-2.5 text-muted">{b.startTime} - {b.endTime}</td>
                    <td className="px-4 py-2.5 text-muted">{b.slotDuration} min</td>
                    <td className="px-4 py-2.5 text-muted">{b.maxPatients}</td>
                    <td className="px-4 py-2.5 text-muted">{b.sessionType}</td>
                    <td className="px-4 py-2.5 text-muted">{b.label || '—'}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => handleToggle(b)}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {b.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(b)} className="text-teal text-xs font-medium hover:underline">Edit</button>
                        <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Section B: Date Overrides ───────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-navy">Date Overrides</h2>
          <button onClick={() => setShowOverrideForm(true)} className="btn-teal text-sm py-2 px-4">
            <Plus size={15} /> Add Override
          </button>
        </div>

        {showOverrideForm && (
          <div className="bg-light rounded-xl p-4 mb-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-navy">New Override</h3>
              <button onClick={() => setShowOverrideForm(false)} className="text-muted hover:text-navy">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-muted">Date *</label>
                <input type="date" className="input-field text-sm py-2 mt-1" value={overrideForm.date}
                  onChange={(e) => setOverrideForm({ ...overrideForm, date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Start Time (optional)</label>
                <input type="time" className="input-field text-sm py-2 mt-1" value={overrideForm.startTime}
                  onChange={(e) => setOverrideForm({ ...overrideForm, startTime: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">End Time (optional)</label>
                <input type="time" className="input-field text-sm py-2 mt-1" value={overrideForm.endTime}
                  onChange={(e) => setOverrideForm({ ...overrideForm, endTime: e.target.value })} />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-teal" checked={overrideForm.isBlocked}
                    onChange={(e) => setOverrideForm({ ...overrideForm, isBlocked: e.target.checked })} />
                  <span className="text-sm text-navy font-medium">Block this date/slot</span>
                </label>
              </div>
              <div className="col-span-2 lg:col-span-4">
                <label className="text-xs font-medium text-muted">Reason (optional)</label>
                <input className="input-field text-sm py-2 mt-1" placeholder="e.g. Public holiday, Doctor on leave"
                  value={overrideForm.reason} onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={handleOverrideSave} disabled={overrideSaving || !overrideForm.date}
                className="btn-primary text-sm py-2 px-5 disabled:opacity-60">
                {overrideSaving ? 'Saving...' : 'Create Override'}
              </button>
            </div>
          </div>
        )}

        {overrides.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">No date overrides</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-light">
                <tr>
                  {['Date', 'Time Range', 'Blocked', 'Reason', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overrides.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-light/50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-navy">
                      {new Date(o.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5 text-muted">
                      {o.startTime ? `${o.startTime} - ${o.endTime || ''}` : 'Full day'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${o.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {o.isBlocked ? 'Blocked' : 'Modified'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted">{o.reason || '—'}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => handleOverrideDelete(o.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
