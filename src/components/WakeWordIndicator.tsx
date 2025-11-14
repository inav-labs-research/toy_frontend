import { motion, AnimatePresence } from 'framer-motion'
import './WakeWordIndicator.css'

interface WakeWordIndicatorProps {
  isListening?: boolean // Optional - always shows listening when enabled
  isDetected: boolean
  error: string | null
}

const WakeWordIndicator = ({ isDetected, error }: WakeWordIndicatorProps) => {
  return (
    <div className="wake-word-indicator">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="wake-word-status error"
          >
            <span className="status-icon">⚠️</span>
            <span className="status-text">{error}</span>
          </motion.div>
        ) : isDetected ? (
          <motion.div
            key="detected"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="wake-word-status detected"
          >
            <motion.span
              className="status-icon"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎯
            </motion.span>
            <span className="status-text">Wake word detected!</span>
          </motion.div>
        ) : (
          <motion.div
            key="listening"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="wake-word-status listening"
          >
            <motion.span
              className="status-icon pulse"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎤
            </motion.span>
            <span className="status-text">Listening for "hey shinchan"...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WakeWordIndicator

