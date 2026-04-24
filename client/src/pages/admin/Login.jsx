import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { login } from '../../lib/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ email, password })
      localStorage.setItem('rfr_token', res.data.token)
      localStorage.setItem('rfr_staff', JSON.stringify(res.data.staff))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <circle cx="22" cy="6" r="4" fill="#1A7F8E"/>
              <path d="M14 14c2-3 5-5 8-4l4 2-3 6-4-2-5 8 6 4-2 4-8-5 4-13z" fill="white"/>
              <path d="M10 18l-4 10h4l3-7 3 3 2-4-4-4-4 2z" fill="#1A7F8E"/>
            </svg>
          </div>
          <h1 className="font-display font-bold text-2xl text-navy">ReFunction Rehab</h1>
          <p className="text-muted text-sm mt-1">Doctor / Staff Portal</p>
        </div>

        <div className="card p-8">
          <h2 className="font-display font-semibold text-xl text-navy mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email" required
                  className="input-field pl-9"
                  placeholder="staff@refunctionrehab.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={show ? 'text' : 'password'} required
                  className="input-field pl-9 pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-muted">
              First time setup?{' '}
              <a href="/admin/setup" className="text-teal hover:underline font-medium">
                Create admin account
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
