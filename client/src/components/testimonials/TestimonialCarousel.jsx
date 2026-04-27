import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import TestimonialCard from './TestimonialCard'
import { getTestimonials } from '../../lib/api'

export default function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState([])
  const [current, setCurrent]           = useState(0)
  const [paused, setPaused]             = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    getTestimonials({ featured: true, limit: 6 })
      .then((res) => setTestimonials(res.data.testimonials || []))
      .catch(() => {})
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (testimonials.length <= 1 || paused) return
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [testimonials.length, paused])

  if (testimonials.length === 0) return null

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  // Show up to 3 cards at a time on desktop
  const getVisibleCards = () => {
    const cards = []
    for (let i = 0; i < Math.min(3, testimonials.length); i++) {
      cards.push(testimonials[(current + i) % testimonials.length])
    }
    return cards
  }

  return (
    <section className="py-16 md:py-20" style={{ background: '#F0F6FA' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl" style={{ color: '#1B2F5E' }}>
            What Our Patients Say
          </h2>
          <p className="text-muted mt-3 text-lg">Real stories from real patients</p>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleCards().map((t) => (
              <TestimonialCard key={t.id} testimonial={t} compact />
            ))}
          </div>

          {/* Mobile: single card */}
          <div className="md:hidden">
            <TestimonialCard testimonial={testimonials[current]} compact />
          </div>

          {/* Navigation arrows */}
          {testimonials.length > 3 && (
            <div className="hidden md:flex items-center justify-center gap-3 mt-8">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:shadow-md transition-shadow"
                style={{ color: '#1B2F5E' }}
              >
                <ChevronLeft size={20} />
              </button>
              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="w-2.5 h-2.5 rounded-full transition-all"
                    style={{
                      background: i === current ? '#1A7F8E' : '#CBD5E1',
                      transform: i === current ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:shadow-md transition-shadow"
                style={{ color: '#1B2F5E' }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Mobile dots + arrows */}
          {testimonials.length > 1 && (
            <div className="md:hidden flex items-center justify-center gap-3 mt-6">
              <button onClick={prev} className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center" style={{ color: '#1B2F5E' }}>
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ background: i === current ? '#1A7F8E' : '#CBD5E1' }}
                  />
                ))}
              </div>
              <button onClick={next} className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center" style={{ color: '#1B2F5E' }}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* View All link */}
        <div className="text-center mt-10">
          <Link
            to="/testimonials"
            className="inline-flex items-center gap-2 font-medium hover:gap-3 transition-all"
            style={{ color: '#1A7F8E' }}
          >
            View All Testimonials <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
