import { useState } from 'react'
import { motion } from 'framer-motion'

const animations = {
  fadeUp:    { initial: { opacity: 0, y: 30 },  whileInView: { opacity: 1, y: 0 } },
  fadeLeft:  { initial: { opacity: 0, x: -30 }, whileInView: { opacity: 1, x: 0 } },
  fadeRight: { initial: { opacity: 0, x: 30 },  whileInView: { opacity: 1, x: 0 } },
  scale:     { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 } },
  none:      {},
}

export default function OptimizedImage({
  src,
  alt,
  aspectRatio = '16/9',
  className = '',
  animation = 'fadeUp',
  delay = 0,
  rounded = '2xl',
  overlay = false,
  priority = false,
  objectFit = 'cover',
}) {
  const [error, setError] = useState(false)

  const anim = animations[animation] || animations.none
  const motionProps = animation !== 'none' ? {
    ...anim,
    viewport: { once: true },
    transition: { duration: 0.7, delay },
  } : {}

  return (
    <motion.div
      className={`relative overflow-hidden rounded-${rounded} ${className}`}
      style={{ aspectRatio }}
      {...motionProps}
    >
      {error ? (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1B2F5E, #1A7F8E)' }}
        >
          <span className="text-white/40 text-sm">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setError(true)}
          className={`w-full h-full ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}`}
        />
      )}
      {overlay && !error && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      )}
    </motion.div>
  )
}
