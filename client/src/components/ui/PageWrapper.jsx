import { motion } from 'framer-motion'

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="pt-[104px]"
    >
      {children}
    </motion.div>
  )
}
