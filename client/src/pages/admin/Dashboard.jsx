import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, IndianRupee, TrendingUp, Clock, UserPlus, AlertCircle, Package, CalendarCheck } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getDashboard } from '../../lib/api'

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: color + '18' }}>
          <Icon size={20} style={{ color }} />
        </div>
        {sub && <span className="text-xs text-muted">{sub}</span>}
      </div>
      <div className="font-accent font-bold text-3xl text-navy">{value}</div>
      <div className="text-muted text-sm mt-0.5">{label}</div>
    </motion.div>
  )
}

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0)
}

export default function Dashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64 text-muted">Loading dashboard…</div>
    </AdminLayout>
  )

  if (error) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64 gap-2 text-red-500">
        <AlertCircle size={20} /> {error}
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-navy">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Overview of ReFunction Rehab patient & payment data</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}        color="#1B2F5E" label="Total Patients"        value={fmt(data.totalPatients)}         />
        <StatCard icon={UserPlus}     color="#1A7F8E" label="New Today"             value={fmt(data.newPatientsToday)}       />
        <StatCard icon={TrendingUp}   color="#059669" label="New This Month"        value={fmt(data.newPatientsThisMonth)}   />
        <StatCard icon={IndianRupee}  color="#E8630A" label="Total Revenue"         value={`₹${fmt(data.totalRevenue)}`}     />
        <StatCard icon={IndianRupee}  color="#F5A623" label="Revenue Today"         value={`₹${fmt(data.revenueToday)}`}     />
        <StatCard icon={Clock}        color="#BE185D" label="Pending Payments"      value={fmt(data.pendingPaymentsCount)}  sub={data.patientsWithNoPayments ? `₹${fmt(data.pendingPaymentsValue)} · ${data.patientsWithNoPayments} unpaid` : `₹${fmt(data.pendingPaymentsValue)}`} />
        <StatCard icon={Package}      color="#7C3AED" label="Active Packages"       value={fmt(data.activePackages)}        />
        <StatCard icon={CalendarCheck} color="#0891B2" label="Visits Today"          value={fmt(data.visitsToday)}           />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy">Recent Enrollments</h2>
            <Link to="/admin/patients" className="text-teal text-sm hover:underline">View all</Link>
          </div>
          {data.recentEnrollments.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">No enrollments yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentEnrollments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-medium text-navy text-sm">{p.fullName}</div>
                    <div className="text-muted text-xs">{p.mobile} · {p.program?.[0] || '—'}</div>
                  </div>
                  <div className="text-xs text-muted text-right">
                    {new Date(p.enrolledAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy">Recent Payments</h2>
            <Link to="/admin/payments" className="text-teal text-sm hover:underline">View all</Link>
          </div>
          {data.recentPayments.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-medium text-navy text-sm">{p.patient?.fullName || '—'}</div>
                    <div className="text-muted text-xs">{p.receiptNo} · {p.paymentMode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-navy">₹{fmt(p.amountPaid)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'paid' ? 'bg-green-100 text-green-700' :
                      p.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Packages Needing Attention */}
      {data.attentionPackages?.length > 0 && (
        <div className="card p-6 mt-6">
          <h2 className="font-display font-semibold text-navy mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-500" /> Packages Needing Attention
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-light">
                <tr>
                  {['Patient', 'Package', 'Sessions Used', 'Remaining', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.attentionPackages.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="px-4 py-2.5 font-medium text-navy">{p.patientName}</td>
                    <td className="px-4 py-2.5 text-muted">{p.packageName}</td>
                    <td className="px-4 py-2.5 text-muted">{p.sessionsUsed} / {p.totalSessions}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        {p.remaining} left
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link to={`/admin/patients/${p.patientId}/edit`} className="text-teal text-xs font-medium hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Mode Breakdown */}
      {data.paymentModeBreakdown?.length > 0 && (
        <div className="card p-6 mt-6">
          <h2 className="font-display font-semibold text-navy mb-4">Payment Mode Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {data.paymentModeBreakdown.map((m) => (
              <div key={m.paymentMode} className="bg-light rounded-xl p-4 text-center">
                <div className="font-accent font-bold text-xl text-navy">₹{fmt(m._sum.amountPaid)}</div>
                <div className="text-muted text-xs mt-1 capitalize">{m.paymentMode}</div>
                <div className="text-teal text-xs font-medium">{m._count.id} txn{m._count.id !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
