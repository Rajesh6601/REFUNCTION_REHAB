import axios from 'axios'

// In Docker: nginx proxies /api → server:4000
// In local dev: uses VITE_API_URL (http://localhost:4000)
const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE.endsWith('/api') ? BASE : `${BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rfr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to /admin/login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith('/admin')
      if (isAdminRoute) {
        localStorage.removeItem('rfr_token')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

// ─── Patient ──────────────────────────────────────────────────────────────────
export const enrollPatient   = (data)   => api.post('/patients/enroll', data)
export const getPatient      = (id)     => api.get(`/patients/${id}`)
export const searchPatients  = (q)      => api.get('/patients/search', { params: { q } })

// ─── Payments ─────────────────────────────────────────────────────────────────
export const recordPayment   = (data)   => api.post('/payments', data)
export const getPayment      = (id)     => api.get(`/payments/${id}`)
export const getPatientPayments = (pid) => api.get(`/payments/patient/${pid}`)

// ─── Contact ──────────────────────────────────────────────────────────────────
export const sendContact     = (data)   => api.post('/contact', data)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login           = (data)   => api.post('/auth/login', data)
export const setupAdmin      = (data)   => api.post('/auth/setup', data)

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export const getDashboard    = ()       => api.get('/admin/dashboard')
export const getAdminPatients= (params) => api.get('/admin/patients', { params })
export const getAdminPayments= (params) => api.get('/admin/payments',  { params })
export const exportPatients  = ()       => `${api.defaults.baseURL}/admin/patients/export`
export const exportPayments  = ()       => `${api.defaults.baseURL}/admin/payments/export`

export default api
