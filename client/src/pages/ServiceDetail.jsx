import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Clock, Phone, Star, Shield, Users } from 'lucide-react'
import PageWrapper from '../components/ui/PageWrapper'
import CTABanner from '../components/home/CTABanner'
import { images } from '../lib/images'


const serviceData = {
  seniors: {
    title: 'Physiotherapy for Seniors',
    tagline: 'Better Movement. Better Health. Better Life.',
    color: '#1B2F5E',
    image: images.seniors,
    hero: 'Specialized Care for Pain Relief, Mobility & Better Independence',
    desc: `As we age, our bodies need extra care. Our senior physiotherapy programs are designed to be safe, supervised, and deeply personalized.
    Dr. Neha Trivedi works closely with each patient, monitoring medical conditions and progressively advancing the exercise program at a comfortable pace.`,
    treats: ['Neck & Joint Pain', 'Shoulder Pain', 'Arthritis', 'Osteoporosis & Low Bone Density', 'Balance & Fall Prevention', 'Fracture Recovery'],
    journey: [
      { step: '01', title: 'Initial Assessment', desc: 'Comprehensive evaluation of pain, mobility, strength and balance' },
      { step: '02', title: 'Neck Stretches',     desc: 'Reduce cervical tension, improve range of motion' },
      { step: '03', title: 'Shoulder Mobility',  desc: 'Restore rotator cuff function and reduce stiffness' },
      { step: '04', title: 'Knee Strengthening', desc: 'Quad & hamstring exercises for joint stability' },
      { step: '05', title: 'Balance Training',   desc: 'Progressive balance and proprioception training to prevent falls' },
    ],
    highlights: [
      'Gentle, safe exercises tailored for age-related conditions',
      'Continuous monitoring of vitals and medical conditions',
      'Fall prevention and balance confidence programs',
      'Home exercise plans for continued progress',
    ],
    sessionInfo: { duration: '45–60 min', frequency: '3–5 sessions/week', mode: 'In-clinic & Home visits' },
  },
  'womens-health': {
    title: "Women's Health & Postnatal",
    tagline: 'Heal. Strengthen. Feel Confident Again.',
    color: '#BE185D',
    image: images.womensHealth,
    hero: 'Specialized Care from Pregnancy Through Postnatal Recovery',
    desc: `Dr. Neha Trivedi is trained in prenatal and postnatal Pilates — a specialty that allows her to safely guide women through pregnancy and recovery.
    Our approach starts with a thorough assessment of the core and pelvic floor before prescribing any exercise.`,
    treats: ['Diastasis Recti', 'Pelvic Floor Weakness', 'Back Pain During Pregnancy', 'Postnatal Recovery', 'Incontinence', 'Hormonal Musculoskeletal Changes'],
    journey: [
      { step: '01', title: 'Core & Pelvic Assessment', desc: 'Understand your baseline before starting any exercises' },
      { step: '02', title: 'Breathing Techniques',      desc: 'Diaphragmatic breathing and intra-abdominal pressure management' },
      { step: '03', title: 'Core Activation',           desc: 'Safe, targeted activation of deep core muscles' },
      { step: '04', title: 'Progressive Loading',       desc: 'Gradual strengthening of the pelvic floor and core' },
      { step: '05', title: 'Full Functional Training',  desc: 'Return to normal activities, sports, and fitness' },
    ],
    highlights: [
      'Prenatal & postnatal Pilates by certified specialist',
      'Safe exercises designed for every trimester',
      'Pelvic floor recovery and core rebuilding',
      'Small group batches for personalized attention',
    ],
    sessionInfo: { duration: '60 min', frequency: '3 sessions/week', mode: 'In-clinic (7PM–8PM batch)' },
    batch: true,
  },
  'pain-management': {
    title: 'Back, Neck & Shoulder Pain',
    tagline: 'Stop Just Relieving the Pain — Treat the Cause.',
    color: '#1A7F8E',
    image: images.painManagement,
    hero: 'Specialized Assessment & Supervised Exercise for Lasting Relief',
    desc: `Regular exercises not working? Most people get a generic set of exercises. We take a completely different approach:
    a thorough specialized assessment followed by a program designed specifically for your body, your pain, and your goals.`,
    treats: ['Chronic Back Pain', 'Cervical Spondylosis', 'Shoulder Impingement', 'SI Joint Pain', 'Disc Herniation', 'Postural Dysfunction'],
    journey: [
      { step: '01', title: 'Specialized Assessment', desc: 'Identify the true root cause of your pain' },
      { step: '02', title: 'Pain Education',         desc: 'Understand your condition and what drives your pain' },
      { step: '03', title: 'Manual Therapy',         desc: 'Hands-on treatment to relieve acute pain and restore movement' },
      { step: '04', title: 'Exercise Prescription',  desc: 'Custom therapeutic exercise program' },
      { step: '05', title: 'Functional Return',      desc: 'Graduated return to daily activities, work, and sport' },
    ],
    highlights: [
      'Root-cause analysis — not just symptom relief',
      'Hands-on manual therapy combined with exercise',
      'Posture correction and ergonomic guidance',
      'Long-term pain prevention strategies',
    ],
    sessionInfo: { duration: '45–60 min', frequency: '3–5 sessions/week', mode: 'In-clinic' },
  },
  'sports-rehab': {
    title: 'Sports Injury Rehab',
    tagline: 'Back to the Game, Stronger Than Before.',
    color: '#E8630A',
    image: images.clinic,
    hero: 'Evidence-Based Rehab for Athletes & Post-Operative Patients',
    desc: `Whether you're an athlete sidelined by injury or recovering from surgery, our evidence-based rehab programs get you back to full function safely.
    We use sport-specific protocols and work closely with your surgeon when applicable.`,
    treats: ['ACL Reconstruction', 'Knee Replacement (TKR)', 'Fracture Rehabilitation', 'Shoulder Surgery Recovery', 'Ankle Sprains', 'Muscle Tears'],
    journey: [
      { step: '01', title: 'Injury Assessment',     desc: 'Comprehensive biomechanical and functional evaluation' },
      { step: '02', title: 'Acute Phase',           desc: 'Pain control, swelling management, and early mobility' },
      { step: '03', title: 'Strength & Stability',  desc: 'Progressive strengthening around the injured area' },
      { step: '04', title: 'Functional Training',   desc: 'Sport and activity-specific movement patterns' },
      { step: '05', title: 'Return to Play/Activity', desc: 'Gradual, supervised return with performance benchmarks' },
    ],
    highlights: [
      'Surgeon-coordinated rehab protocols',
      'Sport-specific return-to-play programs',
      'Progressive loading with objective benchmarks',
      'Pre-surgery prehab for better outcomes',
    ],
    sessionInfo: { duration: '45–60 min', frequency: '4–6 sessions/week', mode: 'In-clinic' },
  },
  'post-surgery': {
    title: 'Post-Surgery Rehab',
    tagline: 'Structured Recovery, Optimal Outcomes.',
    color: '#7C3AED',
    image: images.postSurgery,
    hero: 'Comprehensive Rehabilitation After Orthopedic & Neurological Surgeries',
    desc: `Recovering from surgery requires a structured, progressive rehabilitation plan. Our post-surgery programs are designed to help you regain full function safely and effectively.
    We work closely with your surgeon to ensure your rehab aligns with surgical protocols and recovery timelines.`,
    treats: ['Knee Replacement', 'Hip Replacement', 'Spinal Surgery', 'Rotator Cuff Repair', 'Fracture Fixation', 'Joint Replacements'],
    journey: [
      { step: '01', title: 'Post-Op Assessment',     desc: 'Evaluate surgical site, pain levels, and baseline function' },
      { step: '02', title: 'Early Mobilization',     desc: 'Gentle range of motion and weight-bearing as tolerated' },
      { step: '03', title: 'Strengthening Phase',    desc: 'Progressive muscle activation and joint stability work' },
      { step: '04', title: 'Functional Restoration',  desc: 'Return to daily activities — walking, stairs, self-care' },
      { step: '05', title: 'Full Recovery',           desc: 'Advanced strengthening and return to work or sport' },
    ],
    highlights: [
      'Surgeon-coordinated rehabilitation protocols',
      'Phase-wise progression based on healing timelines',
      'Pain management and scar tissue mobilization',
      'Home exercise programs for continued recovery',
    ],
    sessionInfo: { duration: '45–60 min', frequency: '4–6 sessions/week', mode: 'In-clinic' },
  },
  kids: {
    title: 'Kids Exercise Program',
    tagline: 'Fun, Safe & Developmentally Appropriate.',
    color: '#059669',
    image: images.kids,
    hero: 'Building Strong, Healthy Bodies from the Ground Up',
    desc: `Our kids program uses age-appropriate, fun-based exercises supervised by qualified physiotherapists.
    We focus on building proper movement patterns, correcting posture early, and developing physical confidence.`,
    treats: ['Posture Correction', 'Flat Feet', 'Core Strengthening', 'Coordination & Balance', 'Sports Conditioning', 'Weight Management'],
    journey: [
      { step: '01', title: 'Child Assessment',       desc: 'Evaluate posture, movement, strength and coordination' },
      { step: '02', title: 'Fun Movement Games',     desc: 'Engagement-first approach to build exercise habits' },
      { step: '03', title: 'Core & Postural Work',   desc: 'Age-appropriate core exercises and posture education' },
      { step: '04', title: 'Sport Skills',           desc: 'Fundamental athletic movements for school sports' },
      { step: '05', title: 'Progress Review',        desc: 'Regular check-ins with parents and goal updates' },
    ],
    highlights: [
      'Fun, game-based exercises kids actually enjoy',
      'Small groups (max 8–10 kids) for personal attention',
      'Supervised by qualified physiotherapists',
      'Regular progress reports shared with parents',
    ],
    sessionInfo: { duration: '60 min', frequency: '3 sessions/week', mode: 'In-clinic (SDA location)' },
  },
}

