'use client'

import React from 'react'

interface ExportButtonProps {
  isProcessing: boolean
  downloadUrl: string | null
  onExport: () => void
}

export const ExportButton: React.FC<ExportButtonProps> = ({ isProcessing, downloadUrl, onExport }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={onExport}
        disabled={isProcessing}
        className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 transform hover:scale-105 ${
          isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#d0f5c7] to-[#b3d9ff] text-[#7c3aed] shadow-lg hover:shadow-xl border-2 border-[#e9d6f7]'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7c3aed]"></div>
            <span>Processing…</span>
          </div>
        ) : (
          <span>Export Recording</span>
        )}
      </button>

      {downloadUrl && (
        <div className="bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] rounded-2xl p-4 border-2 border-[#e9d6f7] shadow-lg">
          <a
            href={downloadUrl}
            download={`singandwave-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`}
            className="flex items-center space-x-2 text-white font-bold text-lg hover:opacity-90 transition-opacity"
          >
            <span>Download .wav</span>
          </a>
          <p className="text-white text-sm opacity-80 mt-1">
            Your vocal masterpiece is ready!
          </p>
        </div>
      )}

      <div className="text-center text-[#7c3aed] text-sm opacity-80">
        <p>Export your creation as a high-quality WAV file</p>
      </div>
    </div>
  )
} 