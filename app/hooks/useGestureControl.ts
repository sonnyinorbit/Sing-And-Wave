import { useState, useCallback, useRef } from 'react'

export type GestureType =
  | 'open_hand' // 5 fingers
  | 'fist'      // 0 fingers
  | 'two_fingers' // 2 fingers
  | 'three_fingers' // 3 fingers
  | 'swipe_down' // Stop all effects
  | 'none'

export type EffectType =
  | 'normal'
  | 'reverb'
  | 'layering'
  | 'chorus'

interface HandLandmarks {
  x: number
  y: number
  z: number
}

interface GestureState {
  currentGesture: GestureType
  currentEffect: EffectType
  confidence: number
  icon: string
  name: string
}

export const useGestureControl = () => {
  const [gestureState, setGestureState] = useState<GestureState>({
    currentGesture: 'none',
    currentEffect: 'normal',
    confidence: 0,
    icon: 'HAND',
    name: 'No Gesture'
  })
  
  const [handHistory, setHandHistory] = useState<{ x: number; y: number; timestamp: number }[]>([])
  const [fingerCountHistory, setFingerCountHistory] = useState<number[]>([])
  const lastGestureTime = useRef<number>(0)
  const gestureCooldown = 50 // Reduced cooldown for immediate responsiveness
  const lastStableGesture = useRef<GestureType>('none')

  // Improved finger counting with more accurate thresholds
  const countExtendedFingers = (landmarks: HandLandmarks[]) => {
    if (!landmarks || landmarks.length < 21) return 0
    
    const fingerTips = [4, 8, 12, 16, 20] // thumb, index, middle, ring, pinky tips
    const fingerPips = [3, 6, 10, 14, 18] // corresponding PIP joints
    const fingerMcps = [2, 5, 9, 13, 17]  // corresponding MCP joints
    
    let extendedCount = 0
    
    // Check each finger individually with improved logic
    for (let i = 0; i < 5; i++) {
      const tip = landmarks[fingerTips[i]]
      const pip = landmarks[fingerPips[i]]
      const mcp = landmarks[fingerMcps[i]]
      
      if (!tip || !pip || !mcp) continue
      
      let isExtended = false
      
      if (i === 0) {
        // Thumb: check if tip is extended outward from palm
        const thumbExtended = tip.x < pip.x - 0.03 // Slightly more strict for thumb
        isExtended = thumbExtended
      } else {
        // Other fingers: check if tip is above PIP joint
        const fingerExtended = tip.y < pip.y - 0.03 // Slightly more strict for other fingers
        isExtended = fingerExtended
      }
      
      if (isExtended) {
        extendedCount++
      }
    }
    
    return extendedCount
  }

  // More responsive stability check
  const getStableFingerCount = (currentCount: number) => {
    const newHistory = [...fingerCountHistory, currentCount].slice(-6) // Keep last 6 frames for faster response
    setFingerCountHistory(newHistory)
    
    // Require consistency for detection
    const counts = new Map<number, number>()
    newHistory.forEach(count => {
      counts.set(count, (counts.get(count) || 0) + 1)
    })
    
    let maxCount = 0
    let stableCount = currentCount
    
    counts.forEach((frequency, count) => {
      if (frequency > maxCount) {
        maxCount = frequency
        stableCount = count
      }
    })
    
    // Return stable count if it appears in at least 70% of recent frames
    const stabilityThreshold = Math.floor(newHistory.length * 0.7)
    return maxCount >= stabilityThreshold ? stableCount : -1
  }

  // Improved gesture detection with better confidence calculation
  const detectGesture = useCallback((landmarks: HandLandmarks[]) => {
    if (!landmarks || landmarks.length < 21) return { gesture: 'none' as GestureType, confidence: 0 }
    
    const rawFingerCount = countExtendedFingers(landmarks)
    const stableFingerCount = getStableFingerCount(rawFingerCount)
    
    // Detect swipe gestures with improved sensitivity
    const now = Date.now()
    const recentHistory = handHistory.filter(h => now - h.timestamp < 400) // Shorter window for faster response
    if (recentHistory.length > 4) { // Reduced from 5
      const startX = recentHistory[0].x
      const endX = recentHistory[recentHistory.length - 1].x
      const startY = recentHistory[0].y
      const endY = recentHistory[recentHistory.length - 1].y
      
      // Swipe down detection with more lenient threshold
      if (endY - startY > 0.06) { // Reduced from 0.08
        return { gesture: 'swipe_down' as GestureType, confidence: 0.9 }
      }
    }
    
    // Finger count gestures with improved confidence calculation
    if (stableFingerCount === 5) return { gesture: 'open_hand' as GestureType, confidence: 0.9 }
    if (stableFingerCount === 0) return { gesture: 'fist' as GestureType, confidence: 0.9 }
    if (stableFingerCount === 2) return { gesture: 'two_fingers' as GestureType, confidence: 0.8 }
    if (stableFingerCount === 3) return { gesture: 'three_fingers' as GestureType, confidence: 0.8 }
    
    return { gesture: 'none' as GestureType, confidence: 0 }
  }, [handHistory, fingerCountHistory])

  // Updated gesture mapping without emojis
  const mapGestureToEffect = useCallback((gesture: GestureType) => {
    switch (gesture) {
      case 'open_hand':
        return { effect: 'normal', icon: 'HAND', name: 'Open Hand (Normal)' }
      case 'fist':
        return { effect: 'reverb', icon: 'FIST', name: 'Fist (Reverb)' }
      case 'two_fingers':
        return { effect: 'layering', icon: 'TWO', name: 'Two Fingers (Layering)' }
      case 'three_fingers':
        return { effect: 'chorus', icon: 'THREE', name: 'Three Fingers (Chorus)' }
      case 'swipe_down':
        return { effect: 'normal', icon: 'STOP', name: 'Swipe Down (Stop All)' }
      default:
        return { effect: 'normal', icon: 'HAND', name: 'No Gesture' }
    }
  }, [])

  // Update hand position history for swipe detection
  const updateHandHistory = useCallback((x: number, y: number) => {
    const now = Date.now()
    setHandHistory(prev => {
      const newHistory = [...prev, { x, y, timestamp: now }]
      return newHistory.slice(-12) // Keep more history for better swipe detection
    })
  }, [])

  // Process new hand landmarks with improved responsiveness and stability
  const processHandLandmarks = useCallback((landmarks: HandLandmarks[]) => {
    if (!landmarks || landmarks.length === 0) {
      setGestureState(prev => ({ ...prev, currentGesture: 'none', confidence: 0, icon: 'HAND', name: 'No Gesture' }))
      return
    }
    
    // Update hand history with wrist position
    const wrist = landmarks[0]
    updateHandHistory(wrist.x, wrist.y)
    
    // Detect gesture
    const { gesture, confidence } = detectGesture(landmarks)
    
    // Apply cooldown and confidence threshold for more stable detection
    const now = Date.now()
    const shouldUpdate = confidence > 0.6 && (
      now - lastGestureTime.current > gestureCooldown || 
      gesture !== lastStableGesture.current
    )
    
    if (shouldUpdate) {
      const { effect, icon, name } = mapGestureToEffect(gesture)
      setGestureState({
        currentGesture: gesture,
        currentEffect: effect as EffectType,
        confidence,
        icon,
        name
      })
      lastGestureTime.current = now
      lastStableGesture.current = gesture
    }
  }, [detectGesture, mapGestureToEffect, updateHandHistory])

  return {
    gestureState,
    processHandLandmarks,
    currentGesture: gestureState.currentGesture,
    currentEffect: gestureState.currentEffect,
    confidence: gestureState.confidence,
    icon: gestureState.icon,
    name: gestureState.name
  }
} 