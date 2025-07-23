'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useGestureControl, GestureType } from '../hooks/useGestureControl'

interface HandTrackerProps {
  onGestureChange: (gesture: GestureType) => void
  isActive: boolean
  onCameraToggle?: (isOn: boolean) => void
  onMicToggle?: (isOn: boolean) => void
  onGestureFeedback?: (feedback: { icon: string; name: string; confidence: number }) => void
}

declare global {
  interface Window {
    Hands: any
    Camera: any
    drawConnectors: any
    drawLandmarks: any
  }
}

export const HandTracker: React.FC<HandTrackerProps> = ({ 
  onGestureChange, 
  isActive, 
  onCameraToggle,
  onMicToggle,
  onGestureFeedback 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const { processHandLandmarks, currentGesture, confidence, icon, name } = useGestureControl()

  // Cleanup function to properly close MediaPipe resources
  const cleanupMediaPipe = useCallback(() => {
    if (cameraRef.current) {
      try {
        cameraRef.current.stop()
        cameraRef.current = null
      } catch (e) {
        console.warn('Error stopping camera:', e)
      }
    }
    
    if (handsRef.current) {
      try {
        handsRef.current.close()
        handsRef.current = null
      } catch (e) {
        console.warn('Error closing hands:', e)
      }
    }
    
    setIsInitialized(false)
    setIsCameraOn(false)
  }, [])

  // Initialize MediaPipe Hands with improved settings
  const initializeMediaPipe = useCallback(async () => {
    console.log('Initializing MediaPipe...')
    if (handsRef.current) {
      console.log('Cleaning up existing MediaPipe instance...')
      cleanupMediaPipe()
    }

    try {
      console.log('Importing MediaPipe modules...')
      // Dynamically import MediaPipe modules
      const { Hands } = await import('@mediapipe/hands')
      const { Camera } = await import('@mediapipe/camera_utils')
      const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils')

      // Initialize hands detection with more responsive settings
      handsRef.current = new Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        }
      })

      handsRef.current.setOptions({
        maxNumHands: 1, // Only detect one hand
        modelComplexity: 0, // Lower for speed
        minDetectionConfidence: 0.5, // Higher for more stable detection
        minTrackingConfidence: 0.5   // Higher for more stable tracking
      })

      // Handle hand detection results
      handsRef.current.onResults((results: any) => {
        const canvasCtx = canvasRef.current?.getContext('2d')
        if (!canvasCtx || !videoRef.current) return

        // Ensure canvas matches video size
        if (!canvasRef.current) return;
        const width = videoRef.current.videoWidth || 320
        const height = videoRef.current.videoHeight || 240
        canvasRef.current.width = width
        canvasRef.current.height = height
        canvasCtx.save()
        canvasCtx.clearRect(0, 0, width, height)
        canvasCtx.drawImage(results.image, 0, 0, width, height)

        // Draw hand landmarks
        if (results.multiHandLandmarks) {
          for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, (Hands as any).HAND_CONNECTIONS, {
              color: '#7c3aed',
              lineWidth: 3
            })
            drawLandmarks(canvasCtx, landmarks, {
              color: '#d0f5c7',
              lineWidth: 2,
              radius: 4
            })

            // Process landmarks for gesture detection
            processHandLandmarks(landmarks)
          }
        } else {
          // No hands detected - reset gesture
          processHandLandmarks([])
        }

        canvasCtx.restore()
      })

      // Initialize camera with optimized settings for audio performance
      if (videoRef.current) {
        console.log('Creating MediaPipe Camera...')
        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current })
            }
          },
          width: 320,
          height: 240
        })

        console.log('Starting MediaPipe Camera...')
        await cameraRef.current.start()
        console.log('MediaPipe Camera started successfully')
        setIsCameraOn(true)
        setIsInitialized(true)
        setError(null)
        
        if (onCameraToggle) onCameraToggle(true)
      } else {
        console.error('Video ref not available for camera initialization')
        setError('Camera element not found')
      }

    } catch (err) {
      console.error('Failed to initialize MediaPipe:', err)
      setError('Failed to initialize camera. Please check permissions and try again.')
      cleanupMediaPipe()
    }
  }, [processHandLandmarks, cleanupMediaPipe, onCameraToggle])

  // Start camera when isActive changes
  useEffect(() => {
    console.log('HandTracker isActive changed:', { isActive, isInitialized })
    if (isActive && !isInitialized) {
      console.log('Starting MediaPipe initialization...')
      initializeMediaPipe()
    } else if (!isActive && isInitialized) {
      console.log('Stopping MediaPipe...')
      cleanupMediaPipe()
      if (onCameraToggle) onCameraToggle(false)
    }
  }, [isActive, isInitialized, initializeMediaPipe, cleanupMediaPipe, onCameraToggle])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMediaPipe()
    }
  }, [cleanupMediaPipe])

  // Notify parent component of gesture changes
  useEffect(() => {
    onGestureChange(currentGesture)
    if (typeof onGestureFeedback === 'function') {
      onGestureFeedback({ icon, name, confidence })
    }
  }, [currentGesture, onGestureChange, icon, name, confidence, onGestureFeedback])

  if (!isActive) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--yellow)",
        borderRadius: "1.5rem",
        border: "3px solid var(--black)",
        boxShadow: "0 6px 24px rgba(24,24,24,0.10)"
      }}>
        <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--black)" }}>📷</div>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--black)" }}>Camera Ready</h3>
        <p style={{ color: "var(--black)", textAlign: "center", opacity: "0.8" }}>
          Camera will start automatically when you begin
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "#fef2f2",
        borderRadius: "1.5rem",
        border: "3px solid #fecaca"
      }}>
        <p style={{ color: "#dc2626", fontWeight: "600", textAlign: "center", marginBottom: "1rem" }}>{error}</p>
        <button 
          onClick={() => {
            setError(null)
            initializeMediaPipe()
          }}
          style={{
            padding: "0.5rem 1rem",
            background: "#dc2626",
            color: "white",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1.5rem"
    }}>
      {/* Camera Feed */}
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          style={{
            width: "320px",
            height: "240px",
            objectFit: "cover",
            borderRadius: "1.5rem",
            border: "3px solid var(--black)",
            boxShadow: "0 6px 24px rgba(24,24,24,0.10)"
          }}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "320px",
            height: "240px",
            borderRadius: "1.5rem"
          }}
          width={320}
          height={240}
        />
        
        {/* Loading overlay */}
        {!isInitialized && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "1.5rem"
          }}>
            <div style={{ color: "white", textAlign: "center" }}>
              <div style={{
                width: "2rem",
                height: "2rem",
                border: "2px solid white",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 0.5rem auto"
              }}></div>
              <p>Initializing camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Gesture Indicator */}
      <div style={{
        background: "var(--yellow)",
        borderRadius: "1.5rem",
        padding: "1.5rem",
        minWidth: "280px",
        textAlign: "center",
        border: "3px solid var(--black)",
        boxShadow: "0 6px 24px rgba(24,24,24,0.10)"
      }}>
        <p style={{ color: "var(--black)", fontWeight: "700", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          {name}
        </p>
        {confidence > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <div style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.5)",
              borderRadius: "0.5rem",
              height: "0.75rem",
              marginBottom: "0.5rem"
            }}>
              <div 
                style={{
                  background: "linear-gradient(to right, #7c3aed, #5b21b6)",
                  height: "100%",
                  borderRadius: "0.5rem",
                  transition: "width 0.3s ease",
                  width: `${confidence * 100}%`
                }}
              ></div>
            </div>
            <p style={{ color: "var(--black)", fontSize: "0.8rem", fontWeight: "600" }}>
              Confidence: {Math.round(confidence * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        background: "var(--white)",
        borderRadius: "1.5rem",
        padding: "1.5rem",
        border: "3px solid var(--black)",
        boxShadow: "0 6px 24px rgba(24,24,24,0.10)",
        maxWidth: "320px"
      }}>
        <h3 style={{ color: "var(--black)", fontWeight: "700", fontSize: "1.1rem", marginBottom: "0.75rem", textAlign: "center" }}>
          Wave your hand to control voice effects
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "var(--black)" }}>Open hand → Normal voice</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "var(--black)" }}>Fist → Reverb</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "var(--black)" }}>Two fingers → Layering (index + pinky)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "var(--black)" }}>Three fingers → Chorus</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "var(--black)" }}>Swipe down → Stop all FX</span>
          </div>
        </div>
      </div>
    </div>
  )
} 