import { useRef, useEffect } from 'react'
import './AudioVisualizer.css'

interface AudioVisualizerProps {
  isActive: boolean
  analyser: AnalyserNode | null
  responseAnalyser: AnalyserNode | null
}

const AudioVisualizer = ({ isActive, analyser, responseAnalyser }: AudioVisualizerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const micDataRef = useRef<Uint8Array | null>(null)
  const responseDataRef = useRef<Uint8Array | null>(null)

  const bars = 20

  useEffect(() => {
    const getAudioLevel = (data: Uint8Array, index: number): number => {
      const step = Math.floor(data.length / bars)
      const start = index * step
      const end = start + step
      let sum = 0
      for (let i = start; i < end && i < data.length; i++) {
        sum += data[i]
      }
      const average = sum / step
      return Math.min((average / 255) * 1.5, 1)
    }

    const animate = () => {
      if (containerRef.current) {
        const barElements = containerRef.current.querySelectorAll('.wave-bar')

        if (isActive && (analyser || responseAnalyser)) {
          let data: Uint8Array | undefined

          if (analyser) {
            if (!micDataRef.current) {
              micDataRef.current = new Uint8Array(analyser.frequencyBinCount)
            }
            analyser.getByteFrequencyData(micDataRef.current)
            data = micDataRef.current
          }

          if (responseAnalyser) {
            if (!responseDataRef.current) {
              responseDataRef.current = new Uint8Array(
                responseAnalyser.frequencyBinCount
              )
            }
            responseAnalyser.getByteFrequencyData(responseDataRef.current)
            if (data && responseDataRef.current) {
              for (let i = 0; i < data.length; i++) {
                data[i] = Math.max(data[i], responseDataRef.current[i])
              }
            } else {
              data = responseDataRef.current
            }
          }

          if (data) {
            barElements.forEach((bar, i) => {
              const level = getAudioLevel(data!, i)
              const height = 8 + level * 60
              ;(bar as HTMLElement).style.height = `${height}px`
            })
          }
        } else {
          barElements.forEach((bar) => {
            ;(bar as HTMLElement).style.height = '8px'
          })
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, analyser, responseAnalyser])

  return (
    <div
      ref={containerRef}
      className="waveform-bars-visualizer"
      style={{
        position: 'relative',
        width: '200px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
      }}
    >
      {[...Array(bars)].map((_, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            height: '8px',
            width: '6px',
            minHeight: '8px',
            background: 'linear-gradient(to top, #00ff88, #00cc6a)',
            borderRadius: '3px',
            transition: 'height 0.1s ease',
            opacity: '0.8',
          }}
        />
      ))}
    </div>
  )
}

export default AudioVisualizer
