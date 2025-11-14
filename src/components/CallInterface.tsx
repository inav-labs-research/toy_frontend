import { useState, useRef, useCallback, useEffect } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { useWakeWordDetection } from '../hooks/useWakeWordDetection'
import { DEFAULT_WAKE_WORDS } from '../constants/wakeWords'
import AudioVisualizer from './AudioVisualizer'
import CallControls from './CallControls'
import WakeWordIndicator from './WakeWordIndicator'
import WakeWordPanel from './WakeWordPanel'
import './CallInterface.css'

const CallInterface = () => {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [llmText, setLlmText] = useState('')
  const [userText, setUserText] = useState('')
  const [wakeWords, setWakeWords] = useState<string[]>([...DEFAULT_WAKE_WORDS])
  const wakeWordEnabled = true // Can be made configurable in the future

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const responseAnalyserRef = useRef<AnalyserNode | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const micNodeRef = useRef<AudioWorkletNode | null>(null)
  const audioChunkCountRef = useRef(0)

  // Wake word detection
  const {
    isListening: isWakeWordListening,
    isDetected: isWakeWordDetected,
    matchedWord,
    transcript: wakeWordTranscript,
    error: wakeWordError,
    startListening: startWakeWordListening,
    stopListening: stopWakeWordListening
  } = useWakeWordDetection({
    wakeWords: wakeWords,
    enabled: wakeWordEnabled && !isCallActive, // Only listen when call is not active
    onWakeWordDetected: async (matchedWord: string) => {
      console.log('[CALL INTERFACE] Wake word detected:', matchedWord, 'starting call...')
      // Automatically start the call when wake word is detected
      if (!isCallActive) {
        try {
          await startCall()
        } catch (error) {
          console.error('[CALL INTERFACE] Failed to start call after wake word detection:', error)
        }
      }
    },
    onTranscript: (transcript: string) => {
      // Live transcript logging for debugging
      console.log('[WAKE WORD DEBUG] Live transcript:', transcript)
    }
  })

  // Store wake word functions in ref to access in WebSocket callbacks
  const wakeWordFunctionsRef = useRef({
    startListening: startWakeWordListening,
    wakeWordEnabled
  })

  useEffect(() => {
    wakeWordFunctionsRef.current = {
      startListening: startWakeWordListening,
      wakeWordEnabled
    }
  }, [startWakeWordListening, wakeWordEnabled])

  const { connect, disconnect, send, socket } = useWebSocket({
    agentId: 'shinchan',
    onMessage: async (data) => {
      if (typeof data === 'string') {
        console.log('[FRONTEND] Received string from backend:', data)
        // Handle interruption signal first
        if (data === 'stop' || data === 'INTERRUPT') {
          console.log('[FRONTEND] Interruption signal received, stopping audio playback')
          workletNodeRef.current?.port.postMessage({ command: 'stop' })
          return
        }
        
        // Handle JSON messages
        try {
          const json = JSON.parse(data)
          console.log('[FRONTEND] Received JSON from backend:', json)
          if (json.event_type === 'start_media_streaming') {
            console.log('[FRONTEND] Media streaming started')
          } else if (json.event_type === 'llm_text' && json.text) {
            // Update LLM text display instantly
            setLlmText(json.text)
            console.log('[FRONTEND] Received LLM text:', json.text.substring(0, 100))
          } else if (json.event_type === 'user_text' && json.text) {
            // Update user text display and clear previous LLM response
            setUserText(json.text)
            setLlmText('') // Clear previous LLM text when new user message arrives
            console.log('[FRONTEND] Received user text:', json.text)
          }
        } catch {
          // Not JSON, ignore
        }
      } else if (data instanceof Blob || (data && typeof data === 'object' && 'byteLength' in data)) {
        // Handle audio data
        const buffer = data instanceof Blob ? await data.arrayBuffer() : data as ArrayBuffer
        const int16Array = new Int16Array(buffer)
        // Only log occasionally to avoid spam
        if (Math.random() < 0.01) {
          console.log('[FRONTEND] Received audio from backend:', int16Array.length, 'samples')
        }
        workletNodeRef.current?.port.postMessage(int16Array)
      }
    },
    onOpen: () => {
      console.log('[FRONTEND] WebSocket opened - ready to send/receive audio')
    },
    onClose: () => {
      console.log('[FRONTEND] WebSocket closed')
      setIsCallActive(false)
      // Restart wake word detection when WebSocket closes
      if (wakeWordFunctionsRef.current.wakeWordEnabled) {
        setTimeout(() => {
          console.log('[CALL INTERFACE] WebSocket closed, restarting wake word detection...')
          wakeWordFunctionsRef.current.startListening()
        }, 500)
      }
    },
    onError: (error) => {
      console.error('[FRONTEND] WebSocket error:', error)
      setIsCallActive(false)
    }
  })

  const initializeAudio = useCallback(async () => {
    try {
      // Create audio context with 16kHz sample rate
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      })

      // Create analysers
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048
      analyserRef.current.smoothingTimeConstant = 0.8

      responseAnalyserRef.current = audioContextRef.current.createAnalyser()
      responseAnalyserRef.current.fftSize = 2048
      responseAnalyserRef.current.smoothingTimeConstant = 0.8

      // Load audio worklets
      await audioContextRef.current.audioWorklet.addModule('/audio/AudioWorkletProcessor.js')
      await audioContextRef.current.audioWorklet.addModule('/audio/MicProcessor.js')

      // Create playback worklet
      workletNodeRef.current = new AudioWorkletNode(
        audioContextRef.current,
        'linear16-player'
      )
      workletNodeRef.current.connect(audioContextRef.current.destination)
      workletNodeRef.current.connect(responseAnalyserRef.current)

      // Resume audio context
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      mediaStreamRef.current = stream

      // Create microphone source
      const source = audioContextRef.current.createMediaStreamSource(stream)

      // Create mic processor worklet
      micNodeRef.current = new AudioWorkletNode(
        audioContextRef.current,
        'mic-processor'
      )

      // Connect mic to analyser for visualization
      source.connect(analyserRef.current)
      source.connect(micNodeRef.current)

      // Send audio data to WebSocket
      audioChunkCountRef.current = 0
      micNodeRef.current.port.onmessage = (event) => {
        if (!isMuted && event.data) {
          // send() function already checks if socket is open
          audioChunkCountRef.current++
          if (audioChunkCountRef.current % 100 === 0) {
            console.log('[FRONTEND] Sent', audioChunkCountRef.current, 'audio chunks to backend')
          }
          send(event.data)
        } else if (isMuted && audioChunkCountRef.current === 0) {
          console.log('[FRONTEND] Audio muted, skipping send')
        }
      }

      // Dummy gain node to prevent feedback
      const dummyGain = audioContextRef.current.createGain()
      dummyGain.gain.value = 0
      micNodeRef.current.connect(dummyGain)
      dummyGain.connect(audioContextRef.current.destination)

      console.log('Audio initialized')
    } catch (error) {
      console.error('Error initializing audio:', error)
      throw error
    }
  }, [socket, isMuted, send])

  const cleanupAudio = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect()
      workletNodeRef.current = null
    }

    if (micNodeRef.current) {
      micNodeRef.current.disconnect()
      micNodeRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    responseAnalyserRef.current = null
  }, [])

  const startCall = useCallback(async () => {
    try {
      // Stop wake word detection when call starts
      if (wakeWordEnabled) {
        stopWakeWordListening()
      }
      
      await initializeAudio()
      connect()
      setIsCallActive(true)
      setCallDuration(0)
    } catch (error) {
      console.error('Error starting call:', error)
      alert('Failed to start call. Please check microphone permissions.')
      // Restart wake word detection if call failed
      if (wakeWordEnabled && !isCallActive) {
        startWakeWordListening()
      }
    }
  }, [initializeAudio, connect, wakeWordEnabled, stopWakeWordListening, startWakeWordListening, isCallActive])

  const endCall = useCallback(() => {
    disconnect()
    cleanupAudio()
    setIsCallActive(false)
    setCallDuration(0)
    setLlmText('')
    setUserText('')
    
    // Restart wake word detection when call ends
    if (wakeWordEnabled) {
      // Small delay to ensure audio cleanup is complete
      setTimeout(() => {
        console.log('[CALL INTERFACE] Call ended, restarting wake word detection...')
        startWakeWordListening()
      }, 500)
    }
  }, [disconnect, cleanupAudio, wakeWordEnabled, startWakeWordListening])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  // Call duration timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCallActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="call-interface">
      <WakeWordIndicator
        isListening={isWakeWordListening}
        isDetected={isWakeWordDetected}
        error={wakeWordError}
      />
      <WakeWordPanel
        isListening={isWakeWordListening}
        isDetected={isWakeWordDetected}
        error={wakeWordError}
        matchedWord={matchedWord}
        transcript={wakeWordTranscript}
        wakeWords={wakeWords}
        onWakeWordsChange={setWakeWords}
      />
      <div className="call-content">
        <AudioVisualizer
          isActive={isCallActive}
          analyser={analyserRef.current}
          responseAnalyser={responseAnalyserRef.current}
        />
        {isCallActive && (
          <div className="call-duration">{formatTime(callDuration)}</div>
        )}
        {userText && (
          <div className="user-text-display">
            <div className="user-text-label">You said:</div>
            <div className="user-text-content">{userText}</div>
          </div>
        )}
        {llmText && (
          <div className="llm-text-display">
            <div className="llm-text-label">Agent Response:</div>
            <div className="llm-text-content">{llmText}</div>
          </div>
        )}
        <CallControls
          isCallActive={isCallActive}
          isMuted={isMuted}
          onStartCall={startCall}
          onEndCall={endCall}
          onToggleMute={toggleMute}
        />
      </div>
    </div>
  )
}

export default CallInterface

