// Backend API configuration
// To use a different backend URL, set VITE_WS_URL and VITE_API_URL environment variables

// Get environment variable with fallback (Vite provides import.meta.env)
const getEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue
}

export const API_CONFIG = {
  // Backend WebSocket URL
  // Use wss:// for HTTPS (production) or ws:// for HTTP (local development)
  // If using nginx: ws://43.205.99.81 (port 80)
  // If direct access: ws://43.205.99.81:5050
  WS_URL: getEnvVar('VITE_WS_URL', 'ws://49.36.116.19:5050'),

  // Backend HTTP URL (if needed for REST API calls)
  // If using nginx: http://43.205.99.81 (port 80)
  // If direct access: http://43.205.99.81:5050
  HTTP_URL: getEnvVar('VITE_API_URL', 'http://49.36.116.19:5050'),
  
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

