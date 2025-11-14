import { motion } from 'framer-motion'
import './CharacterIntroSection.css'

interface CharacterIntroProps {
  name: string
  description: string
  characterType: 'mamo' | 'bobby' | 'rocky'
  reverse?: boolean
}

const CharacterIntroSection = ({ name, description, characterType, reverse = false }: CharacterIntroProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.1
      }
    }
  }

  const textVariants = {
    hidden: { opacity: 0, x: reverse ? 50 : -50 },
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
    hidden: { opacity: 0, x: reverse ? -50 : 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3
      }
    }
  }

  const renderCharacter = () => {
    if (characterType === 'mamo') {
      return (
        <div className="character-image mamo-large">
          <div className="monster-body"></div>
          <div className="monster-horns"></div>
          <div className="monster-hair"></div>
          <div className="monster-face"></div>
        </div>
      )
    } else if (characterType === 'bobby') {
      return (
        <div className="character-image bobby-large">
          <div className="rocket-body"></div>
          <div className="rocket-nose"></div>
          <div className="rocket-flames"></div>
          <div className="rocket-face"></div>
        </div>
      )
    } else {
      return (
        <div className="character-image rocky-large">
          <div className="puppy-body"></div>
          <div className="puppy-ears"></div>
          <div className="puppy-face"></div>
        </div>
      )
    }
  }

  return (
    <motion.section
      className={`character-intro-section ${reverse ? 'reverse' : ''}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="character-intro-content">
        <motion.div className="character-text" variants={textVariants}>
          <div className="character-header">
            <h2 className="character-title">I'm {name}!</h2>
            <button className="speaker-button" aria-label="Play audio">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
          </div>
          <p className="character-description">{description}</p>
          <motion.button
            className="shop-now-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop Now
          </motion.button>
        </motion.div>

        <motion.div
          className="character-visual"
          variants={imageVariants}
          whileHover="hover"
        >
          {renderCharacter()}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default CharacterIntroSection

