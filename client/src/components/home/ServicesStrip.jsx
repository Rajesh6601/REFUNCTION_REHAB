import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, HeartHandshake, Bone, Dumbbell, Baby, Activity } from 'lucide-react'

const services = [
  {
    icon: Bone,
    title: 'Neck, Back & Shoulder Pain',
    desc: 'Treat the cause, not just the symptom — specialized assessment.',
    color: '#1A7F8E',
    bg: '#F0FDFA',
    to: '/services/pain-management',
  },
  {
    icon: Dumbbell,
    title: 'Sports Injury Rehab',
    desc: 'Evidence-based rehab & return-to-play protocols for athletes.',
    color: '#E8630A',
    bg: '#FFF7ED',
    to: '/services/sports-rehab',
  },
  {
    icon: HeartHandshake,
    title: "Women's Health & Postnatal",
    desc: 'Pelvic floor, diastasis recti, postnatal recovery & prenatal Pilates.',
    color: '#BE185D',
    bg: '#FDF2F8',
    to: '/services/womens-health',
  },
  {
    icon: Activity,
    title: 'Post-Surgery Rehabilitation',
    desc: 'Structured recovery after TKR, hip replacement & orthopedic surgeries.',
    color: '#7C3AED',
    bg: '#F5F3FF',
    to: '/services/sports-rehab',
  },
  {
    icon: Baby,
    title: 'Kids Exercise Program',
    desc: 'Age-appropriate programs for posture, coordination & development.',
    color: '#059669',
    bg: '#ECFDF5',
    to: '/services/kids',
  },
  {
    icon: Users,
    title: 'Physiotherapy for Seniors',
    desc: 'Safe, supervised care for pain relief, mobility & independence.',
    color: '#1B2F5E',
    bg: '#EEF2FF',
    to: '/services/seniors',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function ServicesStrip() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-teal font-semibold text-sm uppercase tracking-widest">What We Treat</span>
          <h2 className="section-heading text-3xl md:text-4xl mt-2 mb-4 text-navy">
            Our Specialized Services
          </h2>
          <p className="text-muted max-w-xl mx-auto text-base">
            Comprehensive physiotherapy programs designed around you — not a generic plan.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((svc) => {
            const Icon = svc.icon
            return (
              <motion.div key={svc.title} variants={item}>
                <Link to={svc.to} className="card p-6 flex flex-col gap-4 h-full group block">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: svc.bg }}
                  >
                    <Icon size={22} style={{ color: svc.color }} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-navy mb-2 group-hover:text-teal transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">{svc.desc}</p>
                  </div>
                  <div className="mt-auto pt-2">
                    <span className="text-teal text-sm font-semibold flex items-center gap-1">
                      Learn more
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link to="/services" className="btn-outline">
            View All Services
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
