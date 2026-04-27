import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import TestimonialCard from '../components/testimonials/TestimonialCard'
import { getTestimonials } from '../lib/api'

const filters = [
  { key: '',                label: 'All' },
  { key: 'seniors',        label: 'Seniors' },
  { key: 'womens-health',  label: "Women's Health" },
  { key: 'pain-management',label: 'Pain Management' },
  { key: 'sports-rehab',   label: 'Sports Injury' },
  { key: 'post-surgery',   label: 'Post-Surgery' },
  { key: 'kids',           label: 'Kids' },
]

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [visibleCount, setVisibleCount] = useState(8)

  const fetchTestimonials = (service) => {
    setLoading(true)
    setError('')
    getTestimonials(service ? { service } : {})
      .then((res) => {
        setTestimonials(res.data.testimonials || [])
        setVisibleCount(8)
      })
      .catch(() => setError('Failed to load testimonials.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTestimonials(activeFilter)
  }, [activeFilter])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero banner */}
      <section
        className="pt-32 pb-16 md:pt-40 md:pb-20 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B2F5E 0%, #1A4F6A 60%, #1A7F8E 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #F5A623, transparent)' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-bold text-3xl md:text-5xl text-white mb-4"
          >
            Patient Success Stories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-lg max-w-2xl mx-auto"
          >
            Real recovery journeys from our patients. Every story represents dedication,
            expert care, and life-changing results.
          </motion.p>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-12 md:py-16" style={{ background: '#F0F6FA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={
                  activeFilter === f.key
                    ? { background: '#1A7F8E', color: '#fff' }
                    : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-16 text-muted">Loading testimonials...</div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-16 text-red-500 flex items-center justify-center gap-2">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && testimonials.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted text-lg">No testimonials found for this category.</p>
              {activeFilter && (
                <button
                  onClick={() => setActiveFilter('')}
                  className="mt-4 text-sm font-medium"
                  style={{ color: '#1A7F8E' }}
                >
                  View all testimonials
                </button>
              )}
            </div>
          )}

          {/* Testimonial grid */}
          {!loading && !error && testimonials.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {testimonials.slice(0, visibleCount).map((t) => (
                  <TestimonialCard key={t.id} testimonial={t} />
                ))}
              </div>

              {/* Load More */}
              {visibleCount < testimonials.length && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setVisibleCount((c) => c + 8)}
                    className="px-8 py-3 rounded-full font-medium text-sm transition-all hover:shadow-md"
                    style={{ background: '#fff', color: '#1B2F5E', border: '2px solid #1B2F5E' }}
                  >
                    Load More ({testimonials.length - visibleCount} remaining)
                  </button>
                </div>
              )}

              <p className="text-center text-muted text-sm mt-6">
                Showing {Math.min(visibleCount, testimonials.length)} of {testimonials.length} testimonials
              </p>
            </>
          )}
        </div>
      </section>
    </motion.div>
  )
}
