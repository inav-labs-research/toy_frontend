import { motion } from 'framer-motion'
import './VideoSection.css'

const VideoSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const playButtonVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    tap: { scale: 0.95 }
  }

  return (
    <motion.section
      className="video-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="video-container">
        <div className="video-placeholder">
          <motion.button
            className="play-button"
            variants={playButtonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            aria-label="Play video"
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="rgba(139, 92, 246, 0.9)" />
              <path
                d="M10 8L16 12L10 16V8Z"
                fill="white"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.section>
  )
}

export default VideoSection

