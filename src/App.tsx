import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './components/LandingPage'
import CallInterface from './components/CallInterface'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
    <div className="app">
      <main className="main-content">
        <CallInterface />
      </main>
    </div>
        } />
        <Route path="/page" element={<LandingPage />} />
      </Routes>
    </Router>
  )
}

export default App
