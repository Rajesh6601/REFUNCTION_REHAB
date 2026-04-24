import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { setupAdmin } from '../../lib/api'

export default function AdminSetup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await setupAdmin(form)
      setDone(true)
      setTimeout(() => navigate('/admin/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <h2 className="font-display font-bold text-2xl text-navy mb-2">Create Admin Account</h2>
          <p className="text-muted text-sm mb-6">One-time setup. This can only be done once.</p>
          {done ? (
            <div className="text-center py-6">
              <div className="text-green-500 text-4xl mb-3">✓</div>
              <p className="text-navy font-semibold">Admin account created! Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input required className="input-field" placeholder="Dr. Neha Trivedi"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="email" required className="input-field" placeholder="admin@refunctionrehab.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input type="password" required minLength={8} className="input-field" placeholder="Min 8 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
                {loading ? 'Creating…' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
