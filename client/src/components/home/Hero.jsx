import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
})

export default function Hero() {
  const wa = "https://wa.me/919900911795?text=Hi%20Dr.%20Neha%2C%20I'd%20like%20to%20book%20a%20physiotherapy%20session."
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1B2F5E 0%, #1A4F6A 50%, #1A7F8E 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #1A7F8E, transparent)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #E8630A, transparent)', transform: 'translate(-30%, 30%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-32 lg:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <motion.div {...fadeUp(0.1)}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur"
            >
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              Bengaluru's Trusted Physiotherapy Center
            </motion.div>

            <motion.h1 {...fadeUp(0.2)}
              className="font-display font-bold text-white leading-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Specialized{' '}
              <span style={{ color: '#F5A623' }}>Physiotherapy</span>{' '}
              Care in Bengaluru
            </motion.h1>

            <motion.p {...fadeUp(0.35)}
              className="text-white/80 text-lg md:text-xl leading-relaxed mb-3"
            >
              Better Movement. Better Health. Better Life.
            </motion.p>
            <motion.p {...fadeUp(0.4)}
              className="text-white/65 text-base leading-relaxed mb-8 max-w-lg"
            >
              Led by <strong className="text-white">Dr. Neha Trivedi, PT, MPT</strong> with 15+ years of expertise
              in musculoskeletal & sports injury rehabilitation, prenatal & postnatal Pilates.
            </motion.p>

            <motion.div {...fadeUp(0.5)} className="flex flex-wrap gap-4">
              <Link to="/enroll" className="btn-primary text-base px-8 py-4">
                Book Appointment <ArrowRight size={18} />
              </Link>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-secondary text-base px-8 py-4">
                <Phone size={18} /> WhatsApp Us
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div {...fadeUp(0.65)} className="mt-10 flex flex-wrap gap-8">
              {[
                { value: '15+', label: 'Years Experience' },
                { value: '5000+', label: 'Patients Treated' },
                { value: '98%', label: 'Satisfaction Rate' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-accent font-bold text-3xl text-gold">{s.value}</div>
                  <div className="text-white/60 text-sm mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visual card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main card */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-white">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-teal/30 border-2 border-teal flex items-center justify-center mb-4">
                    <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
                      <circle cx="22" cy="6" r="4" fill="#1A7F8E"/>
                      <path d="M14 14c2-3 5-5 8-4l4 2-3 6-4-2-5 8 6 4-2 4-8-5 4-13z" fill="white"/>
                      <path d="M10 18l-4 10h4l3-7 3 3 2-4-4-4-4 2z" fill="#1A7F8E"/>
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-xl">Dr. Neha Trivedi</h3>
                  <p className="text-white/70 text-sm mt-1">PT, MPT — Musculoskeletal & Sports Injury Specialist</p>
                </div>
                <div className="space-y-3">
                  {[
                    'Musculoskeletal & Sports Injuries',
                    'Prenatal & Postnatal Pilates',
                    'Senior Physiotherapy',
                    "Women's Health & Pelvic Floor",
                    'Post-Surgery Rehabilitation',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-white/80">
                      <div className="w-5 h-5 rounded-full bg-teal/30 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                          <path d="M1 5l3 3 7-7" stroke="#1A7F8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-orange text-white rounded-2xl px-4 py-3 shadow-xl">
                <div className="font-accent font-bold text-2xl">15+</div>
                <div className="text-xs text-white/90">Years Exp.</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 80 L0 40 Q360 0 720 40 Q1080 80 1440 40 L1440 80 Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
