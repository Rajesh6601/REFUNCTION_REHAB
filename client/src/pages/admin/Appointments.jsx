import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminAppointments, updateAppointment } from '../../lib/api'

const STATUSES = ['', 'booked', 'completed', 'cancelled', 'no-show']

const statusStyle = {
  booked:    'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  'no-show': 'bg-amber-100 text-amber-700',
}

export default function AdminAppointments() {
  const [data, setData]           = useState({ appointments: [], total: 0, pages: 1 })
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [status, setStatus]       = useState('')
  const [search, setSearch]       = useState('')
  const [from, setFrom]           = useState('')
  const [to, setTo]               = useState('')
  const [cancelId, setCancelId]   = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminAppointments({
        page, limit: 20,
        ...(status && { status }),
        ...(search && { search }),
        ...(from && { from }),
        ...(to && { to }),
      })
      setData(res.data)
    } catch {
      // keep previous
    } finally {
      setLoading(false)
    }
  }, [page, status, search, from, to])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])
  useEffect(() => { setPage(1) }, [status, search, from, to])

  const handleStatusUpdate = async (id, newStatus, reason) => {
    try {
      await updateAppointment(id, {
        status: newStatus,
        ...(reason && { cancellationReason: reason }),
      })
      fetchAppointments()
      setCancelId(null)
      setCancelReason('')
    } catch { /* ignore */ }
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy">Appointments</h1>
          <p className="text-muted text-sm mt-0.5">{data.total} total records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            className="input-field text-sm py-2.5"
            placeholder="Search patient name, mobile, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input-field text-sm py-2.5" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} className="capitalize">{s}</option>)}
          </select>
          <input type="date" className="input-field text-sm py-2.5" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="input-field text-sm py-2.5" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-light border-b border-gray-100">
              <tr>
                {['Date', 'Time', 'Patient', 'Service', 'Session', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16 text-muted">Loading...</td></tr>
              ) : data.appointments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-muted">No appointments found</td></tr>
              ) : data.appointments.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-light transition-colors">
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">
                    {new Date(a.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{a.startTime} - {a.endTime}</td>
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">
                    {a.patient?.fullName || '—'}
                    <div className="text-xs text-muted">{a.patient?.mobile}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{a.serviceType}</td>
                  <td className="px-4 py-3 text-muted">{a.sessionType}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusStyle[a.status] || 'bg-gray-100 text-gray-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.status === 'booked' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(a.id, 'completed')}
                          className="text-green-600 hover:text-green-800" title="Mark Completed"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(a.id, 'no-show')}
                          className="text-amber-500 hover:text-amber-700" title="Mark No-Show"
                        >
                          <AlertTriangle size={16} />
                        </button>
                        <button
                          onClick={() => setCancelId(a.id)}
                          className="text-red-500 hover:text-red-700" title="Cancel"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                    {a.status === 'cancelled' && a.cancellationReason && (
                      <span className="text-xs text-muted">{a.cancellationReason}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-muted">
          <span>Page {data.page || page} of {data.pages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-lg hover:bg-light disabled:opacity-40 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg hover:bg-light disabled:opacity-40 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Reason Modal */}
      {cancelId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setCancelId(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-navy text-lg mb-4">Cancel Appointment</h3>
            <div>
              <label className="text-xs font-medium text-muted">Reason for cancellation</label>
              <textarea
                className="input-field text-sm mt-1"
                rows={3}
                placeholder="Enter reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <button onClick={() => { setCancelId(null); setCancelReason('') }} className="btn-outline text-sm py-2 px-4">
                Back
              </button>
              <button
                onClick={() => handleStatusUpdate(cancelId, 'cancelled', cancelReason)}
                className="bg-red-500 text-white text-sm py-2 px-4 rounded-xl hover:bg-red-600 transition-colors"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
