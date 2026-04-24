import { motion } from 'framer-motion'
import { Award, Shield, UserCheck, Zap } from 'lucide-react'

const stats = [
  { icon: Award,    value: '15+',    label: 'Years Experience',          desc: 'Trusted expertise in physiotherapy & rehabilitation' },
  { icon: Shield,   value: '100%',   label: 'Safe & Supervised',         desc: 'Medical conditions monitored throughout every session' },
  { icon: UserCheck,value: '5000+',  label: 'Patients Helped',           desc: 'From acute injuries to chronic conditions' },
  { icon: Zap,      value: '98%',    label: 'Satisfaction Rate',         desc: 'Personalized & effective care, always' },
]

const conditions = [
  'Back Pain & Neck Pain', 'Postural Correction', 'SI Joint Pain',
  'Fracture Rehabilitation', 'Sports Injuries', 'Orthopedic Conditions',
  'Neurological Conditions', 'Arthritis', 'Osteoporosis',
  'Diastasis Recti', 'Pelvic Floor Weakness', 'Post-Surgery Recovery',
]

export default function WhyChooseUs() {
  return (
    <>
      {/* Stats Band */}
      <section className="py-16 bg-teal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">
              Why Choose ReFunction Rehab?
            </h2>
            <p className="text-white/75 max-w-xl mx-auto">
              We don't just treat symptoms — we find the root cause and build a program that works for you.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="text-center p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
                    <Icon size={22} className="text-gold" />
                  </div>
                  <div className="font-accent font-bold text-4xl text-gold">{s.value}</div>
                  <div className="font-semibold text-white mt-1 mb-1">{s.label}</div>
                  <div className="text-white/65 text-xs leading-relaxed">{s.desc}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-16 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-teal font-semibold text-sm uppercase tracking-widest">Our Expertise</span>
            <h2 className="section-heading text-3xl md:text-4xl mt-2 mb-3 text-navy">
              Conditions We Treat
            </h2>
            <p className="text-muted max-w-xl mx-auto text-base">
              From chronic pain to post-surgical recovery, we cover a wide spectrum of physiotherapy needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {conditions.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="px-4 py-2.5 rounded-full bg-white border border-teal/20 text-navy text-sm font-medium shadow-sm hover:border-teal hover:text-teal transition-colors cursor-default"
              >
                {c}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
