import { motion } from 'framer-motion'
import './GradientBanner.css'

const GradientBanner = () => {
  const bannerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const wandVariants = {
    hidden: { opacity: 0, x: -20, rotate: -45 },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: {
      rotate: 15,
      scale: 1.1,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <motion.div
      className="gradient-banner-container"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.div
        className="gradient-banner"
        variants={bannerVariants}
      >
        <p className="banner-text">
          I can Talk, and teach science play with kids!
        </p>
        <motion.div
          className="magic-wand"
          variants={wandVariants}
          whileHover="hover"
        >
          <div className="wand-stick"></div>
          <div className="wand-sparkles">
            <span className="sparkle">✨</span>
            <span className="sparkle">✨</span>
            <span className="sparkle">✨</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default GradientBanner

