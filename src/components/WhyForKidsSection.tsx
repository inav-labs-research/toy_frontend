import { motion } from 'framer-motion'
import { useState } from 'react'
import './WhyForKidsSection.css'

const WhyForKidsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const cards = [
    {
      icon: '🧠',
      title: 'Memory',
      description: 'Kids learns and store more information when they have fun with any activity. They learn and fun and this maintain their creativity.'
    },
    {
      icon: '🎨',
      title: 'Creativity',
      description: 'Interactive play stimulates imagination and creative thinking, helping children develop innovative problem-solving skills.'
    },
    {
      icon: '💡',
      title: 'Learning',
      description: 'Educational content delivered through engaging characters makes learning enjoyable and memorable for young minds.'
    }
  ]

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

  const cardVariants = {
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

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  return (
    <motion.section
      className="why-for-kids-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="why-content">
        <motion.h2 className="section-title" variants={cardVariants}>
          Why for Kids?
        </motion.h2>
        
        <div className="cards-carousel">
          <button className="carousel-button prev" onClick={prevCard} aria-label="Previous card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div className="cards-container">
            {cards.map((card, index) => (
              <motion.div
                key={index}
                className={`feature-card ${index === currentIndex ? 'active' : ''}`}
                variants={cardVariants}
                animate={{
                  x: (index - currentIndex) * 100 + '%',
                  opacity: Math.abs(index - currentIndex) <= 1 ? 1 : 0.3,
                  scale: index === currentIndex ? 1 : 0.9
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <div className="card-icon">{card.icon}</div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
              </motion.div>
            ))}
          </div>

          <button className="carousel-button next" onClick={nextCard} aria-label="Next card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </motion.section>
  )
}

export default WhyForKidsSection

