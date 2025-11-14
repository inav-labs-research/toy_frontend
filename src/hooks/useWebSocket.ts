import { useRef, useCallback, useEffect } from 'react'

interface UseWebSocketOptions {
  agentId?: string
  onMessage?: (data: ArrayBuffer | string) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const socketRef = useRef<WebSocket | null>(null)
  const { agentId = 'shinchan', onMessage, onOpen, onClose, onError } = options

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    try {
      const params = new URLSearchParams()
      if (agentId) {
        params.append('agent_id', agentId)
      }

      const wsUrl = `ws://localhost:5050/api/media-stream?${params.toString()}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        onOpen?.()
      }

      ws.onmessage = (event) => {
        onMessage?.(event.data)
      }

      ws.onclose = () => {
        console.log('WebSocket closed')
        socketRef.current = null
        onClose?.()
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        onError?.(error)
      }

      socketRef.current = ws
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      onError?.(error as Event)
    }
  }, [agentId, onMessage, onOpen, onClose, onError])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
  }, [])

  const send = useCallback((data: ArrayBuffer | Blob | string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(data)
      // Only log non-audio messages to avoid spam
      if (typeof data === 'string') {
        console.log('[FRONTEND] Sent message to backend:', data)
      }
    } else {
      console.warn('[FRONTEND] WebSocket is not open, cannot send data. State:', socketRef.current?.readyState)
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connect,
    disconnect,
    send,
    isConnected: socketRef.current?.readyState === WebSocket.OPEN,
    socket: socketRef.current
  }
}

