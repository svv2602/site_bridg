'use client'

import React from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

interface AvailableModel {
  model: string
  label?: string
  description?: string
}

export const ModelSelectorField: React.FC<{ path: string }> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const availableModelsField = useFormFields(([fields]) => fields.availableModels)

  const availableModels = (availableModelsField?.value as AvailableModel[] | undefined) || []

  // If we have available models, show a select
  if (availableModels.length > 0) {
    const options = availableModels.map((m) => ({
      label: m.label || m.model,
      value: m.model,
    }))

    // Add current value if not in list
    if (value && !options.some((o) => o.value === value)) {
      options.unshift({ label: `${value} (поточна)`, value })
    }

    return (
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--theme-text)',
        }}>
          Модель за замовчуванням
        </label>
        <select
          value={value || ''}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: '100%',
            padding: '0.625rem 0.75rem',
            background: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '4px',
            color: 'var(--theme-text)',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--theme-elevation-500)',
          marginTop: '0.375rem',
        }}>
          Виберіть модель зі списку або додайте нову в &quot;Доступні моделі&quot;
        </div>
      </div>
    )
  }

  // Otherwise show text input with suggestions
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--theme-text)',
      }}>
        Модель за замовчуванням
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: '100%',
          padding: '0.625rem 0.75rem',
          background: 'var(--theme-elevation-100)',
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: '4px',
          color: 'var(--theme-text)',
          fontSize: '0.875rem',
        }}
      />
      <div style={{
        fontSize: '0.75rem',
        color: 'var(--theme-elevation-500)',
        marginTop: '0.375rem',
      }}>
        Введіть ID моделі (наприклад: claude-sonnet-4-20250514, gpt-4o)
        <br />
        Додайте моделі в &quot;Доступні моделі&quot; для вибору зі списку
      </div>
    </div>
  )
}

export default ModelSelectorField
