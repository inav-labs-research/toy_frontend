import { motion } from 'framer-motion'
import './AboutUsSection.css'

const AboutUsSection = () => {
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

  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const imageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const broomVariants = {
    hidden: { opacity: 0, rotate: -45 },
    visible: {
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: {
      rotate: 10,
      y: -5,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <motion.section
      className="about-us-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="about-content">
        <motion.div className="about-illustration" variants={imageVariants}>
          <div className="dreamscape">
            <div className="cloud cloud-1"></div>
            <div className="cloud cloud-2"></div>
            <div className="cloud cloud-3"></div>
            <div className="hill hill-1"></div>
            <div className="hill hill-2"></div>
            <div className="water"></div>
            <div className="moon"></div>
            <div className="star star-1">⭐</div>
            <div className="star star-2">⭐</div>
            <div className="creature creature-1">💫</div>
            <div className="creature creature-2">💫</div>
          </div>
        </motion.div>

        <motion.div className="about-card" variants={textVariants}>
          <div className="card-header">
            <div className="card-logo">
              <span className="curita-logo-small">CURITA</span>
              <span className="logo-divider">|</span>
              <span className="inov-labs">by iNov Labs</span>
            </div>
            <motion.div
              className="broomstick"
              variants={broomVariants}
              whileHover="hover"
            >
              <div className="broom-handle"></div>
              <div className="broom-bristles"></div>
              <div className="broom-sparkles">
                <span>✨</span>
                <span>✨</span>
              </div>
            </motion.div>
          </div>
          <h2 className="about-title">ABOUT US</h2>
          <p className="about-mission">
            Our mission is to increase imagination levels through interactive experiences that enrich, educate, and entertain.
          </p>
          <motion.button
            className="read-story-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Read Our Story
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default AboutUsSection

