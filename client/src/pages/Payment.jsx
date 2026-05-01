import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, CreditCard, Smartphone, Building2, Wallet, FileText, CheckCircle, Plus, Trash2, Package } from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import { searchPatients, recordPayment } from '../lib/api'

const SERVICES_LIST = [
  'Initial Consultation', 'Follow-up Session', 'Physiotherapy Session',
  'Exercise Training', 'Kids Exercise', 'Post-Surgery Rehab',
  'Sports Injury Session', 'Elderly Care Session', 'Home Visit',
  'Group Session', 'Online Session', 'Other',
]

const PACKAGE_PRESETS = [
  { label: '5-Session Package',  sessions: 5 },
  { label: '10-Session Package', sessions: 10 },
  { label: '15-Session Package', sessions: 15 },
  { label: 'Monthly Unlimited',  sessions: 30 },
  { label: 'Custom',             sessions: 0 },
]

const PAYMENT_MODES = [
  { id: 'cash',        label: 'Cash',          icon: Wallet },
  { id: 'upi',         label: 'UPI',           icon: Smartphone },
  { id: 'card',        label: 'Card',          icon: CreditCard },
  { id: 'netbanking',  label: 'Net Banking',   icon: Building2 },
  { id: 'cheque',      label: 'Cheque',        icon: FileText },
]

