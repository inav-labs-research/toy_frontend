import { useRef, useEffect, useState, useCallback } from 'react'
import { DEFAULT_WAKE_WORDS } from '../constants/wakeWords'

interface UseWakeWordDetectionOptions {
  wakeWords?: string[]
  onWakeWordDetected?: (matchedWord: string) => void
  onTranscript?: (transcript: string) => void
  enabled?: boolean
}

export const useWakeWordDetection = (options: UseWakeWordDetectionOptions = {}) => {
  const {
    wakeWords = DEFAULT_WAKE_WORDS,
    onWakeWordDetected,
    onTranscript,
    enabled = true
  } = options

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isDetected, setIsDetected] = useState(false)
  const [matchedWord, setMatchedWord] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const lastDetectionTimeRef = useRef<number>(0)
  const detectionCooldown = 2000 // 2 seconds cooldown between detections
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isManuallyStoppedRef = useRef<boolean>(false)
  const isRestartingRef = useRef<boolean>(false)
  const isSafari = useRef<boolean>(false)
  const transcriptClearIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTranscriptUpdateRef = useRef<number>(0)

  // Check if browser supports speech recognition
  const isSupported = useCallback(() => {
    const hasWebkit = 'webkitSpeechRecognition' in window
    const hasStandard = 'SpeechRecognition' in window
    // Safari uses webkit prefix and doesn't have standard, Chrome has both
    isSafari.current = hasWebkit && !hasStandard
    const isSupported = hasWebkit || hasStandard
    console.log('[WAKE WORD] Browser support check:', {
      hasWebkit,
      hasStandard,
      isSafari: isSafari.current,
      isSupported
    })
    return isSupported
  }, [])

  // Normalize text for comparison
  const normalizeText = useCallback((text: string): string => {
    return text.toLowerCase().trim().replace(/[^\w\s]/g, '')
  }, [])

  // Check if any wake word is in transcript
  const checkWakeWord = useCallback((transcript: string): { matched: boolean; word: string | null } => {
    const normalizedTranscript = normalizeText(transcript)
    
    // Check each wake word
    for (const wakeWord of wakeWords) {
      const normalizedWakeWord = normalizeText(wakeWord)
      
      // Check for exact match or contains wake word
      const words = normalizedTranscript.split(/\s+/)
      const wakeWordParts = normalizedWakeWord.split(/\s+/)
      
      // Check if wake word appears consecutively in transcript
      for (let i = 0; i <= words.length - wakeWordParts.length; i++) {
        const slice = words.slice(i, i + wakeWordParts.length).join(' ')
        if (slice === normalizedWakeWord) {
          return { matched: true, word: wakeWord }
        }
      }
      
      // Also check if transcript contains wake word as substring (more lenient)
      if (normalizedTranscript.includes(normalizedWakeWord)) {
        return { matched: true, word: wakeWord }
      }
    }
    
    return { matched: false, word: null }
  }, [wakeWords, normalizeText])

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!isSupported()) {
      setError('Speech recognition is not supported in this browser')
      return null
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      console.log('[WAKE WORD] Recognition started - listening for wake word...')
      console.log('[WAKE WORD] Browser:', isSafari.current ? 'Safari' : 'Chrome/Other')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const now = Date.now()
      
      // Cooldown check to prevent multiple rapid detections
      if (now - lastDetectionTimeRef.current < detectionCooldown) {
        return
      }

      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript + ' '
        }
      }

      // Check both final and interim results
      const fullTranscript = (finalTranscript + interimTranscript).trim()
      
      // Update transcript state and callback
      if (fullTranscript) {
        setTranscript(fullTranscript)
        lastTranscriptUpdateRef.current = Date.now() // Track when transcript was last updated
        onTranscript?.(fullTranscript)
        console.log('[WAKE WORD] Transcript:', fullTranscript)
      }
      
      // Check for wake word match
      const { matched, word } = checkWakeWord(fullTranscript)
      if (matched && word) {
        lastDetectionTimeRef.current = now
        setIsDetected(true)
        setMatchedWord(word)
        console.log('[WAKE WORD] Detected! Matched word:', word, 'Transcript:', fullTranscript)
        
        // Trigger callback with matched word
        onWakeWordDetected?.(word)
        
        // Reset detection state after a short delay
        setTimeout(() => {
          setIsDetected(false)
          setMatchedWord(null)
        }, 2000)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[WAKE WORD] Recognition error:', event.error)
      
      // Handle different error types
      if (event.error === 'no-speech') {
        // This is normal, just continue listening - don't treat as error
        return
      } else if (event.error === 'aborted') {
        // Safari often fires 'aborted' during normal operation - ignore it
        // Only treat as error if we're not in a restart cycle
        if (!isRestartingRef.current && !isManuallyStoppedRef.current) {
          console.log('[WAKE WORD] Recognition aborted (likely Safari normal behavior), will restart...')
          // Don't set error, just let it restart naturally
        }
        return
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Please check your microphone permissions.')
        isManuallyStoppedRef.current = true
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.')
        isManuallyStoppedRef.current = true
      } else if (event.error === 'network') {
        // Network errors are often temporary
        console.warn('[WAKE WORD] Network error, will retry...')
        setError(null) // Clear previous errors
      } else {
        // For other errors, log but don't necessarily stop
        console.warn('[WAKE WORD] Recognition error:', event.error)
        // Only set error for critical issues
        if (event.error !== 'service-not-allowed') {
          setError(`Recognition error: ${event.error}`)
        }
      }
    }

    recognition.onend = () => {
      // Don't set isListening to false - keep it true to show continuous listening
      console.log('[WAKE WORD] Recognition ended, restarting immediately...')
      
      // Clear any existing restart timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = null
      }
      
      // Automatically restart if enabled and not manually stopped
      if (enabled && !isManuallyStoppedRef.current) {
        isRestartingRef.current = true
        
        // Add a small delay before restarting to avoid race conditions
        // Safari needs a longer delay
        const restartDelay = isSafari.current ? 300 : 50
        
        restartTimeoutRef.current = setTimeout(() => {
          if (enabled && !isManuallyStoppedRef.current) {
            // Reinitialize if recognition ref is null
            if (!recognitionRef.current) {
              const newRecognition = initializeRecognition()
              if (newRecognition) {
                recognitionRef.current = newRecognition
              }
            }
            
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start()
                console.log('[WAKE WORD] Restarting recognition...')
                // Keep isListening true
                setIsListening(true)
              } catch (err: any) {
                // Recognition might already be starting or in wrong state
                if (err.name === 'InvalidStateError' || err.message?.includes('already started')) {
                  console.log('[WAKE WORD] Recognition already starting')
                  setIsListening(true)
                } else {
                  console.error('[WAKE WORD] Error restarting recognition:', err)
                  // Try again after a longer delay
                  restartTimeoutRef.current = setTimeout(() => {
                    if (enabled && !isManuallyStoppedRef.current) {
                      if (!recognitionRef.current) {
                        const newRecognition = initializeRecognition()
                        if (newRecognition) {
                          recognitionRef.current = newRecognition
                        }
                      }
                      if (recognitionRef.current) {
                        try {
                          recognitionRef.current.start()
                          setIsListening(true)
                        } catch (retryErr) {
                          console.error('[WAKE WORD] Failed to restart after retry:', retryErr)
                          // Even on error, keep trying - show as listening
                          setIsListening(true)
                        }
                      }
                    }
                  }, 500)
                }
              }
            }
          }
          isRestartingRef.current = false
        }, restartDelay)
      } else {
        isRestartingRef.current = false
        // Only set to false if manually stopped
        if (isManuallyStoppedRef.current) {
          setIsListening(false)
        }
      }
    }

    return recognition
  }, [enabled, checkWakeWord, onWakeWordDetected, onTranscript, isSupported])

  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported()) {
      setError('Speech recognition is not supported in this browser')
      return
    }

    // Clear any pending restart
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    isManuallyStoppedRef.current = false
    isRestartingRef.current = false

    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      setError('Microphone permission denied. Please allow microphone access.')
      isManuallyStoppedRef.current = true
      return
    }

    // Stop existing recognition if any
    if (recognitionRef.current) {
      try {
        // Set flag to prevent auto-restart
        isManuallyStoppedRef.current = true
        recognitionRef.current.stop()
        // Wait a bit for it to fully stop
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (err) {
        // Ignore if already stopped
      }
      recognitionRef.current = null
    }

    const recognition = initializeRecognition()
    if (recognition) {
      recognitionRef.current = recognition
      isManuallyStoppedRef.current = false
      try {
        recognition.start()
        console.log('[WAKE WORD] Recognition start() called successfully')
      } catch (err: any) {
        console.error('[WAKE WORD] Failed to start recognition:', err)
        if (err.name === 'InvalidStateError' || err.message?.includes('already started')) {
          // Already started, that's okay
          console.log('[WAKE WORD] Recognition already started')
          setIsListening(true) // Ensure listening state is set
        } else if (err.name === 'NotAllowedError') {
          setError('Microphone permission denied. Please allow microphone access in your browser settings.')
          isManuallyStoppedRef.current = true
        } else {
          setError('Failed to start speech recognition: ' + err.message)
          isManuallyStoppedRef.current = true
        }
      }
    }
  }, [initializeRecognition, isSupported])

  // Stop listening
  const stopListening = useCallback(() => {
    // Clear any pending restart
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    // Clear transcript clearing interval
    if (transcriptClearIntervalRef.current) {
      clearInterval(transcriptClearIntervalRef.current)
      transcriptClearIntervalRef.current = null
    }

    isManuallyStoppedRef.current = true
    isRestartingRef.current = false

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.error('[WAKE WORD] Error stopping recognition:', err)
      }
      recognitionRef.current = null
      setIsListening(false)
      setTranscript('') // Clear transcript when stopped
    }
  }, [initializeRecognition])

  // Handle page visibility to pause/resume when tab is hidden/visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause when page is hidden
        if (recognitionRef.current && isListening) {
          console.log('[WAKE WORD] Page hidden, pausing detection')
          stopListening()
        }
      } else {
        // Resume when page becomes visible
        if (enabled && !recognitionRef.current && !isManuallyStoppedRef.current) {
          console.log('[WAKE WORD] Page visible, resuming detection')
          // Small delay to ensure page is fully active
          setTimeout(() => {
            if (enabled && !recognitionRef.current && !isManuallyStoppedRef.current) {
              startListening()
            }
          }, 300)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, isListening, startListening, stopListening])

  // Restart recognition when wake words change
  useEffect(() => {
    if (enabled && recognitionRef.current && isListening) {
      // Restart recognition with new wake words
      const wasListening = isListening
      stopListening()
      setTimeout(() => {
        if (enabled && wasListening && !isManuallyStoppedRef.current) {
          startListening()
        }
      }, 200)
    }
  }, [wakeWords.join(',')]) // Only restart when wake words actually change

  // Clear transcript after 3 seconds, but reset timer when new transcript arrives
  useEffect(() => {
    if (enabled) {
      // Clear transcript after 3 seconds of being visible
      transcriptClearIntervalRef.current = setInterval(() => {
        const now = Date.now()
        // Only clear if transcript has been visible for at least 3 seconds
        if (transcript && (now - lastTranscriptUpdateRef.current >= 3000)) {
          setTranscript('')
          console.log('[WAKE WORD] Transcript cleared (visible for 3+ seconds)')
        }
      }, 500) // Check every 500ms for more responsive clearing
      
      return () => {
        if (transcriptClearIntervalRef.current) {
          clearInterval(transcriptClearIntervalRef.current)
          transcriptClearIntervalRef.current = null
        }
      }
    } else {
      // Clear interval when disabled
      if (transcriptClearIntervalRef.current) {
        clearInterval(transcriptClearIntervalRef.current)
        transcriptClearIntervalRef.current = null
      }
    }
  }, [enabled, transcript])

  // Auto-start when enabled - always keep listening
  useEffect(() => {
    if (enabled && !document.hidden && !isManuallyStoppedRef.current) {
      if (!recognitionRef.current) {
        // Request permission and start listening
        // Chrome requires explicit permission request before starting recognition
        const requestPermissionAndStart = async () => {
          try {
            // Request microphone permission explicitly for Chrome
            await navigator.mediaDevices.getUserMedia({ audio: true })
            console.log('[WAKE WORD] Microphone permission granted, starting recognition...')
            
            // Now start listening with proper permission
            if (enabled && !recognitionRef.current && !document.hidden && !isManuallyStoppedRef.current) {
              await startListening()
            }
          } catch (err) {
            console.error('[WAKE WORD] Failed to get microphone permission:', err)
            setError('Microphone permission denied. Please allow microphone access.')
            isManuallyStoppedRef.current = true
          }
        }
        
        // Small delay to ensure everything is ready
        const startTimer = setTimeout(() => {
          if (enabled && !recognitionRef.current && !document.hidden && !isManuallyStoppedRef.current) {
            requestPermissionAndStart()
          }
        }, 500)
        
        return () => {
          clearTimeout(startTimer)
        }
      } else if (!isListening) {
        // If recognition exists but not listening, restart it
        try {
          recognitionRef.current.start()
          setIsListening(true)
        } catch (err) {
          // If error, reinitialize
          setTimeout(() => {
            if (enabled && !isManuallyStoppedRef.current) {
              startListening()
            }
          }, 500)
        }
      }
    } else if (!enabled && recognitionRef.current) {
      stopListening()
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
      }
      // Don't stop on cleanup if enabled - let it continue
      if (!enabled && recognitionRef.current) {
        stopListening()
      }
    }
  }, [enabled, isListening, startListening, stopListening])

  return {
    isListening,
    isDetected,
    matchedWord,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported: isSupported()
  }
}

