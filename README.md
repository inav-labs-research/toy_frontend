<div align="center">

# 🎤 TOY Frontend

**Interactive Voice AI Frontend - Real-time Speech-to-Speech Communication**

![React](https://img.shields.io/badge/React-18.3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**Real-time voice agent frontend with wake word detection and WebSocket streaming**

[Features](#-features) • [Quick Start](#-quick-start) • [Wake Word Detection](#-wake-word-detection) • [WebSocket Protocol](#-websocket-protocol) • [ESP32 Integration](#-esp32-integration)

</div>

---

## ✨ Features

- 🎙️ **Real-time Audio Streaming** - Bidirectional WebSocket communication with 16kHz PCM audio
- 🔔 **Wake Word Detection** - Browser-based speech recognition for hands-free activation
- 📊 **Audio Visualization** - Real-time waveform visualization with custom styling
- 🎛️ **Call Controls** - Start, End, Mute functionality with interruption support
- 🎨 **Modern UI** - Beautiful interface with Space Grotesk font and gradient designs
- ⚡ **Low Latency** - AudioWorklet API for high-performance audio processing
- 🌐 **Cross-browser Support** - Works on Chrome, Safari, and other modern browsers

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `localhost:5050` (see [toy_backend](https://github.com/inav-labs-research/toy_backend))

### Installation

```bash
# Clone the repository
git clone https://github.com/inav-labs-research/toy_frontend.git
cd toy_frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔔 Wake Word Detection

**Browser-based wake word detection** using the Web Speech API. The system continuously listens for predefined wake words and triggers the voice agent when detected.

### How It Works

- Uses `webkitSpeechRecognition` (Safari) or `SpeechRecognition` (Chrome)
- Continuously monitors microphone input for wake word matches
- Supports multiple wake words (e.g., "hello shinchan", "hey shinchan")
- Automatic restart after detection with 2-second cooldown
- Cross-browser compatibility with fallback handling

### Configuration

Wake words are defined in `src/constants/wakeWords.ts`:

```typescript
export const DEFAULT_WAKE_WORDS = [
  "hello shinchan",
  "hey shinchan",
  "shinchan",
  // ... more wake words
]
```

### Usage

```typescript
import { useWakeWordDetection } from './hooks/useWakeWordDetection'

const { isListening, isDetected, matchedWord } = useWakeWordDetection({
  wakeWords: ['hello shinchan', 'hey shinchan'],
  onWakeWordDetected: (word) => {
    console.log('Wake word detected:', word)
    // Start voice interaction
  },
  enabled: true
})
```

---

## 📡 WebSocket Protocol

### Connection

Connect to the backend WebSocket endpoint:

```
ws://localhost:5050/api/media-stream?agent_id=shinchan
```

### Backend → Frontend Events

The backend sends the following JSON messages:

#### 1. **`start_media_streaming`**
Sent when the connection is established and ready to stream audio.

```json
{
  "event_type": "start_media_streaming"
}
```

#### 2. **`llm_text`**
Sent when the LLM generates text (before TTS).

```json
{
  "event_type": "llm_text",
  "text": "Hello! How can I help you today?"
}
```

#### 3. **`user_text`**
Sent when user speech is transcribed.

```json
{
  "event_type": "user_text",
  "text": "मुझे सबसे ज्यादा खाना बनाना पसंद है"
}
```

### Frontend → Backend Messages

#### Audio Data
Send binary PCM16 audio data (16kHz, Int16Array) directly:

```typescript
// Audio data as ArrayBuffer
websocket.send(audioBuffer)
```

#### Interruption Signal
Send text message to interrupt the agent:

```typescript
websocket.send("stop")
```

### Audio Format

- **Sample Rate**: 16000 Hz
- **Format**: PCM16 (Int16Array)
- **Channels**: Mono
- **Encoding**: Little-endian signed 16-bit integers

---

## 🔌 ESP32 Integration

Connect your ESP32-based toy device to the backend for edge computing voice interactions.

### Hardware Requirements

- ESP32 development board
- I2S MEMS microphone (e.g., INMP441)
- Speaker with I2S DAC or PWM output
- WiFi connectivity

### Sample Code

```cpp
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <driver/i2s.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend WebSocket URL
const char* wsUrl = "ws://YOUR_BACKEND_IP:5050/api/media-stream?agent_id=shinchan";

WebSocketsClient webSocket;

// I2S microphone configuration
#define I2S_WS 25
#define I2S_SD 32
#define I2S_SCK 33
#define I2S_PORT I2S_NUM_0
#define SAMPLE_RATE 16000
#define BITS_PER_SAMPLE I2S_BITS_PER_SAMPLE_16BIT

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  
  // Initialize I2S microphone
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = BITS_PER_SAMPLE,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 1024
  };
  
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD
  };
  
  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_PORT, &pin_config);
  i2s_zero_dma_buffer(I2S_PORT);
  
  // Setup WebSocket
  webSocket.begin(wsUrl);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  
  // Read audio from microphone
  int16_t audioBuffer[512];
  size_t bytesRead;
  
  i2s_read(I2S_PORT, audioBuffer, sizeof(audioBuffer), &bytesRead, portMAX_DELAY);
  
  if (bytesRead > 0 && webSocket.isConnected()) {
    // Send audio data to backend
    webSocket.sendBIN((uint8_t*)audioBuffer, bytesRead);
  }
  
  // Handle incoming audio from backend
  // (Implement speaker output here)
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket disconnected");
      break;
      
    case WStype_CONNECTED:
      Serial.println("WebSocket connected");
      break;
      
    case WStype_TEXT:
      // Handle text messages (llm_text, user_text events)
      Serial.printf("Received text: %s\n", payload);
      break;
      
    case WStype_BIN:
      // Handle binary audio data from backend
      // Play audio on speaker
      playAudio(payload, length);
      break;
      
    default:
      break;
  }
}