export default function Payment() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [patient, setPatient]         = useState(null)
  const [searchQ, setSearchQ]         = useState('')
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching]     = useState(false)
  const [payMode, setPayMode]         = useState('upi')
  const [receipt, setReceipt]         = useState(false)
  const [savedPayment, setSavedPayment] = useState(null)
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState('')
  const [amountPaid, setAmountPaid]   = useState(0)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [isPackage, setIsPackage]     = useState(false)
  const [packageName, setPackageName] = useState('10-Session Package')
  const [totalSessions, setTotalSessions] = useState(10)
  const [pkgExpiry, setPkgExpiry]     = useState('')
  const [packageNotes, setPackageNotes] = useState('')
  const [packageDiscount, setPackageDiscount] = useState(0)
  const [lineItems, setLineItems]     = useState([
    { service: 'Physiotherapy Session', qty: 1, rate: 600, discount: 0 },
  ])

  // Patient lookup via API
  const lookupPatient = async (query) => {
    const q = (query || searchQ).trim()
    if (!q) return
    setSearchError('')
    setSearching(true)
    try {
      const res = await searchPatients(q)
      const results = res.data
      if (results.length === 0) {
        setSearchError('No patient found. Check the ID or mobile number.')
        setPatient(null)
      } else {
        const p = results[0]
        setPatient({
          id:        p.id,
          name:      p.fullName,
          phone:     p.mobile,
          doctor:    'Dr. Neha Trivedi',
          sessionNo: (p._count?.payments || 0) + 1,
        })
      }
    } catch {
      setSearchError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  // Auto-lookup patient from URL query params (e.g. /payment?patientId=xxx)
  useEffect(() => {
    const patientId = searchParams.get('patientId')
    if (patientId) {
      setSearchQ(patientId)
      lookupPatient(patientId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addLine = () => setLineItems([...lineItems, { service: 'Physiotherapy Session', qty: 1, rate: 600, discount: 0 }])
  const removeLine = (i) => setLineItems(lineItems.filter((_, idx) => idx !== i))
  const updateLine = (i, field, value) => {
    const updated = [...lineItems]
    updated[i] = { ...updated[i], [field]: field === 'service' ? value : Number(value) }
    setLineItems(updated)
  }

  const subtotal  = lineItems.reduce((sum, l) => sum + l.qty * l.rate - l.discount, 0)
  const gst       = 0
  const total     = subtotal + gst - (isPackage ? packageDiscount : 0)
  const balanceDue = total - amountPaid

  useEffect(() => { setAmountPaid(total) }, [total])

  if (receipt) {
    return (
      <PageWrapper>
        <section className="py-16 bg-light min-h-screen">
          <div className="max-w-xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
              {/* Receipt Header */}
              <div className="bg-navy text-white p-8 text-center">
                <div className="font-display font-bold text-2xl mb-1">
                  <span style={{ color: '#1A7F8E' }}>Re</span>Function Rehab
                </div>
                <div className="text-white/60 text-sm">Payment Receipt</div>
                <div className="mt-4 bg-white/10 rounded-xl p-3 inline-block">
                  <CheckCircle size={32} className="text-green-400 mx-auto" />
                </div>
              </div>

              <div className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div><span className="text-muted">Receipt No.</span><div className="font-semibold text-navy">RFR-{Date.now().toString().slice(-6)}</div></div>
                  <div><span className="text-muted">Date</span><div className="font-semibold text-navy">{new Date(paymentDate).toLocaleDateString('en-IN')}</div></div>
                  <div><span className="text-muted">Patient</span><div className="font-semibold text-navy">{patient?.name || '—'}</div></div>
                  <div><span className="text-muted">Doctor</span><div className="font-semibold text-navy">Dr. Neha Trivedi</div></div>
                  <div><span className="text-muted">Session No.</span><div className="font-semibold text-navy">{patient?.sessionNo || 1}</div></div>
                  <div><span className="text-muted">Payment Mode</span><div className="font-semibold text-navy capitalize">{payMode}</div></div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted text-xs uppercase">
                      <th className="text-left py-2">Service</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((l, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-2 text-navy">{l.service}</td>
                        <td className="py-2 text-right text-navy">{l.qty}</td>
                        <td className="py-2 text-right text-navy">₹{l.rate}</td>
                        <td className="py-2 text-right font-semibold text-navy">₹{l.qty * l.rate - l.discount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t-2 border-navy pt-3">
                  <div className="flex justify-between font-bold text-lg text-navy">
                    <span>TOTAL PAID</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <p className="text-center text-teal text-sm font-medium pt-2 italic">
                  "Thank you for your payment! Wishing you a speedy recovery."
                </p>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <button onClick={() => window.print()} className="btn-teal flex-1 justify-center text-sm py-2.5">
                  Print Receipt
                </button>
                <button onClick={() => setReceipt(false)} className="btn-outline flex-1 justify-center text-sm py-2.5">
                  New Payment
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <section className="py-16 bg-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-teal text-sm font-semibold uppercase tracking-widest">Billing</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl mt-2 mb-4 text-white">Payment Collection</h1>
            <p className="text-white/70 text-lg">Record patient payments and generate receipts.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-light min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

          {/* Patient Lookup */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-navy mb-4">1. Patient Lookup</h2>
            <div className="flex gap-3">
              <input
                className="input-field flex-1"
                placeholder="Search by Patient ID or Mobile Number"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookupPatient()}
              />
              <button onClick={() => lookupPatient()} disabled={searching} className="btn-teal py-3 px-5 disabled:opacity-60">
                {searching ? '…' : <Search size={18} />}
              </button>
            </div>
            {searchError && (
              <p className="mt-2 text-sm text-red-500">{searchError}</p>
            )}
            {patient && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {[
                  { label: 'Patient Name', value: patient.name },
                  { label: 'Patient ID',   value: patient.id },
                  { label: 'Doctor',       value: patient.doctor },
                  { label: 'Session No.',  value: patient.sessionNo },
                ].map((f) => (
                  <div key={f.label} className="bg-light rounded-xl p-3">
                    <div className="text-xs text-muted mb-0.5">{f.label}</div>
                    <div className="font-semibold text-navy text-sm">{f.value}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Fee Table */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-navy">2. Service Details</h2>
              <button onClick={addLine} className="flex items-center gap-1.5 text-teal text-sm font-medium hover:underline">
                <Plus size={15} /> Add Service
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted text-xs uppercase bg-light rounded-lg">
                    <th className="text-left p-3 rounded-l-lg">Service</th>
                    <th className="p-3 text-center w-20">Qty</th>
                    <th className="p-3 text-right w-24">Rate (₹)</th>
                    <th className="p-3 text-right w-24">Disc (₹)</th>
                    <th className="p-3 text-right w-24">Amount (₹)</th>
                    <th className="p-3 w-10 rounded-r-lg" />
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((l, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 pr-3">
                        <select
                          className="input-field text-sm py-2"
                          value={l.service}
                          onChange={(e) => updateLine(i, 'service', e.target.value)}
                        >
                          {SERVICES_LIST.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min="1" className="input-field text-sm py-2 !px-2 text-center" value={l.qty}
                          onChange={(e) => updateLine(i, 'qty', e.target.value)} />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min="0" className="input-field text-sm py-2 text-right" value={l.rate}
                          onChange={(e) => updateLine(i, 'rate', e.target.value)} />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min="0" className="input-field text-sm py-2 text-right" value={l.discount}
                          onChange={(e) => updateLine(i, 'discount', e.target.value)} />
                      </td>
                      <td className="py-2 px-2 text-right font-semibold text-navy">
                        ₹{(l.qty * l.rate - l.discount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 pl-2">
                        <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>GST (if applicable)</span><span>₹{gst}</span>
                </div>
                {isPackage && packageDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Package Discount</span><span>-₹{packageDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-navy border-t border-gray-200 pt-2">
                  <span>TOTAL</span><span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Package Toggle */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-navy flex items-center gap-2">
                <Package size={20} className="text-teal" /> Package Payment
              </h2>
              <button
                type="button"
                onClick={() => {
                  const next = !isPackage
                  setIsPackage(next)
                  if (next) {
                    // Auto-set first line item qty to match default sessions
                    setLineItems(items => {
                      const updated = [...items]
                      updated[0] = { ...updated[0], qty: totalSessions || 10 }
                      return updated
                    })
                  } else {
                    // Reset back to single session
                    setLineItems(items => {
                      const updated = [...items]
                      updated[0] = { ...updated[0], qty: 1 }
                      return updated
                    })
                    setPackageDiscount(0)
                  }
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${isPackage ? 'bg-teal' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPackage ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            {isPackage && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                <p className="text-sm text-muted">This payment is for a treatment package with multiple sessions.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Package Type</label>
                    <select
                      className="input-field"
                      value={packageName}
                      onChange={(e) => {
                        const preset = PACKAGE_PRESETS.find(p => p.label === e.target.value)
                        setPackageName(e.target.value)
                        if (preset && preset.sessions > 0) {
                          setTotalSessions(preset.sessions)
                          setLineItems(items => {
                            const updated = [...items]
                            updated[0] = { ...updated[0], qty: preset.sessions }
                            return updated
                          })
                        }
                      }}
                    >
                      {PACKAGE_PRESETS.map(p => <option key={p.label}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Total Sessions</label>
                    <input
                      type="number" min="1" className="input-field"
                      value={totalSessions}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0
                        setTotalSessions(val)
                        if (val > 0) {
                          setLineItems(items => {
                            const updated = [...items]
                            updated[0] = { ...updated[0], qty: val }
                            return updated
                          })
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Package Discount (₹)</label>
                    <input
                      type="number" min="0" className="input-field"
                      value={packageDiscount}
                      onChange={(e) => setPackageDiscount(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="form-label">Expiry Date (optional)</label>
                    <input type="date" className="input-field" value={pkgExpiry} onChange={(e) => setPkgExpiry(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Package Notes</label>
                    <input className="input-field" placeholder="Any notes about this package" value={packageNotes} onChange={(e) => setPackageNotes(e.target.value)} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Payment Mode */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-navy mb-4">3. Payment Mode</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {PAYMENT_MODES.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    onClick={() => setPayMode(m.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                      payMode === m.id ? 'bg-navy border-navy text-white' : 'bg-white border-gray-200 text-text hover:border-navy'
                    }`}
                  >
                    <Icon size={16} /> {m.label}
                  </button>
                )
              })}
            </div>

            {/* Dynamic fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              {payMode === 'cash' && (
                <>
                  <div><label className="form-label">Amount Received (₹)</label><input type="number" className="input-field" defaultValue={total} /></div>
                  <div><label className="form-label">Change (₹)</label><input type="number" className="input-field" defaultValue={0} /></div>
                  <div><label className="form-label">Received By</label><input className="input-field" placeholder="Staff name" /></div>
                </>
              )}
              {payMode === 'upi' && (
                <>
                  <div><label className="form-label">Transaction ID</label><input className="input-field" placeholder="UPI transaction ID" /></div>
                  <div><label className="form-label">UPI App</label>
                    <select className="input-field">
                      <option>GPay</option><option>PhonePe</option><option>Paytm</option><option>Other</option>
                    </select>
                  </div>
                  <div><label className="form-label">UPI ID</label><input className="input-field" placeholder="name@upi" /></div>
                </>
              )}
              {payMode === 'card' && (
                <>
                  <div><label className="form-label">Card Type</label>
                    <select className="input-field"><option>Visa</option><option>Mastercard</option><option>RuPay</option></select>
                  </div>
                  <div><label className="form-label">Last 4 Digits</label><input className="input-field" placeholder="XXXX" maxLength={4} /></div>
                  <div><label className="form-label">Bank Name</label><input className="input-field" placeholder="Bank name" /></div>
                  <div><label className="form-label">Approval Code</label><input className="input-field" placeholder="Approval/Auth code" /></div>
                </>
              )}
              {payMode === 'netbanking' && (
                <>
                  <div><label className="form-label">Bank Name</label><input className="input-field" placeholder="Bank name" /></div>
                  <div><label className="form-label">Transaction / Reference ID</label><input className="input-field" placeholder="Reference number" /></div>
                </>
              )}
              {payMode === 'cheque' && (
                <>
                  <div><label className="form-label">Cheque Number</label><input className="input-field" placeholder="Cheque number" /></div>
                  <div><label className="form-label">Bank Name</label><input className="input-field" placeholder="Bank name" /></div>
                  <div><label className="form-label">Cheque Date</label><input type="date" className="input-field" /></div>
                </>
              )}
            </div>
          </div>

          {/* Summary & Actions */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-navy mb-4">4. Summary & Actions</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div><label className="form-label">Total Charged (₹)</label>
                <input type="number" className="input-field" value={total} readOnly /></div>
              <div><label className="form-label">Amount Paid (₹)</label>
                <input type="number" className="input-field" value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value) || 0)} /></div>
              <div><label className="form-label">Balance Due (₹)</label>
                <input type="number" className="input-field" value={balanceDue} readOnly /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="form-label">Payment Date</label>
                <input type="date" className="input-field" value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Payment Status</label>
                <select id="payStatus" className="input-field">
                  <option value="paid">Paid in Full</option>
                  <option value="partial">Partial</option>
                  <option value="pending">Pending</option>
                  <option value="advance">Advance</option>
                  <option value="refund">Refund</option>
                </select>
              </div>
              <div><label className="form-label">Collected By</label>
                <input id="collectedBy" className="input-field" placeholder="Staff name" /></div>
              <div className="sm:col-span-2">
                <label className="form-label">Remarks / Notes</label>
                <textarea id="remarks" rows={2} className="input-field resize-none" placeholder="Any additional notes..." />
              </div>
            </div>
            {saveError && (
              <p className="text-sm text-red-500 mb-3">{saveError}</p>
            )}
            {savedPayment && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-3">
                ✓ Payment saved — Receipt No: <strong>{savedPayment.receiptNo}</strong>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setReceipt(true)} className="btn-primary">
                <FileText size={18} /> Generate Receipt
              </button>
              <button
                disabled={saving || !patient}
                className="btn-teal disabled:opacity-60"
                onClick={async () => {
                  if (!patient) return
                  setSaving(true)
                  setSaveError('')
                  try {
                    const status     = document.getElementById('payStatus')?.value || 'paid'
                    const collectedBy= document.getElementById('collectedBy')?.value || 'Staff'
                    const remarks    = document.getElementById('remarks')?.value || ''
                    const res = await recordPayment({
                      patientId: patient.id,
                      sessionNo: patient.sessionNo,
                      services:  lineItems.map(l => ({
                        description: l.service, qty: l.qty,
                        unitRate: l.rate, discount: l.discount,
                        amount: l.qty * l.rate - l.discount,
                      })),
                      subTotal: subtotal, gst, totalAmount: total,
                      amountPaid, balanceDue, paymentMode: payMode,
                      paymentDate, status, collectedBy, remarks,
                      ...(isPackage && {
                        isPackage: true,
                        packageName,
                        totalSessions,
                        expiryDate: pkgExpiry || undefined,
                        packageNotes: packageNotes || undefined,
                      }),
                    })
                    setSavedPayment(res.data.payment)
                    setTimeout(() => navigate('/admin/payments'), 2000)
                  } catch (err) {
                    setSaveError(err.response?.data?.error || 'Failed to save. Please try again.')
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                {saving ? 'Saving…' : 'Save Record'}
              </button>
            </div>
          </div>

        </div>
      </section>
    </PageWrapper>
  )
}
