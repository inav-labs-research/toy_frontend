# TOY Frontend Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   cd toy_frontend
   npm install
   ```

2. **Add iNavLabs logo:**
   - Place `inavlabs.png` in the `public/` directory
   - The logo will be automatically loaded in the header

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Make sure backend is running:**
   - Backend should be running on `http://localhost:5050`
   - WebSocket endpoint: `ws://localhost:5050/api/media-stream?agent_id=shinchan`

## Features Implemented

✅ **Audio Visualizer**
- Real-time audio visualization with inav-green color (#00ff88)
- Shows both microphone input and speaker output
- Smooth wave animations

✅ **Call Controls**
- Start Call button (inav-green)
- End Call button (red)
- Mute/Unmute button (gray/red when muted)

✅ **WebSocket Integration**
- Connects to `localhost:5050`
- Handles audio streaming (PCM16, 16kHz)
- Supports interruption via "INTERRUPT" signal
- Handles JSON messages for call state

✅ **Audio Processing**
- 16kHz sample rate
- AudioWorklet API for low-latency
- Microphone capture with echo cancellation
- Real-time audio playback

✅ **UI Design**
- White background
- Space Grotesk font for "TOY" hero title
- iNavLabs logo in header
- inav-green color for buttons and visualizer
- Responsive design

## Project Structure

```
toy_frontend/
├── public/
│   └── audio/
│       ├── AudioWorkletProcessor.js  # Audio playback processor
│       └── MicProcessor.js           # Microphone capture processor
├── src/
│   ├── components/
│   │   ├── CallInterface.tsx         # Main call interface
│   │   ├── CallControls.tsx          # Start/End/Mute buttons
│   │   ├── AudioVisualizer.tsx       # Audio visualization
│   │   └── Header.tsx                # Header with logo and title
│   ├── hooks/
│   │   └── useWebSocket.ts           # WebSocket hook
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

## How It Works

1. **Starting a Call:**
   - User clicks "Start Call"
   - Audio context is initialized (16kHz)
   - Microphone access is requested
   - WebSocket connects to backend
   - Audio worklets are loaded
   - Audio streaming begins

2. **During Call:**
   - Microphone audio is captured and sent to backend
   - Backend audio is received and played
   - Visualizer shows real-time audio levels
   - Call duration is displayed

3. **Interruption:**
   - Backend sends "INTERRUPT" text message
   - Frontend stops audio playback immediately
   - User can continue speaking

4. **Ending Call:**
   - User clicks "End Call"
   - WebSocket is closed
   - Audio streams are stopped
   - Resources are cleaned up

## Configuration

Backend URL can be changed in `src/hooks/useWebSocket.ts`:
```typescript
const wsUrl = `ws://localhost:5050/api/media-stream?${params.toString()}`
```

Agent ID is set in `src/components/CallInterface.tsx`:
```typescript
agentId: 'shinchan'
```

## Troubleshooting

**Microphone not working:**
- Check browser permissions
- Ensure HTTPS or localhost (required for getUserMedia)

**WebSocket connection failed:**
- Verify backend is running on port 5050
- Check CORS settings if needed

**Audio not playing:**
- Check browser console for errors
- Verify audio worklet files are accessible at `/audio/`
- Ensure backend is sending PCM16 audio data

