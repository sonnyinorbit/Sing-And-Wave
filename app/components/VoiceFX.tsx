'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { EffectType } from '../hooks/useGestureControl'
import { webmBlobToWavBlob } from './wavEncoder'

interface VoiceFXProps {
  currentEffect: EffectType
  isActive: boolean
  onMicToggle?: (isOn: boolean) => void
  onRecordingComplete?: (blob: Blob) => void
}

export const VoiceFX: React.FC<VoiceFXProps> = ({ 
  currentEffect, 
  isActive, 
  onMicToggle,
  onRecordingComplete
}) => {
  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  
  // Effect nodes
  const delayNodeRef = useRef<DelayNode | null>(null)
  const feedbackGainRef = useRef<GainNode | null>(null)
  const chorusDelayRef = useRef<DelayNode | null>(null)
  const chorusGainRef = useRef<GainNode | null>(null)
  
  // Effect control gain nodes (for smooth transitions)
  const normalGainRef = useRef<GainNode | null>(null)
  const reverbControlGainRef = useRef<GainNode | null>(null)
  const chorusControlGainRef = useRef<GainNode | null>(null)
  const layeringGainRef = useRef<GainNode | null>(null)
  
  // Layering effect nodes
  const layeringDelayRef = useRef<DelayNode | null>(null)
  const layeringFeedbackRef = useRef<GainNode | null>(null)
  const layeringBufferRef = useRef<AudioBufferSourceNode | null>(null)
  const layeringBufferRef2 = useRef<AudioBufferSourceNode | null>(null)
  
  // State
  const [isMicOn, setIsMicOn] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState<string>("")
  const [recordingDuration, setRecordingDuration] = useState(0)
  const recordingStartTimeRef = useRef<number>(0)
  const layeringBufferRef3 = useRef<AudioBuffer | null>(null)
  const layeringBufferRef4 = useRef<AudioBuffer | null>(null)

  // Initialize audio system with better error handling
  const initializeAudio = useCallback(async () => {
    try {
      console.log('Initializing audio...')
      
      // Create audio context only once with optimized settings
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 48000, // Higher sample rate for better quality
          latencyHint: 'playback' // Lower latency for real-time processing
        })
        
        // Set buffer size for lower latency (if supported)
        if (audioContextRef.current.destination && (audioContextRef.current.destination as any).maxChannelCount) {
          console.log('AudioContext created with optimized settings')
        } else {
          console.log('AudioContext created')
        }
      }

      const audioContext = audioContextRef.current
      
      // Resume if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
        console.log('AudioContext resumed')
      }
      
      // Wait for audio context to be fully ready
      if (audioContext.state !== 'running') {
        console.log('Waiting for audio context to be ready...')
        await new Promise(resolve => setTimeout(resolve, 100)) // Reduced wait time
      }
      
      // Get microphone with optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
          channelCount: 1 // Mono for better performance
        } 
      })

      mediaStreamRef.current = stream
      console.log('Microphone obtained')
      
      // Create basic audio chain
      sourceNodeRef.current = audioContext.createMediaStreamSource(stream)
      gainNodeRef.current = audioContext.createGain()
      destinationNodeRef.current = audioContext.createMediaStreamDestination()
      
      // Create effect nodes with optimized parameters
      delayNodeRef.current = audioContext.createDelay(1.0) // Reduced max delay
      feedbackGainRef.current = audioContext.createGain()
      chorusDelayRef.current = audioContext.createDelay(0.03) // Shorter delay for chorus
      chorusGainRef.current = audioContext.createGain()
      
      // Create layering effect nodes
      layeringDelayRef.current = audioContext.createDelay(0.5) // Reduced delay
      layeringFeedbackRef.current = audioContext.createGain()
      
      // Create effect control gain nodes
      normalGainRef.current = audioContext.createGain()
      reverbControlGainRef.current = audioContext.createGain()
      chorusControlGainRef.current = audioContext.createGain()
      layeringGainRef.current = audioContext.createGain()
      
      // Set initial values with reduced feedback to prevent runaway
      delayNodeRef.current.delayTime.value = 0.2 // Shorter delay
      feedbackGainRef.current.gain.value = 0.3 // Reduced feedback
      chorusDelayRef.current.delayTime.value = 0.01 // Shorter chorus delay
      chorusGainRef.current.gain.value = 0.5 // Reduced chorus gain
      layeringDelayRef.current.delayTime.value = 0.3 // Shorter layering delay
      layeringFeedbackRef.current.gain.value = 0.2 // Reduced layering feedback
      
      // Set up optimized audio routing - only connect active effect
      sourceNodeRef.current.connect(gainNodeRef.current)
      
      // Connect main gain to destination for monitoring
      gainNodeRef.current.connect(audioContext.destination)
      
      // Set main gain level
      gainNodeRef.current.gain.value = 1.5 // Reduced gain to prevent clipping
      
      // Start with normal effect active
      normalGainRef.current!.gain.value = 1.0
      reverbControlGainRef.current!.gain.value = 0
      chorusControlGainRef.current!.gain.value = 0
      layeringGainRef.current!.gain.value = 0
      
      // Connect normal path to recording destination
      normalGainRef.current!.connect(destinationNodeRef.current!)
      
      setIsMicOn(true)
      if (onMicToggle) onMicToggle(true)
      
      console.log('Audio initialization complete')
      
    } catch (error) {
      console.error('Failed to initialize audio:', error)
      setIsMicOn(false)
      if (onMicToggle) onMicToggle(false)
    }
  }, [onMicToggle])

  // Apply effects with immediate switching to prevent audio cuts
  const applyEffect = useCallback((effect: EffectType) => {
    if (!gainNodeRef.current || !audioContextRef.current || !destinationNodeRef.current) {
      console.log('Cannot apply effect - audio not initialized')
      return
    }
    
    const audioContext = audioContextRef.current
    
    console.log('Applying effect:', effect)
    
    // Disconnect all current effect paths
    if (normalGainRef.current) {
      normalGainRef.current.disconnect()
    }
    if (reverbControlGainRef.current) {
      reverbControlGainRef.current.disconnect()
    }
    if (chorusControlGainRef.current) {
      chorusControlGainRef.current.disconnect()
    }
    if (layeringGainRef.current) {
      layeringGainRef.current.disconnect()
    }
    
    // Disconnect effect chains
    if (delayNodeRef.current) {
      delayNodeRef.current.disconnect()
    }
    if (chorusDelayRef.current) {
      chorusDelayRef.current.disconnect()
    }
    if (layeringDelayRef.current) {
      layeringDelayRef.current.disconnect()
    }
    
    // Connect only the selected effect path
    switch (effect) {
      case 'normal':
        // Connect normal path
        gainNodeRef.current!.connect(normalGainRef.current!)
        normalGainRef.current!.connect(audioContext.destination)
        normalGainRef.current!.connect(destinationNodeRef.current!)
        normalGainRef.current!.gain.value = 1.0
        break
        
      case 'reverb':
        // Connect reverb path
        gainNodeRef.current!.connect(reverbControlGainRef.current!)
        reverbControlGainRef.current!.connect(delayNodeRef.current!)
        delayNodeRef.current!.connect(feedbackGainRef.current!)
        feedbackGainRef.current!.connect(delayNodeRef.current!) // Feedback loop
        delayNodeRef.current!.connect(audioContext.destination)
        delayNodeRef.current!.connect(destinationNodeRef.current!)
        reverbControlGainRef.current!.gain.value = 1.0
        break
        
      case 'chorus':
        // Connect chorus path
        gainNodeRef.current!.connect(chorusControlGainRef.current!)
        chorusControlGainRef.current!.connect(chorusDelayRef.current!)
        chorusDelayRef.current!.connect(chorusGainRef.current!)
        chorusGainRef.current!.connect(audioContext.destination)
        chorusGainRef.current!.connect(destinationNodeRef.current!)
        chorusControlGainRef.current!.gain.value = 1.0
        break
        
      case 'layering':
        // Connect layering path
        gainNodeRef.current!.connect(layeringGainRef.current!)
        layeringGainRef.current!.connect(layeringDelayRef.current!)
        layeringDelayRef.current!.connect(layeringFeedbackRef.current!)
        layeringFeedbackRef.current!.connect(layeringDelayRef.current!) // Layering feedback
        layeringDelayRef.current!.connect(audioContext.destination)
        layeringDelayRef.current!.connect(destinationNodeRef.current!)
        layeringGainRef.current!.gain.value = 1.2 // Slight boost for layering
        break
        
      default:
        // Default to normal
        gainNodeRef.current!.connect(normalGainRef.current!)
        normalGainRef.current!.connect(audioContext.destination)
        normalGainRef.current!.connect(destinationNodeRef.current!)
        normalGainRef.current!.gain.value = 1.0
    }
    
    console.log('Effect applied:', effect)
  }, [])

  // Initialize when active
  useEffect(() => {
    if (isActive && !isMicOn) {
      initializeAudio()
    } else if (!isActive && isMicOn) {
      // Stop audio cleanly
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      setIsMicOn(false)
      if (onMicToggle) onMicToggle(false)
    }
  }, [isActive, initializeAudio, onMicToggle, isMicOn])

  // Apply effect when it changes
  useEffect(() => {
    if (isMicOn) {
      applyEffect(currentEffect)
    }
  }, [currentEffect, isMicOn, applyEffect])

  // Handle recording with manual start/stop
  useEffect(() => {
    if (isRecording && isMicOn && mediaStreamRef.current) {
      setRecordingStatus("Recording...")
      recordingStartTimeRef.current = Date.now()
      
      // Start recording duration timer
      const durationTimer = setInterval(() => {
        const elapsed = Date.now() - recordingStartTimeRef.current
        setRecordingDuration(Math.floor(elapsed / 1000))
      }, 1000)
      
      try {
        // Use the processed audio stream for recording (includes effects and gain)
        const stream = destinationNodeRef.current!.stream
        
        // Try to find the best supported MIME type for low latency
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
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
        
        // Create MediaRecorder with optimized settings for low latency
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType || undefined,
          audioBitsPerSecond: 128000 // Lower bitrate for less processing
        })
        const chunks: Blob[] = []
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
            console.log('Chunk received:', event.data.size, 'bytes')
          }
        }
        
        mediaRecorder.onstop = async () => {
          clearInterval(durationTimer)
          console.log('MediaRecorder stopped, chunks:', chunks.length)
          
          if (chunks.length === 0) {
            setRecordingStatus("Recording failed - no audio captured")
            return
          }
          
          // Create blob from chunks
          const blob = new Blob(chunks, { type: selectedMimeType || 'audio/webm' })
          console.log('Recording blob created:', blob.size, 'bytes')
          
          if (blob.size === 0) {
            setRecordingStatus("Recording failed - no audio captured")
            return
          }
          
          try {
            // Convert to WAV for better compatibility
            const wavBlob = await webmBlobToWavBlob(blob)
            
            console.log('VOICEFX: WAV conversion completed:', wavBlob.size, 'bytes')
            
            if (onRecordingComplete && wavBlob.size > 0) {
              console.log('VOICEFX: Calling onRecordingComplete with converted WAV blob:', wavBlob.size, 'bytes');
              onRecordingComplete(wavBlob)
              setRecordingStatus("WAV recording saved!")
              setTimeout(() => setRecordingStatus(""), 3000)
            } else {
              console.error('VOICEFX: WAV blob is empty or no callback provided')
              setRecordingStatus("Recording failed - no audio captured")
            }
          } catch (wavError) {
            console.error('VOICEFX: WAV conversion failed:', wavError)
            // Fallback: use the original blob
            if (onRecordingComplete) {
              console.log('VOICEFX: Calling onRecordingComplete with fallback blob:', blob.size, 'bytes');
              onRecordingComplete(blob)
              setRecordingStatus("Audio saved (original format)")
              setTimeout(() => setRecordingStatus(""), 3000)
            }
          }
        }
        
        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event)
          setRecordingStatus("Recording error occurred")
        }
        
        // Start recording without timeslice to only get data when stopped
        mediaRecorder.start()
        console.log('MediaRecorder started')
        
        // Store the mediaRecorder reference so we can stop it manually
        const mediaRecorderRef = { current: mediaRecorder }
        
        // Cleanup function
        return () => {
          clearInterval(durationTimer)
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
          }
        }
        
      } catch (error) {
        console.error('Recording error:', error)
        setRecordingStatus("Recording error: " + (error instanceof Error ? error.message : 'Unknown error'))
      }
    } else if (!isRecording) {
      setRecordingDuration(0)
      setRecordingStatus("")
    }
  }, [isRecording, isMicOn])

  // Cleanup
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const handleRecordingToggle = () => {
    if (!isRecording && isMicOn) {
      setIsRecording(true)
    } else if (isRecording) {
      setIsRecording(false)
    }
  }

  if (!isActive) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--yellow)",
        borderRadius: "1.5rem",
        border: "3px solid var(--black)",
        boxShadow: "0 6px 24px rgba(24,24,24,0.10)"
      }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--black)" }}>Microphone Ready</h3>
        <p style={{ color: "var(--black)", textAlign: "center", opacity: "0.8" }}>
          Click "Start Studio" to begin
        </p>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Recording Button */}
      <button
        onClick={handleRecordingToggle}
        disabled={!isMicOn}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: 'none',
          background: isRecording ? '#f44336' : '#4CAF50',
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          cursor: isMicOn ? 'pointer' : 'not-allowed',
          opacity: isMicOn ? 1 : 0.5,
          transition: 'all 0.3s ease',
          boxShadow: isRecording ? '0 0 20px rgba(244, 67, 54, 0.5)' : '0 4px 8px rgba(0,0,0,0.2)'
        }}
      >
        {isRecording ? (
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>STOP</div>
            <div style={{ fontSize: '0.8rem' }}>({recordingDuration}s)</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>RECORD</div>
            <div style={{ fontSize: '0.8rem' }}>Click to start</div>
          </div>
        )}
      </button>

      {/* Status Display */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.5rem', 
        background: '#f5f5f5', 
        borderRadius: '0.5rem',
        fontSize: '0.9rem'
      }}>
        <div><strong>Status:</strong> {recordingStatus || (isMicOn ? 'Ready' : 'Microphone off')}</div>
        <div><strong>Effect:</strong> {currentEffect.charAt(0).toUpperCase() + currentEffect.slice(1)}</div>
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        background: '#e3f2fd', 
        borderRadius: '0.5rem',
        fontSize: '0.8rem',
        textAlign: 'left'
      }}>
        <strong>Instructions:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
          <li>Click the microphone to start recording</li>
          <li>Click the stop button when finished</li>
          <li>Audio file will download automatically</li>
          <li>Effects are applied in real-time during recording</li>
        </ul>
        <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#666' }}>
          Note: Export may take a moment to process and download
        </p>
      </div>
    </div>
  )
} 