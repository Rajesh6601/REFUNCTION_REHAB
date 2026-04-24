import { useEffect, useState, useCallback } from 'react'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminPayments, exportPayments } from '../../lib/api'

const STATUSES = ['', 'paid', 'partial', 'pending', 'advance', 'refund']
const MODES    = ['', 'cash', 'upi', 'card', 'netbanking', 'cheque']

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0)
}

const statusStyle = {
  paid:    'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-red-100 text-red-600',
  advance: 'bg-blue-100 text-blue-700',
  refund:  'bg-purple-100 text-purple-700',
}

export default function AdminPayments() {
  const [data, setData]       = useState({ payments: [], total: 0, pages: 1, totalCollected: 0, totalPending: 0, totalCharged: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [status, setStatus]   = useState('')
  const [mode, setMode]       = useState('')
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminPayments({
        page, limit: 20,
        ...(status && { status }),
        ...(mode   && { mode }),
        ...(from   && { from }),
        ...(to     && { to }),
      })
      setData(res.data)
    } catch {
      // keep previous data
    } finally {
      setLoading(false)
    }
  }, [page, status, mode, from, to])

  useEffect(() => { fetchPayments() }, [fetchPayments])
  useEffect(() => { setPage(1) }, [status, mode, from, to])

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy">Payments</h1>
          <p className="text-muted text-sm mt-0.5">{data.total} total records</p>
        </div>
        <a
          href={exportPayments()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-teal text-sm py-2.5 px-4"
        >
          <Download size={15} /> Export CSV
        </a>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Collected', value: `₹${fmt(data.totalCollected)}`, color: 'text-green-600' },
          { label: 'Total Pending',   value: `₹${fmt(data.totalPending)}`,   color: 'text-red-500'   },
          { label: 'Total Charged',   value: `₹${fmt(data.totalCharged)}`,   color: 'text-navy'      },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`font-accent font-bold text-2xl ${s.color}`}>{s.value}</div>
            <div className="text-muted text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <select className="input-field text-sm py-2.5" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} className="capitalize">{s}</option>)}
          </select>
          <select className="input-field text-sm py-2.5" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">All Modes</option>
            {MODES.filter(Boolean).map((m) => <option key={m} className="capitalize">{m}</option>)}
          </select>
          <input type="date" className="input-field text-sm py-2.5" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="input-field text-sm py-2.5" value={to}   onChange={(e) => setTo(e.target.value)}   />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-light border-b border-gray-100">
              <tr>
                {['Receipt No', 'Patient', 'Amount Paid', 'Total', 'Balance', 'Mode', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16 text-muted">Loading…</td></tr>
              ) : data.payments.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-muted">No payments found</td></tr>
              ) : data.payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-light transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-teal">{p.receiptNo}</td>
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">
                    {p.patient?.fullName || '—'}
                    <div className="text-xs text-muted">{p.patient?.mobile}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-600">₹{fmt(p.amountPaid)}</td>
                  <td className="px-4 py-3 text-navy">₹{fmt(p.totalAmount)}</td>
                  <td className="px-4 py-3 text-muted">₹{fmt(p.balanceDue)}</td>
                  <td className="px-4 py-3 text-muted capitalize">{p.paymentMode}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusStyle[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString('en-IN')}
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
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg hover:bg-light disabled:opacity-40 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg hover:bg-light disabled:opacity-40 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
