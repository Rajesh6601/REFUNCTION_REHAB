import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Download, ChevronLeft, ChevronRight, CreditCard, Pencil } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminPatients, exportPatients } from '../../lib/api'

const PROGRAMS = ['', 'Physiotherapy', 'General Health & Fitness', 'Kids Exercise',
  'Post-Surgery Rehab', 'Sports Injury', 'Elderly Care']

export default function AdminPatients() {
  const [data, setData]       = useState({ patients: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [program, setProgram] = useState('')
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminPatients({
        page, limit: 20,
        ...(search  && { search }),
        ...(program && { program }),
        ...(from    && { from }),
        ...(to      && { to }),
      })
      setData(res.data)
    } catch {
      // keep previous data
    } finally {
      setLoading(false)
    }
  }, [page, search, program, from, to])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, program, from, to])

  const handleExport = async () => {
    try {
      const res = await exportPatients()
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'patients.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // handled by axios interceptor
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy">Patients</h1>
          <p className="text-muted text-sm mt-0.5">{data.total} total enrolled</p>
        </div>
        <button
          onClick={handleExport}
          className="btn-teal text-sm py-2.5 px-4"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input-field pl-8 text-sm py-2.5"
              placeholder="Name, phone, or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field text-sm py-2.5" value={program} onChange={(e) => setProgram(e.target.value)}>
            <option value="">All Programs</option>
            {PROGRAMS.filter(Boolean).map((p) => <option key={p}>{p}</option>)}
          </select>
          <input type="date" className="input-field text-sm py-2.5" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From date" />
          <input type="date" className="input-field text-sm py-2.5" value={to}   onChange={(e) => setTo(e.target.value)}   placeholder="To date" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-light border-b border-gray-100">
              <tr>
                {['Patient ID', 'Name', 'Age/Gender', 'Mobile', 'Program', 'Session', 'City', 'Enrolled', 'Payments', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-16 text-muted">Loading…</td></tr>
              ) : data.patients.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-16 text-muted">No patients found</td></tr>
              ) : data.patients.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-light transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">{p.fullName}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{p.age} / {p.gender}</td>
                  <td className="px-4 py-3 text-muted">{p.mobile}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.program?.slice(0, 2).map((pr) => (
                        <span key={pr} className="text-xs bg-teal/10 text-teal px-2 py-0.5 rounded-full">{pr}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.sessionType}</td>
                  <td className="px-4 py-3 text-muted">{p.city}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(p.enrolledAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {(p._count?.payments || 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {p._count.payments} paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        No payment
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/admin/patients/${p.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs text-navy hover:underline font-medium whitespace-nowrap"
                      >
                        <Pencil size={13} /> Edit
                      </Link>
                      <Link
                        to={`/payment?patientId=${p.id}`}
                        className="inline-flex items-center gap-1 text-xs text-teal hover:underline font-medium whitespace-nowrap"
                      >
                        <CreditCard size={13} /> Record Payment
                      </Link>
                    </div>
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
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg hover:bg-light disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg hover:bg-light disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
