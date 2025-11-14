import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DEFAULT_WAKE_WORDS } from '../constants/wakeWords'
import './WakeWordPanel.css'

interface WakeWordPanelProps {
  isListening?: boolean // Optional - always shows listening when enabled
  isDetected: boolean
  error: string | null
  matchedWord: string | null
  transcript: string
  wakeWords: string[]
  onWakeWordsChange: (words: string[]) => void
}

const WakeWordPanel = ({
  isDetected,
  error,
  matchedWord,
  transcript,
  wakeWords,
  onWakeWordsChange
}: WakeWordPanelProps) => {
  const [newWord, setNewWord] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)

  const defaultWords = DEFAULT_WAKE_WORDS

  const handleAddWord = () => {
    const trimmed = newWord.trim().toLowerCase()
    if (trimmed && !wakeWords.map(w => w.toLowerCase()).includes(trimmed)) {
      onWakeWordsChange([...wakeWords, trimmed])
      setNewWord('')
    }
  }

  const handleRemoveWord = (word: string) => {
    onWakeWordsChange(wakeWords.filter(w => w.toLowerCase() !== word.toLowerCase()))
  }

  const handleAddDefault = (word: string) => {
    const normalizedWord = word.toLowerCase()
    if (!wakeWords.map(w => w.toLowerCase()).includes(normalizedWord)) {
      onWakeWordsChange([...wakeWords, normalizedWord])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddWord()
    }
  }

  return (
    <motion.div
      className="wake-word-panel"
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="panel-header">
        <h3 className="panel-title">Wake Word Detection</h3>
        <button
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="panel-content"
          >
            {/* Status Section */}
            <div className="status-section">
              <div className="status-item">
                <span className="status-label">Status:</span>
                <span className={`status-value ${isDetected ? 'detected' : 'listening'}`}>
                  {error ? 'Error' : isDetected ? 'Detected!' : 'Listening'}
                </span>
              </div>
              {matchedWord && (
                <div className="status-item">
                  <span className="status-label">Matched:</span>
                  <span className="status-value matched-word">{matchedWord}</span>
                </div>
              )}
            </div>

            {/* Live Transcript */}
            <div className="transcript-section">
              <div className="section-header">
                <span className="section-title">Live Transcript</span>
                <span className="live-indicator">●</span>
              </div>
              <div className="transcript-box">
                <p className="transcript-text">
                  {transcript ? (
                    <span>{transcript}</span>
                  ) : (
                    <span className="transcript-placeholder">Waiting for speech...</span>
                  )}
                </p>
              </div>
            </div>

            {/* Wake Words List */}
            <div className="wake-words-section">
              <div className="section-header">
                <span className="section-title">Wake Words ({wakeWords.length})</span>
              </div>
              <div className="wake-words-list">
                {wakeWords.length === 0 ? (
                  <p className="empty-state">No wake words configured</p>
                ) : (
                  wakeWords.map((word, index) => (
                    <motion.div
                      key={`wake-word-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="wake-word-item"
                    >
                      <span className="wake-word-text">{word}</span>
                      <button
                        className="remove-button"
                        onClick={() => handleRemoveWord(word)}
                        aria-label={`Remove ${word}`}
                      >
                        ×
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Add New Word */}
            <div className="add-word-section">
              <div className="input-group">
                <input
                  type="text"
                  className="word-input"
                  placeholder="Add wake word..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button className="add-button" onClick={handleAddWord}>
                  Add
                </button>
              </div>
            </div>

            {/* Quick Add Defaults */}
            <div className="default-words-section">
              <div className="section-header">
                <span className="section-title">Quick Add</span>
              </div>
              <div className="default-words-list">
                {defaultWords.map((word: string, index: number) => (
                  <button
                    key={`default-word-${index}`}
                    className={`default-word-button ${wakeWords.map(w => w.toLowerCase()).includes(word.toLowerCase()) ? 'added' : ''}`}
                    onClick={() => handleAddDefault(word)}
                    disabled={wakeWords.map(w => w.toLowerCase()).includes(word.toLowerCase())}
                  >
                    {word}
                    {wakeWords.map(w => w.toLowerCase()).includes(word.toLowerCase()) && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="error-section">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default WakeWordPanel

