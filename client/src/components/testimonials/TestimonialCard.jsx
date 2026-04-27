import { motion } from 'framer-motion'
import { Star, Quote, Play } from 'lucide-react'

const serviceLabels = {
  seniors:          'Senior Care',
  'womens-health':  "Women's Health",
  'pain-management':'Pain Management',
  'sports-rehab':   'Sports Rehab',
  'post-surgery':   'Post-Surgery',
  kids:             'Kids Program',
}

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < count ? 'text-gold fill-gold' : 'text-gray-200'}
          style={i < count ? { color: '#F5A623', fill: '#F5A623' } : {}}
        />
      ))}
    </div>
  )
}

export default function TestimonialCard({ testimonial, compact = false }) {
  const t = testimonial
  const displayName = t.patientInitials || t.patientName
  const ageDisplay = t.age ? `${Math.floor(t.age / 10) * 10}s` : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col h-full relative"
    >
      {/* Quote icon */}
      <div className="absolute top-4 left-5">
        <Quote size={28} style={{ color: '#1A7F8E', opacity: 0.2 }} />
      </div>

      {/* Rating */}
      <div className="mt-4 mb-3">
        <Stars count={t.rating} />
      </div>

      {/* Review text */}
      <p className={`text-text leading-relaxed flex-1 ${compact ? 'text-sm line-clamp-3' : 'text-base'}`}>
        "{t.reviewText}"
      </p>

      {/* Video indicator */}
      {t.videoUrl && (
        <a
          href={t.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-teal text-sm font-medium mt-2 hover:underline"
          style={{ color: '#1A7F8E' }}
        >
          <Play size={14} /> Watch video
        </a>
      )}

      {/* Patient info + badges */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          {t.photoUrl ? (
            <img src={t.photoUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: '#1A7F8E' }}
            >
              {(t.patientInitials || t.patientName.charAt(0)).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-navy text-sm" style={{ color: '#1B2F5E' }}>
              {displayName}
              {ageDisplay && <span className="text-muted font-normal"> &middot; {ageDisplay}</span>}
            </div>
            <div className="text-muted text-xs">{t.condition}</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: '#1A7F8E18', color: '#1A7F8E' }}
          >
            {serviceLabels[t.service] || t.service}
          </span>
          {t.outcome && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: '#4CAF5018', color: '#4CAF50' }}
            >
              {t.outcome}
            </span>
          )}
          {t.treatmentDuration && !compact && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-muted">
              {t.treatmentDuration}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
