'use client'

import React from 'react'

export const Logo: React.FC = () => {
  return (
    <div className="logo-wrapper">
      <svg viewBox="0 0 200 50" style={{ width: '160px', height: '40px' }}>
        <defs>
          <linearGradient id="bridgestone-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#E31837' }} />
            <stop offset="100%" style={{ stopColor: '#C41230' }} />
          </linearGradient>
        </defs>
        <rect x="0" y="10" width="200" height="30" rx="4" fill="url(#bridgestone-gradient)" />
        <text
          x="100"
          y="32"
          fontFamily="Arial, sans-serif"
          fontSize="16"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          BRIDGESTONE
        </text>
      </svg>
    </div>
  )
}

export default Logo
