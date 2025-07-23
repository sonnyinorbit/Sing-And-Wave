'use client'

import React from 'react'
import { EffectType } from '../hooks/useGestureControl'

interface AccessibilityControlsProps {
  currentEffect: EffectType
  onEffectChange: (effect: EffectType) => void
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  currentEffect,
  onEffectChange
}) => {
  const effects: { type: EffectType; name: string; description: string; color: string }[] = [
    { 
      type: 'normal', 
      name: 'Normal', 
      description: 'Clean voice',
      color: 'from-[#d0f5c7] to-[#b3d9ff]' 
    },
    { 
      type: 'reverb', 
      name: 'Reverb', 
      description: 'Echo effect',
      color: 'from-[#fbbf24] to-[#f59e0b]' 
    },
    { 
      type: 'layering', 
      name: 'Layering', 
      description: 'Record & loop',
      color: 'from-[#ec4899] to-[#be185d]' 
    },
    { 
      type: 'chorus', 
      name: 'Chorus', 
      description: 'Harmony effect',
      color: 'from-[#8b5cf6] to-[#7c3aed]' 
    },

  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {effects.map((effect) => (
          <button
            key={effect.type}
            onClick={() => onEffectChange(effect.type)}
            className={`p-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-102 ${
              currentEffect === effect.type
                ? `bg-gradient-to-r ${effect.color} shadow-lg ring-2 ring-white ring-opacity-50`
                : `bg-gradient-to-r ${effect.color} shadow-md hover:shadow-lg opacity-90 hover:opacity-100`
            }`}
          >
            <div className="text-center">
              <div className="font-bold text-lg">{effect.name}</div>
              <div className="text-sm opacity-90">{effect.description}</div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-center pt-2">
        <p className="text-[#7c3aed] text-xs opacity-80">
          Tip: These buttons work alongside gesture control!
        </p>
      </div>
    </div>
  )
} 