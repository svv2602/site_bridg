'use client'

import React from 'react'

export const DashboardNavLink: React.FC = () => {
  return (
    <a
      href="/admin"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        color: 'var(--theme-text)',
        textDecoration: 'none',
        fontSize: '0.875rem',
        borderTop: '1px solid var(--theme-elevation-100)',
        marginTop: '0.25rem',
      }}
    >
      Dashboard
    </a>
  )
}
