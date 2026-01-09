'use client'

import React from 'react'

export const Icon: React.FC = () => {
  return (
    <svg viewBox="0 0 32 32" style={{ width: '24px', height: '24px' }}>
      <circle cx="16" cy="16" r="15" fill="#E31837" />
      <text
        x="16"
        y="21"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        B
      </text>
    </svg>
  )
}

export default Icon
