'use client'

import React, { useEffect, useState, useCallback } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  new_content: '#16a34a',
  error: '#dc2626',
  weekly_summary: '#2563eb',
  info: '#9333ea',
}

const TYPE_LABELS: Record<string, string> = {
  new_content: 'Контент',
  error: 'Помилка',
  weekly_summary: 'Звіт',
  info: 'Інфо',
}

export const DashboardNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=5&sort=-createdAt', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.docs || [])
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="dashboard__section" style={{ marginTop: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--theme-text)' }}>
          Останні повідомлення
        </h3>
        <a
          href="/admin/collections/notifications"
          style={{ fontSize: '0.8125rem', color: '#E31837', textDecoration: 'none' }}
        >
          Переглянути всі &rarr;
        </a>
      </div>

      <div
        style={{
          background: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--theme-text)', opacity: 0.5 }}>
            Завантаження...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--theme-text)', opacity: 0.5, fontSize: '0.875rem' }}>
            Повідомлень поки немає
          </div>
        ) : (
          notifications.map((n, i) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderBottom: i < notifications.length - 1 ? '1px solid var(--theme-elevation-100)' : 'none',
                background: n.read ? 'transparent' : 'var(--theme-elevation-100)',
              }}
            >
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#fff',
                  background: TYPE_COLORS[n.type] || '#666',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                  minWidth: '56px',
                  textAlign: 'center',
                }}
              >
                {TYPE_LABELS[n.type] || n.type}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: n.read ? 400 : 600,
                    color: 'var(--theme-text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {n.title}
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--theme-text)',
                  opacity: 0.5,
                  flexShrink: 0,
                }}
              >
                {formatTime(n.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
