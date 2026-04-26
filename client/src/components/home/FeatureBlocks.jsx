import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, ArrowRight, Clock } from 'lucide-react'
import { images } from '../../lib/images'
import OptimizedImage from '../ui/OptimizedImage'

function SectionLabel({ children }) {
  return (
    <span className="text-teal font-semibold text-sm uppercase tracking-widest">{children}</span>
  )
}

// Step component for exercise journey
function JourneyStep({ num, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-teal text-white font-accent font-bold flex items-center justify-center flex-shrink-0 text-lg">
        {num}
      </div>
      <div>
        <div className="font-semibold text-navy">{title}</div>
        <div className="text-muted text-sm mt-0.5">{desc}</div>
      </div>
    </div>
  )
}

export default function FeatureBlocks() {
  return (
    <div>
      {/* --- SENIORS BLOCK --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1"
            >
              <OptimizedImage
                src={images.seniors}
                alt="Senior physiotherapy exercise session"
                aspectRatio="auto"
                className="mb-6 shadow-lg bg-white"
                animation="fadeLeft"
                objectFit="contain"
              />
              <div className="bg-navy rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #1A7F8E, transparent)', transform: 'translate(30%, -30%)' }} />
                <div className="text-teal text-sm font-semibold uppercase tracking-wider mb-6">Exercise Journey</div>
                <div className="space-y-5">
                  {[
                    { step: '01', title: 'Neck Stretches',       desc: 'Reduce cervical tension and improve range of motion' },
                    { step: '02', title: 'Shoulder Mobility',    desc: 'Restore rotator cuff function and reduce stiffness' },
                    { step: '03', title: 'Knee Strengthening',   desc: 'Quad & hamstring exercises for joint stability' },
                    { step: '04', title: 'Balance Training',     desc: 'Prevent falls and improve coordination' },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4 items-start">
                      <span className="font-accent font-bold text-gold text-xl w-10 flex-shrink-0">{s.step}</span>
                      <div>
                        <div className="font-semibold text-white">{s.title}</div>
                        <div className="text-white/60 text-sm">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-5 border-t border-white/10">
                  <div className="text-white/60 text-sm">Supervised by</div>
                  <div className="text-gold font-display font-semibold">Dr. Neha Trivedi, PT, MPT</div>
                </div>
              </div>
            </motion.div>
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-1 lg:order-2"
            >
              <SectionLabel>Senior Care</SectionLabel>
              <h2 className="section-heading text-3xl md:text-4xl mt-2 mb-4 text-navy">
                Physiotherapy for Seniors
              </h2>
              <p className="text-navy/70 text-lg font-medium mb-3">
                Specialized Care for Pain Relief, Mobility & Better Independence
              </p>
              <p className="text-muted leading-relaxed mb-6">
                As we age, our bodies require extra attention and care. Our senior physiotherapy programs are
                medically supervised, personalized, and designed to bring back the joy of movement.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Neck & Joint Pain', 'Shoulder Pain', 'Arthritis', 'Osteoporosis & Low Bone Density'].map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm text-navy">
                    <CheckCircle size={16} className="text-teal flex-shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
              <Link to="/services/seniors" className="btn-primary">
                Learn More <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- WOMEN'S HEALTH BLOCK --- */}
      <section className="py-20 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <SectionLabel>Women's Health</SectionLabel>
              <h2 className="section-heading text-3xl md:text-4xl mt-2 mb-4 text-navy">
                Post-Pregnancy Belly Not Reducing?
              </h2>
              <p className="text-muted leading-relaxed mb-6">
                Heal. Strengthen. Feel confident in your body again. Our postnatal recovery program starts with
                a comprehensive core & pelvic floor assessment — not random crunches.
              </p>

              {/* Wrong vs Right */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-red-500 font-semibold mb-3">
                    <XCircle size={18} /> Wrong Approach
                  </div>
                  {['Random crunches', 'Generic gym workouts', 'Ignoring pelvic floor', 'No professional assessment'].map((w) => (
                    <div key={w} className="text-sm text-red-700 flex items-center gap-2 mb-1.5">
                      <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />{w}
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-3">
                    <CheckCircle size={18} /> Right Approach
                  </div>
                  {['Core & pelvic assessment', 'Breathing + activation', 'Safe progressive loading', 'Supervised by MPT expert'].map((r) => (
                    <div key={r} className="text-sm text-emerald-700 flex items-center gap-2 mb-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />{r}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link to="/services/womens-health" className="btn-primary">
                  Learn More <ArrowRight size={18} />
                </Link>
                <div className="flex items-center gap-2 text-navy font-semibold text-sm bg-gold/10 border border-gold/30 px-4 py-2 rounded-full">
                  <Clock size={15} className="text-orange" />
                  7PM–8PM Batch
                  <span className="bg-orange text-white text-xs px-2 py-0.5 rounded-full">Few Spots!</span>
                </div>
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <OptimizedImage
                src={images.womensHealth}
                alt="Postnatal recovery and core activation exercise"
                aspectRatio="16/9"
                className="mb-6 shadow-lg"
                animation="fadeRight"
              />
              <div className="rounded-3xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1B2F5E, #1A7F8E)' }}
              >
                <div className="p-8 text-white">
                  <div className="text-gold text-sm font-semibold uppercase tracking-wider mb-4">Treats</div>
                  <div className="space-y-3 mb-6">
                    {['Diastasis Recti', 'Back Pain', 'Pelvic Floor Weakness', 'Postnatal Recovery', 'Prenatal Fitness'].map((c) => (
                      <div key={c} className="flex items-center gap-3 text-sm">
                        <CheckCircle size={16} className="text-teal flex-shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-5">
                    <div className="text-white/60 text-xs mb-2">Your Expert</div>
                    <div className="font-display font-semibold text-white">Dr. Neha Trivedi</div>
                    <div className="text-white/60 text-sm">MPT • Trained in Prenatal & Postnatal Pilates</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- PAIN MANAGEMENT BLOCK --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1"
            >
              <OptimizedImage
                src={images.painManagement}
                alt="Specialized neck and shoulder pain therapy"
                aspectRatio="16/9"
                className="mb-6 shadow-lg"
                animation="fadeLeft"
              />
              <div className="bg-light rounded-3xl p-8">
                <div className="text-teal text-sm font-semibold uppercase tracking-wider mb-5">Results We Deliver</div>
                <div className="space-y-4">
                  {[
                    { title: 'Chronic Neck Pain',            sub: 'Treated with specialized assessment & exercise' },
                    { title: 'Chronic Back Pain',            sub: 'Root-cause targeted therapy protocol' },
                    { title: 'Knee Replacements (TKR)',      sub: 'Post-surgery rehab & full mobility restoration' },
                    { title: 'Improved Flexibility',         sub: 'Measurable range-of-motion gains' },
                    { title: 'Better Quality of Life',       sub: 'Reduced pain, improved daily function' },
                  ].map((r) => (
                    <div key={r.title} className="flex gap-4 items-start p-4 bg-white rounded-xl border border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle size={15} className="text-teal" />
                      </div>
                      <div>
                        <div className="font-semibold text-navy text-sm">{r.title}</div>
                        <div className="text-muted text-xs mt-0.5">{r.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-1 lg:order-2"
            >
              <SectionLabel>Pain Management</SectionLabel>
              <h2 className="section-heading text-3xl md:text-4xl mt-2 mb-4 text-navy">
                Still Struggling with Back Pain, Neck Pain, or Shoulder Pain?
              </h2>
              <p className="text-orange font-semibold text-lg mb-4">
                Stop just relieving the pain — treat the cause.
              </p>
              <p className="text-muted leading-relaxed mb-5">
                Regular exercises not helping? You need a specialized program designed specifically for <em>you</em>.
                Our approach starts with a thorough assessment, not a generic exercise sheet.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Specialized Assessment', 'Supervised Exercise', 'Personalized Program', 'Long-term Results'].map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm text-navy">
                    <CheckCircle size={16} className="text-teal flex-shrink-0" /> {c}
                  </div>
                ))}
              </div>
              <Link to="/services/pain-management" className="btn-primary">
                Get Assessed <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
