'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

// Map provider name to environment variable
const PROVIDER_ENV_VARS: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  'openai-dalle': 'OPENAI_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  google: 'GOOGLE_AI_API_KEY',
  groq: 'GROQ_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  ollama: 'OLLAMA_BASE_URL',
  stability: 'STABILITY_API_KEY',
  replicate: 'REPLICATE_API_TOKEN',
  leonardo: 'LEONARDO_API_KEY',
}

export const ApiKeyStatusField: React.FC = () => {
  const nameField = useFormFields(([fields]) => fields.name)
  const providerName = nameField?.value as string | undefined

  if (!providerName) {
    return (
      <div style={{ padding: '0.5rem 0' }}>
        <em style={{ color: 'var(--theme-elevation-500)' }}>
          Спочатку виберіть провайдера
        </em>
      </div>
    )
  }

  const envVar = PROVIDER_ENV_VARS[providerName]

  if (!envVar) {
    return (
      <div style={{ padding: '0.5rem 0' }}>
        <em style={{ color: 'var(--theme-elevation-500)' }}>
          Невідомий провайдер
        </em>
      </div>
    )
  }

  return (
    <div style={{ padding: '0.75rem 0' }}>
      <div style={{
        fontSize: '0.875rem',
        fontWeight: 500,
        marginBottom: '0.5rem',
        color: 'var(--theme-text)'
      }}>
        API ключ
      </div>
      <div style={{
        padding: '0.75rem 1rem',
        background: 'var(--theme-elevation-100)',
        borderRadius: '4px',
        fontSize: '0.875rem',
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--theme-elevation-600)' }}>Змінна: </span>
          <code style={{
            background: 'var(--theme-elevation-200)',
            padding: '0.125rem 0.375rem',
            borderRadius: '3px',
            fontFamily: 'monospace',
            fontSize: '0.8125rem',
          }}>
            {envVar}
          </code>
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--theme-elevation-500)',
          marginTop: '0.5rem',
        }}>
          Додайте ключ у файл <code style={{ fontFamily: 'monospace' }}>.env</code> на сервері:
          <br />
          <code style={{
            fontFamily: 'monospace',
            display: 'block',
            marginTop: '0.25rem',
            padding: '0.375rem',
            background: 'var(--theme-elevation-200)',
            borderRadius: '3px',
          }}>
            {envVar}=your-api-key-here
          </code>
        </div>
      </div>
    </div>
  )
}

export default ApiKeyStatusField
