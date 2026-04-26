import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, ArrowRight } from 'lucide-react'

export default function CTABanner() {
  const wa = "https://wa.me/919900911795?text=Hi%20Dr.%20Neha%2C%20I'd%20like%20to%20book%20a%20physiotherapy%20session."
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1B2F5E 0%, #1A4F6A 60%, #1A7F8E 100%)' }}
    >
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F5A623, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #E8630A, transparent)' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white mb-5 leading-tight">
            Take the First Step Towards a{' '}
            <span style={{ color: '#F5A623' }}>Pain-Free & Active Life!</span>
          </h2>
          <p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto">
            Our experts are here to guide you at every step of your recovery and fitness journey.
            Don't wait — start your transformation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+919900911795" className="btn-primary text-base px-8 py-4">
              <Phone size={20} /> Call Us: 99009 11795
            </a>
            <Link to="/enroll" className="btn-secondary text-base px-8 py-4">
              Book Appointment <ArrowRight size={20} />
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-8">
            Mon–Sun: 9AM – 9PM &nbsp;•&nbsp; Bengaluru, Karnataka
          </p>
        </motion.div>
      </div>
    </section>
  )
}
