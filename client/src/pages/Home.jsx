import { motion } from 'framer-motion'
import Hero from '../components/home/Hero'
import ServicesStrip from '../components/home/ServicesStrip'
import WhyChooseUs from '../components/home/WhyChooseUs'
import FeatureBlocks from '../components/home/FeatureBlocks'
import CTABanner from '../components/home/CTABanner'

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Hero />
      <ServicesStrip />
      <WhyChooseUs />
      <FeatureBlocks />
      <CTABanner />
    </motion.div>
  )
}
