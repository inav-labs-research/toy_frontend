import { motion } from 'framer-motion'
import './Footer.css'

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const socialIcons = [
    { name: 'Instagram', icon: '📷' },
    { name: 'Facebook', icon: '👤' },
    { name: 'Twitter', icon: '🐦' },
    { name: 'YouTube', icon: '▶️' },
    { name: 'Pinterest', icon: '📌' },
    { name: 'TikTok', icon: '🎵' }
  ]

  return (
    <motion.footer
      className="footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="footer-stars">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
            variants={itemVariants}
          />
        ))}
      </div>

      <div className="footer-content">
        <motion.div className="footer-column" variants={itemVariants}>
          <h3 className="footer-heading">About Us</h3>
          <ul className="footer-links">
            <li><a href="#our-story">Our Story</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </motion.div>

        <motion.div className="footer-column footer-center" variants={itemVariants}>
          <div className="footer-logo">
            <span className="curita-logo-footer">CURITA</span>
          </div>
          <div className="social-icons">
            {socialIcons.map((social, index) => (
              <motion.a
                key={index}
                href={`#${social.name.toLowerCase()}`}
                className="social-icon"
                aria-label={social.name}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
          <p className="copyright">© 2025 iNov Labs Inc. All Rights Reserved.</p>
        </motion.div>

        <motion.div className="footer-column" variants={itemVariants}>
          <h3 className="footer-heading">Legals</h3>
          <ul className="footer-links">
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms and Condition</a></li>
            <li><a href="#faqs">FAQs</a></li>
          </ul>
        </motion.div>
      </div>

      <motion.div
        className="footer-characters"
        variants={itemVariants}
      >
        <div className="footer-character bobby-footer">
          <div className="rocket-body"></div>
          <div className="rocket-nose"></div>
        </div>
        <div className="footer-character mamo-footer">
          <div className="monster-body"></div>
          <div className="monster-horns"></div>
        </div>
        <div className="footer-character rocky-footer">
          <div className="puppy-body"></div>
          <div className="puppy-ears"></div>
        </div>
      </motion.div>
    </motion.footer>
  )
}

export default Footer

