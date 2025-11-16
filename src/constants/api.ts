// Backend API configuration (hardcoded values)

// Configuration for connecting to backend
export const API_CONFIG = {
  // Backend WebSocket URL
  // Using Cloudflare tunnel for secure WebSocket connection (wss://)
  // For local development, use: ws://localhost:5050
  WS_URL: 'wss://programs-dramatic-walt-bradford.trycloudflare.com',

  // Backend HTTP URL (if needed for REST API calls)
  // Using Cloudflare tunnel for HTTPS
  // For local development, use: http://localhost:5050
  HTTP_URL: 'https://programs-dramatic-walt-bradford.trycloudflare.com',
  
  // WebSocket endpoint path
  WS_ENDPOINT: '/api/media-stream',
}

// Helper function to build WebSocket URL
export const buildWebSocketUrl = (agentId?: string): string => {
  const params = new URLSearchParams()
  if (agentId) {
    params.append('agent_id', agentId)
  }
  return `${API_CONFIG.WS_URL}${API_CONFIG.WS_ENDPOINT}?${params.toString()}`
}

