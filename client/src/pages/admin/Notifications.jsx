import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getNotifications, retryNotification } from '../../lib/api'

const TYPES    = ['', 'welcome', 'milestone', 'completion', 'reminder', 'no-show', 're-engagement']
const STATUSES = ['', 'pending', 'sent', 'delivered', 'failed']

const typeStyle = {
  welcome:        'bg-teal-100 text-teal-700',
  milestone:      'bg-blue-100 text-blue-700',
  completion:     'bg-green-100 text-green-700',
  reminder:       'bg-purple-100 text-purple-700',
  'no-show':      'bg-amber-100 text-amber-700',
  're-engagement':'bg-orange-100 text-orange-700',
}

const statusStyle = {
  pending:   'bg-gray-100 text-gray-600',
  sent:      'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  failed:    'bg-red-100 text-red-600',
}

export default function AdminNotifications() {
  const [data, setData]       = useState({ notifications: [], total: 0, pages: 1, summary: {} })
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [type, setType]       = useState('')
  const [status, setStatus]   = useState('')
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')
  const [retrying, setRetrying] = useState(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getNotifications({
        page, limit: 20,
        ...(type && { type }),
        ...(status && { status }),
        ...(from && { from }),
        ...(to && { to }),
      })
      setData(res.data)
    } catch {
      // keep previous
    } finally {
      setLoading(false)
    }
  }, [page, type, status, from, to])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])
  useEffect(() => { setPage(1) }, [type, status, from, to])

  const handleRetry = async (id) => {
    setRetrying(id)
    try {
      await retryNotification(id)
      fetchNotifications()
    } catch {
      // ignore
    } finally {
      setRetrying(null)
    }
  }

  const summary = data.summary || {}

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy">Notifications</h1>
          <p className="text-muted text-sm mt-0.5">{data.total} total records</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50">
            <Send size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted">Sent</p>
            <p className="font-semibold text-navy">{summary.sent || 0}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-50">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted">Delivered</p>
            <p className="font-semibold text-navy">{summary.delivered || 0}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-50">
            <AlertCircle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs text-muted">Failed</p>
            <p className="font-semibold text-navy">{summary.failed || 0}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gray-50">
            <Clock size={18} className="text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-muted">Pending</p>
            <p className="font-semibold text-navy">{summary.pending || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <select className="input-field text-sm py-2.5" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Types</option>
            {TYPES.filter(Boolean).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <select className="input-field text-sm py-2.5" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
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
                {['Date', 'Patient', 'Type', 'Message', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-muted">Loading...</td></tr>
              ) : data.notifications.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-muted">No notifications found</td></tr>
              ) : data.notifications.map((n) => (
                <tr key={n.id} className="border-b border-gray-50 hover:bg-light transition-colors">
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <div className="text-xs text-muted">
                      {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">
                    {n.patient?.fullName || '—'}
                    <div className="text-xs text-muted">{n.patient?.mobile}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${typeStyle[n.type] || 'bg-gray-100 text-gray-600'}`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted max-w-xs">
                    <p className="truncate" title={n.messageContent}>
                      {n.messageContent}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusStyle[n.status] || 'bg-gray-100 text-gray-600'}`}>
                      {n.status}
                    </span>
                    {n.errorMessage && n.status === 'failed' && (
                      <div className="text-xs text-red-500 mt-1 truncate max-w-[150px]" title={n.errorMessage}>
                        {n.errorMessage}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {n.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(n.id)}
                        disabled={retrying === n.id}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-40 transition-colors"
                        title="Retry"
                      >
                        <RefreshCw size={16} className={retrying === n.id ? 'animate-spin' : ''} />
                      </button>
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
    </AdminLayout>
  )
}