export default function ServiceDetail() {
  const { slug } = useParams()
  const svc = serviceData[slug] || serviceData['pain-management']
  const wa = "https://wa.me/919900911795?text=Hi%20Dr.%20Neha%2C%20I'd%20like%20to%20book%20a%20physiotherapy%20session."

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative py-16 text-white overflow-hidden" style={{ background: `linear-gradient(135deg, #1B2F5E, ${svc.color})` }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${svc.image})` }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link to="/services" className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-1">
              ← All Services
            </Link>
            <h1 className="font-display font-bold text-4xl md:text-5xl mt-3 mb-4 text-white">{svc.title}</h1>
            <p className="text-white/80 text-xl mb-6">{svc.hero}</p>
            {svc.batch && (
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Clock size={15} /> 7PM–8PM Batch
                <span className="bg-orange px-2 py-0.5 rounded-full text-xs">Few Spots Left!</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left */}
            <div>
              <p className="text-orange font-semibold text-lg mb-4">{svc.tagline}</p>
              <motion.img
                src={svc.image}
                alt={svc.title}
                loading="lazy"
                className="w-full rounded-2xl shadow-lg mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              />
              {svc.desc.split('\n').map((p, i) => (
                <p key={i} className="text-muted leading-relaxed mb-4">{p.trim()}</p>
              ))}

              <h3 className="font-display font-semibold text-xl text-navy mt-8 mb-4">What We Treat</h3>
              <div className="grid grid-cols-2 gap-3">
                {svc.treats.map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-navy">
                    <CheckCircle size={16} className="text-teal flex-shrink-0" /> {t}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/enroll" className="btn-primary">
                  Book Now <ArrowRight size={18} />
                </Link>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  <Phone size={18} /> WhatsApp
                </a>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Journey */}
              <div className="bg-light rounded-3xl p-8">
                <h3 className="font-display font-semibold text-xl text-navy mb-6">Your Treatment Journey</h3>
                <div className="space-y-5">
                  {svc.journey.map((step) => (
                    <div key={step.step} className="flex gap-4 items-start">
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-accent font-bold text-sm"
                        style={{ background: svc.color, color: 'white' }}
                      >
                        {step.step}
                      </span>
                      <div>
                        <div className="font-semibold text-navy">{step.title}</div>
                        <div className="text-muted text-sm mt-0.5">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Choose Us */}
              {svc.highlights && (
                <div className="rounded-3xl p-8 text-white" style={{ background: `linear-gradient(135deg, #1B2F5E, ${svc.color})` }}>
                  <h3 className="font-display font-semibold text-xl mb-5 flex items-center gap-2">
                    <Star size={20} className="text-gold" /> Why Choose Us
                  </h3>
                  <div className="space-y-3">
                    {svc.highlights.map((h) => (
                      <div key={h} className="flex items-start gap-3 text-sm text-white/90">
                        <Shield size={16} className="text-gold flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Details */}
              {svc.sessionInfo && (
                <div className="bg-light rounded-3xl p-8">
                  <h3 className="font-display font-semibold text-xl text-navy mb-5 flex items-center gap-2">
                    <Clock size={20} className="text-teal" /> Session Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-muted text-sm">Duration</span>
                      <span className="font-semibold text-navy text-sm">{svc.sessionInfo.duration}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-muted text-sm">Frequency</span>
                      <span className="font-semibold text-navy text-sm">{svc.sessionInfo.frequency}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-muted text-sm">Mode</span>
                      <span className="font-semibold text-navy text-sm">{svc.sessionInfo.mode}</span>
                    </div>
                  </div>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-teal text-white font-semibold py-3 rounded-xl hover:bg-teal/90 transition-colors text-sm"
                  >
                    <Phone size={16} /> Book via WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <CTABanner />
    </PageWrapper>
  )
}
