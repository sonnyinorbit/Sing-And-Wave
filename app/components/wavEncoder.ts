// Utility to convert audio data to WAV format
// This version uses MediaRecorder with better MIME type handling

export async function webmBlobToWavBlob(webmBlob: Blob): Promise<Blob> {
  try {
    console.log('Starting WAV conversion, blob size:', webmBlob.size, 'bytes')
    
    // Validate input blob
    if (!webmBlob || webmBlob.size === 0) {
      throw new Error('Input blob is empty or invalid')
    }
    
    // Create a new AudioContext for decoding
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Ensure audio context is running
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    
    // Wait for audio context to be ready
    if (audioContext.state !== 'running') {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('AudioContext state:', audioContext.state)
    
    // Convert blob to array buffer
    const arrayBuffer = await webmBlob.arrayBuffer()
    console.log('Array buffer size:', arrayBuffer.byteLength, 'bytes')
    
    // Validate array buffer
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Array buffer is empty')
    }
    
    // Decode the audio data with better error handling
    let audioBuffer: AudioBuffer
    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      console.log('Audio decoded successfully:', {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        length: audioBuffer.length
      })
    } catch (decodeError) {
      console.error('Audio decode failed:', decodeError)
      
      // Try to provide a more helpful error message
      if (decodeError instanceof Error) {
        if (decodeError.message.includes('decode')) {
          throw new Error('Audio format not supported or corrupted. Try recording again.')
        }
      }
      throw new Error(`Audio decoding failed: ${decodeError instanceof Error ? decodeError.message : 'Unknown error'}`)
    }
    
    // Validate audio buffer
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Decoded audio buffer is empty')
    }
    
    // Convert AudioBuffer to WAV
    const wavBuffer = encodeWAV(audioBuffer)
    console.log('WAV encoding completed, buffer size:', wavBuffer.byteLength, 'bytes')
    
    // Close the audio context to free resources
    audioContext.close()
    
    return new Blob([wavBuffer], { type: 'audio/wav' });
  } catch (error) {
    console.error('WAV conversion error:', error)
    throw new Error(`Failed to convert to WAV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create WAV directly from microphone stream using MediaRecorder with better settings
export async function createWavFromStream(stream: MediaStream, duration: number = 5000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Creating WAV from stream, duration:', duration, 'ms')
      
      // Try to find the best supported MIME type
      const mimeTypes = [
        'audio/wav',
        'audio/webm;codecs=pcm',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg'
      ]
      
      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          console.log('Using MIME type:', mimeType)
          break
        }
      }
      
      if (!selectedMimeType) {
        console.log('No specific MIME type supported, using default')
      }
      
      // Create MediaRecorder with the best available settings
      const mediaRecorder = new MediaRecorder(stream, selectedMimeType ? { mimeType: selectedMimeType } : undefined)
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
          console.log('Chunk received:', event.data.size, 'bytes')
        }
      }
      
      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped, chunks:', chunks.length)
        
        if (chunks.length === 0) {
          reject(new Error('No audio data captured'))
          return
        }
        
        // Create blob from chunks
        const blob = new Blob(chunks, { type: selectedMimeType || 'audio/webm' })
        console.log('Recording blob created:', blob.size, 'bytes')
        
        if (blob.size === 0) {
          reject(new Error('Recording blob is empty'))
          return
        }
        
        try {
          // If we got a WAV file directly, return it
          if (selectedMimeType === 'audio/wav') {
            resolve(blob)
            return
          }
          
          // Otherwise convert to WAV
          const wavBlob = await webmBlobToWavBlob(blob)
          resolve(wavBlob)
        } catch (conversionError) {
          console.error('WAV conversion failed:', conversionError)
          // Fallback: return the original blob
          resolve(blob)
        }
      }
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        reject(new Error('MediaRecorder failed'))
      }
      
      // Start recording without timeslice to only get data when stopped
      mediaRecorder.start()
      console.log('MediaRecorder started')
      
      // Stop after duration
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
      }, duration)
      
    } catch (error) {
      reject(error)
    }
  });
}

// Helper to encode AudioBuffer to WAV format (PCM 16-bit LE)
function encodeWAV(audioBuffer: AudioBuffer): ArrayBuffer {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = audioBuffer.getChannelData(ch)[i];
      // Clamp sample to [-1, 1] range
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
} 