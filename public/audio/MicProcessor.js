class MicProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const channelData = input[0]; // Float32Array
      const int16Data = new Int16Array(channelData.length);

      for (let i = 0; i < channelData.length; i++) {
        int16Data[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32768));
      }

      // Send PCM16 to main thread
      this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
    }
    return true; // keep processor alive
  }
}

registerProcessor("mic-processor", MicProcessor);

