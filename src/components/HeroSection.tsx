import { motion } from 'framer-motion'
import './HeroSection.css'

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const characterVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.15,
      y: -10,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  return (
    <motion.section 
      className="hero-section"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="hero-content">
        <motion.h1 className="hero-title" variants={itemVariants}>
          Talk to Mamo
        </motion.h1>
        <motion.p className="hero-subtitle" variants={itemVariants}>
          A magical workshop where toys come to life.
        </motion.p>
        
        <motion.div className="hero-characters" variants={itemVariants}>
          <motion.div
            className="character-card"
            variants={characterVariants}
            initial="rest"
            whileHover="hover"
          >
            <div className="character-image bobby">
              <div className="rocket-body"></div>
              <div className="rocket-nose"></div>
              <div className="rocket-flames"></div>
              <div className="rocket-face"></div>
            </div>
            <p className="character-name">Bobby</p>
          </motion.div>

          <motion.div
            className="character-card"
            variants={characterVariants}
            initial="rest"
            whileHover="hover"
          >
            <div className="character-image mamo">
              <div className="monster-body"></div>
              <div className="monster-horns"></div>
              <div className="monster-hair"></div>
              <div className="monster-face"></div>
              <div className="sparkles">
                <span className="sparkle">✨</span>
                <span className="sparkle">✨</span>
              </div>
            </div>
            <p className="character-name">Mamo</p>
          </motion.div>

          <motion.div
            className="character-card"
            variants={characterVariants}
            initial="rest"
            whileHover="hover"
          >
            <div className="character-image rocky">
              <div className="puppy-body"></div>
              <div className="puppy-ears"></div>
              <div className="puppy-face"></div>
            </div>
            <p className="character-name">Rocky</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default HeroSection

