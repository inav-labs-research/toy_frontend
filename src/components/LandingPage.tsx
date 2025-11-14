import Header from './Header'
import HeroSection from './HeroSection'
import GradientBanner from './GradientBanner'
import VideoSection from './VideoSection'
import WhyForKidsSection from './WhyForKidsSection'
import CharacterIntroSection from './CharacterIntroSection'
import AboutUsSection from './AboutUsSection'
import Footer from './Footer'
import './LandingPage.css'

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <div className="hero-wrapper">
        <HeroSection />
        <GradientBanner />
      </div>
      <VideoSection />
      <WhyForKidsSection />
      <CharacterIntroSection
        name="Mamo"
        description="Greetings! I'm Mamo, spirited and funny. With boundless energy, I'm always zooming off to explore the vastness of the cosmos. Ready to soar among the stars with me?"
        characterType="mamo"
      />
      <CharacterIntroSection
        name="Bobby"
        description="Hey there! I'm Bobby, the rocket explorer. I love blasting off to new adventures and teaching kids about space, science, and the wonders of the universe. Let's launch into learning together!"
        characterType="bobby"
        reverse
      />
      <CharacterIntroSection
        name="Rocky"
        description="Woof! I'm Rocky, your friendly companion. I'm always ready to play, learn, and have fun! With my playful spirit, I help kids discover new things while keeping them entertained."
        characterType="rocky"
      />
      <AboutUsSection />
      <Footer />
    </div>
  )
}

export default LandingPage

