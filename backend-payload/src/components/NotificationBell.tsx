'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
  buttons?: Array<{ text: string; url: string }>
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

export const NotificationBell: React.FC = () => {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/count', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCount(data.count || 0)
      }
    } catch {
      // Silently fail — bell just won't show count
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=10&sort=-createdAt', {
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

  const markRead = useCallback(async (id: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setCount((prev) => Math.max(0, prev - 1))
    } catch {
      // ignore
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setCount(0)
    } catch {
      // ignore
    }
  }, [])

  // Poll count every 30s
  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [fetchCount])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'щойно'
    if (diffMin < 60) return `${diffMin} хв тому`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr} год тому`
    const diffDays = Math.floor(diffHr / 24)
    return `${diffDays} дн тому`
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Повідомлення"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '6px',
          color: 'var(--theme-text)',
          fontSize: '20px',
          lineHeight: 1,
        }}
      >
        {'\u{1F514}'}
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '0',
              background: '#E31837',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '50%',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '360px',
            maxHeight: '480px',
            overflowY: 'auto',
            background: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid var(--theme-elevation-200)',
            }}
          >
            <strong style={{ fontSize: '14px', color: 'var(--theme-text)' }}>
              Повідомлення
            </strong>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {count > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#E31837',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: 0,
                  }}
                >
                  Прочитати всі
                </button>
              )}
              <a
                href="/admin/collections/notifications"
                style={{
                  color: 'var(--theme-text)',
                  fontSize: '12px',
                  opacity: 0.6,
                  textDecoration: 'none',
                }}
              >
                Усі
              </a>
            </div>
          </div>

          {/* Notification list */}
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--theme-text)', opacity: 0.5 }}>
              Завантаження...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--theme-text)', opacity: 0.5, fontSize: '13px' }}>
              Немає повідомлень
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => { if (!n.read) markRead(n.id) }}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--theme-elevation-100)',
                  cursor: n.read ? 'default' : 'pointer',
                  background: n.read ? 'transparent' : 'var(--theme-elevation-100)',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#fff',
                      background: TYPE_COLORS[n.type] || '#666',
                      borderRadius: '3px',
                      padding: '1px 6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {TYPE_LABELS[n.type] || n.type}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--theme-text)', opacity: 0.5 }}>
                    {formatTime(n.createdAt)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: n.read ? 400 : 600,
                    color: 'var(--theme-text)',
                    marginBottom: '2px',
                  }}
                >
                  {n.title}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--theme-text)',
                    opacity: 0.7,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {n.body.slice(0, 100)}
                </div>
                {n.buttons && n.buttons.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    {n.buttons.map((btn, i) => (
                      <a
                        key={i}
                        href={btn.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: '11px',
                          color: '#E31837',
                          textDecoration: 'none',
                          marginRight: '8px',
                        }}
                      >
                        {btn.text} &rarr;
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