void playAudio(uint8_t* data, size_t length) {
  // Implement I2S speaker output here
  // Convert PCM16 data to speaker output
}
```

### ESP32 Setup Steps

1. **Install Required Libraries**:
   ```bash
   # In Arduino IDE Library Manager
   - WebSockets by Markus Sattler
   - ESP32 Audio (if using audio libraries)
   ```

2. **Configure WiFi**: Update `ssid` and `password` in the code

3. **Set Backend URL**: Update `wsUrl` with your backend server IP

4. **Hardware Connections**:
   - I2S Microphone: Connect SCK, WS, SD pins
   - Speaker: Connect via I2S DAC or PWM

5. **Upload and Monitor**: Upload code and monitor Serial output

### Wake Word Detection on ESP32

For on-device wake word detection, consider:

- **ESP-SR** (Espressif Speech Recognition)
- **TensorFlow Lite for Microcontrollers**
- **Picovoice Porcupine** (commercial solution)

Example with ESP-SR:

```cpp
#include "esp_sr_api.h"

// Initialize wake word model
esp_sr_iface_t *wake_word = &WAKEWORD_MODEL;
esp_sr_data_t *model_data = esp_sr_init(wake_word);

// In audio processing loop
if (esp_sr_process(model_data, audioBuffer, bytesRead)) {
  Serial.println("Wake word detected!");
  // Start streaming to backend
}
```

---

## 📁 Project Structure

```
toy_frontend/
├── public/
│   └── audio/              # AudioWorklet processors
│       ├── AudioWorkletProcessor.js
│       └── MicProcessor.js
├── src/
│   ├── components/         # React components
│   │   ├── CallInterface.tsx
│   │   ├── CallControls.tsx
│   │   ├── AudioVisualizer.tsx
│   │   ├── WakeWordPanel.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useWebSocket.ts
│   │   └── useWakeWordDetection.ts
│   ├── constants/
│   │   └── wakeWords.ts    # Wake word definitions
│   └── types/
│       └── speech-recognition.d.ts
├── package.json
└── vite.config.ts
```

---

## 🛠️ Configuration

### Backend URL

Update the WebSocket URL in `src/hooks/useWebSocket.ts`:

```typescript
const wsUrl = `ws://YOUR_BACKEND_IP:5050/api/media-stream?${params.toString()}`
```

### Wake Words

Customize wake words in `src/constants/wakeWords.ts`:

```typescript
export const DEFAULT_WAKE_WORDS = [
  "your custom wake word",
  "another wake word"
]
```

---

## 🐛 Troubleshooting

### Wake Word Not Detecting

- **Check microphone permissions**: Browser must have microphone access
- **Browser compatibility**: Ensure using Chrome, Safari, or Edge
- **Check console**: Look for speech recognition errors
- **Try different wake words**: Some words are easier to detect

### WebSocket Connection Issues

- **Backend running**: Ensure backend is running on port 5050
- **CORS**: Check backend CORS settings
- **Firewall**: Ensure port 5050 is accessible
- **Network**: Verify backend URL is correct

### Audio Issues

- **Sample rate**: Ensure 16kHz audio format
- **Permissions**: Check browser microphone permissions
- **AudioWorklet**: Check browser console for AudioWorklet errors

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👤 Author

**Anuj Patel**  
CEO, iNavLabs

---

## 🔗 Related Projects

- [toy_backend](https://github.com/inav-labs-research/toy_backend) - Backend server for voice AI
- [iNavLabs](https://inavlabs.com) - Company website

---

<div align="center">

Made with ❤️ by [iNavLabs](https://inavlabs.com)

</div>
