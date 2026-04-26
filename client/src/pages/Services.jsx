import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, HeartHandshake, Bone, Dumbbell, Baby, Activity, ArrowRight } from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import CTABanner from '../components/home/CTABanner'
import { images } from '../lib/images'

const services = [
  {
    slug: 'seniors',
    icon: Users,
    color: '#1B2F5E', bg: '#EEF2FF',
    image: images.seniors,
    title: 'Physiotherapy for Seniors',
    tagline: 'Better Movement. Better Health. Better Life.',
    desc: 'Safe, supervised physiotherapy programs for older adults focusing on pain relief, mobility, strength, and independence. Medical conditions are regularly monitored throughout care.',
    treats: ['Neck & Joint Pain', 'Shoulder Pain', 'Arthritis', 'Osteoporosis', 'Balance Issues', 'Post-fracture Recovery'],
  },
  {
    slug: 'womens-health',
    icon: HeartHandshake,
    color: '#BE185D', bg: '#FDF2F8',
    image: images.womensHealth,
    title: "Women's Health & Postnatal",
    tagline: 'Heal. Strengthen. Feel Confident Again.',
    desc: 'Specialized postnatal and prenatal care by Dr. Neha Trivedi — trained in Pilates. We begin with a thorough core and pelvic floor assessment before prescribing any exercise.',
    treats: ['Diastasis Recti', 'Pelvic Floor Weakness', 'Postnatal Back Pain', 'Prenatal Fitness', 'Incontinence', 'Hormonal Changes'],
  },
  {
    slug: 'pain-management',
    icon: Bone,
    color: '#1A7F8E', bg: '#F0FDFA',
    image: images.painManagement,
    title: 'Back, Neck & Shoulder Pain',
    tagline: 'Stop Relieving Pain — Treat the Cause.',
    desc: 'Specialized assessment followed by a supervised, personalized exercise program. We identify and target the root cause — not just the symptoms.',
    treats: ['Chronic Back Pain', 'Cervical Spondylosis', 'Shoulder Impingement', 'SI Joint Pain', 'Disc Herniation', 'Postural Issues'],
  },
  {
    slug: 'sports-rehab',
    icon: Dumbbell,
    color: '#E8630A', bg: '#FFF7ED',
    image: images.clinic,
    title: 'Sports Injury & Post-Surgery Rehab',
    tagline: 'Back to the Game, Stronger Than Before.',
    desc: 'Evidence-based progressive rehabilitation with sport-specific return-to-play protocols. Post-surgery care including TKR, ACL, hip and shoulder reconstruction.',
    treats: ['Sports Injuries', 'ACL Reconstruction', 'Knee Replacement (TKR)', 'Fracture Rehabilitation', 'Shoulder Surgery', 'Ankle Sprains'],
  },
  {
    slug: 'kids',
    icon: Baby,
    color: '#059669', bg: '#ECFDF5',
    image: images.kids,
    title: 'Kids Exercise Program',
    tagline: 'Fun, Safe & Developmentally Appropriate.',
    desc: 'Age-appropriate supervised exercise programs to support healthy physical development, posture, coordination, and overall fitness for children.',
    treats: ['Posture Correction', 'Coordination Training', 'Core Strengthening', 'Flat Feet', 'Sports Conditioning', 'Weight Management'],
  },
  {
    slug: 'sports-rehab',
    icon: Activity,
    color: '#7C3AED', bg: '#F5F3FF',
    image: images.postSurgery,
    title: 'Post-Surgery Rehabilitation',
    tagline: 'Structured Recovery, Optimal Outcomes.',
    desc: 'Comprehensive post-operative rehabilitation programs helping patients regain full function after orthopedic and neurological surgeries.',
    treats: ['Knee Replacement', 'Hip Replacement', 'Spinal Surgery', 'Rotator Cuff Repair', 'Fracture Fixation', 'Joint Replacements'],
  },
]

export default function Services() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="py-16 bg-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-teal text-sm font-semibold uppercase tracking-widest">What We Offer</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl mt-2 mb-4 text-white">Our Services</h1>
            <p className="text-white/70 text-lg">
              Comprehensive, evidence-based physiotherapy programs — each one designed specifically for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc, i) => {
              const Icon = svc.icon
              return (
                <motion.div
                  key={`${svc.slug}-${i}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1 }}
                >
                  <div className="card h-full flex flex-col overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={svc.image}
                        alt={svc.title}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col gap-5 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: svc.bg }}
                    >
                      <Icon size={22} style={{ color: svc.color }} />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display font-bold text-xl text-navy mb-1">{svc.title}</h2>
                      <p className="text-orange text-sm font-semibold mb-3">{svc.tagline}</p>
                      <p className="text-muted text-sm leading-relaxed mb-4">{svc.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {svc.treats.map((t) => (
                          <span key={t} className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background: svc.bg, color: svc.color }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      to={`/services/${svc.slug}`}
                      className="btn-outline text-sm py-2.5 justify-center mt-auto"
                    >
                      Learn More <ArrowRight size={15} />
                    </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <CTABanner />
    </PageWrapper>
  )
}
