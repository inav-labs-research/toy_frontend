import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './components/LandingPage'
import CallInterface from './components/CallInterface'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/test_websocket" element={
    <div className="app">
      <main className="main-content">
        <CallInterface />
      </main>
    </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
