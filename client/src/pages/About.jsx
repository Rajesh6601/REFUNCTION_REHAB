import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Award, BookOpen, Heart, Users, ArrowRight } from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import CTABanner from '../components/home/CTABanner'

const milestones = [
  { year: '2009', title: 'Completed MPT', desc: 'Master of Physiotherapy with specialization in musculoskeletal conditions' },
  { year: '2012', title: 'Sports Injury Expertise', desc: 'Advanced training in sports rehabilitation and return-to-play protocols' },
  { year: '2016', title: "Women's Health Focus", desc: 'Completed prenatal & postnatal Pilates certification' },
  { year: '2024', title: 'ReFunction Rehab', desc: 'Founded the clinic to bring specialized, personalized care to Bengaluru' },
]

const values = [
  { icon: Heart,    title: 'Patient-First',    desc: "Every decision is made with the patient's well-being as the top priority." },
  { icon: BookOpen, title: 'Evidence-Based',   desc: 'Treatment protocols grounded in the latest clinical research.' },
  { icon: Users,    title: 'Personalized',     desc: 'No two patients are the same — every program is tailored to the individual.' },
  { icon: Award,    title: 'Accountable',      desc: 'We track progress, measure outcomes, and iterate for best results.' },
]

export default function About() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="py-20 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-teal font-semibold text-sm uppercase tracking-widest">About Us</span>
              <h1 className="font-display font-bold text-4xl md:text-5xl text-navy mt-2 mb-5 leading-tight">
                Meet Dr. Neha Trivedi,<br />
                <span className="text-teal">PT, MPT</span>
              </h1>
              <p className="text-muted text-lg leading-relaxed mb-4">
                With over <strong className="text-navy">15 years of clinical experience</strong>, Dr. Neha Trivedi is a
                trusted name in physiotherapy and musculoskeletal rehabilitation in Bengaluru.
              </p>
              <p className="text-muted leading-relaxed mb-6">
                Specializing in sports injury rehabilitation, women's health, and senior physiotherapy,
                Dr. Neha combines evidence-based protocols with a deeply empathetic, patient-first approach.
                She is also trained in prenatal and postnatal Pilates — a rare and highly sought-after expertise.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['MPT Qualified', 'Prenatal & Postnatal Pilates', 'Sports Injury Specialist', '15+ Years Experience'].map((b) => (
                  <span key={b} className="px-3 py-1.5 bg-white border border-teal/30 text-teal text-sm rounded-full font-medium">
                    {b}
                  </span>
                ))}
              </div>
              <Link to="/enroll" className="btn-primary">
                Book a Consultation <ArrowRight size={18} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="bg-navy rounded-3xl p-8 text-white">
                <div className="w-24 h-24 rounded-full bg-teal/20 border-4 border-teal/40 flex items-center justify-center mx-auto mb-6">
                  <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
                    <circle cx="22" cy="6" r="4" fill="#1A7F8E"/>
                    <path d="M14 14c2-3 5-5 8-4l4 2-3 6-4-2-5 8 6 4-2 4-8-5 4-13z" fill="white"/>
                    <path d="M10 18l-4 10h4l3-7 3 3 2-4-4-4-4 2z" fill="#1A7F8E"/>
                  </svg>
                </div>
                <h2 className="font-display font-bold text-2xl text-center text-white mb-1">Dr. Neha Trivedi</h2>
                <p className="text-white/60 text-center text-sm mb-6">PT, MPT — Musculoskeletal & Sports Injury Specialist</p>

                <div className="space-y-4">
                  {[
                    { label: 'Specialization',  value: 'Musculoskeletal & Sports Injury' },
                    { label: 'Additional Cert.', value: 'Prenatal & Postnatal Pilates' },
                    { label: 'Experience',       value: '15+ Years Clinical Practice' },
                    { label: 'Location',         value: 'Bengaluru, Karnataka' },
                    { label: 'Languages',        value: 'English, Hindi, Kannada' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-start gap-4 text-sm border-b border-white/10 pb-3">
                      <span className="text-white/50">{item.label}</span>
                      <span className="text-white font-medium text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-heading text-3xl md:text-4xl text-navy mb-3">Our Core Values</h2>
            <p className="text-muted max-w-xl mx-auto">Everything we do at ReFunction Rehab is guided by these principles.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={v.title}
                  className="card p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-teal/10 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-teal" />
                  </div>
                  <h3 className="font-display font-semibold text-navy mb-2">{v.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-heading text-3xl text-navy mb-3">Dr. Neha's Journey</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-teal/20" />
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                className="relative flex gap-6 mb-8"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-16 h-16 rounded-full bg-navy text-gold font-accent font-bold flex items-center justify-center flex-shrink-0 z-10 shadow-md text-sm">
                  {m.year}
                </div>
                <div className="card p-5 flex-1">
                  <h3 className="font-semibold text-navy mb-1">{m.title}</h3>
                  <p className="text-muted text-sm">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </PageWrapper>
  )
}
