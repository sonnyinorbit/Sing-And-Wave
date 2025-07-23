import React from 'react'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sing & Wave - One-Handed Vocal Effects Playground',
  description: 'A playful, accessible vocal effects app controlled by one-handed gestures. Perfect for singers, beatboxers, or anyone with one hand to create magical vocal layers!',
  keywords: 'vocal effects, gesture control, accessibility, music, singing, one-handed, MediaPipe, Web Audio API',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90" font-family="Arial, sans-serif" font-weight="bold" fill="%23000">SW</text></svg>',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ background: 'var(--olive-bg)', minHeight: '100vh' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
} 