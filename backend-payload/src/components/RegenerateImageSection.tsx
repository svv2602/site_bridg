'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDocumentInfo, useField } from '@payloadcms/ui';

type ImageType = 'hero' | 'content' | 'product' | 'lifestyle';
type Season = 'summer' | 'winter' | 'allseason';
type ImageSize = '1024x1024' | '1792x1024' | '1024x1792';

const RegenerateImageSection: React.FC = () => {
  const { id } = useDocumentInfo();

  // Get field values from document
  const promptField = useField<string>({ path: 'generationPrompt' });
  const typeField = useField<string>({ path: 'generationType' });
  const seasonField = useField<string>({ path: 'generationSeason' });
  const sizeField = useField<string>({ path: 'generationSize' });

  // Local state for the form
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<ImageType>('content');
  const [season, setSeason] = useState<Season>('winter');
  const [size, setSize] = useState<ImageSize>('1024x1024');
  const [topic, setTopic] = useState('зимові шини Bridgestone');

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Initialize from document fields
  useEffect(() => {
    if (promptField.value) setPrompt(promptField.value);
    if (typeField.value) setType(typeField.value as ImageType);
    if (seasonField.value) setSeason(seasonField.value as Season);
    if (sizeField.value) setSize(sizeField.value as ImageSize);
  }, [promptField.value, typeField.value, seasonField.value, sizeField.value]);

  // Update size when type changes
  useEffect(() => {
    if (type === 'hero') {
      setSize('1792x1024');
    } else {
      setSize('1024x1024');
    }
  }, [type]);

  // Generate default prompt
  const handleGeneratePrompt = useCallback(async () => {
    setIsGeneratingPrompt(true);
    try {
      const params = new URLSearchParams({
        type,
        topic,
        ...((['hero', 'lifestyle'].includes(type) && season) ? { season } : {}),
      });

      const response = await fetch(`/api/image-regeneration/prompt?${params}`);
      const data = await response.json();

      if (data.prompt) {
        setPrompt(data.prompt);
        // Also update the field in the document
        promptField.setValue(data.prompt);
      }
    } catch (error) {
      console.error('Failed to generate prompt:', error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, [type, season, topic, promptField]);

  // Regenerate image
  const handleRegenerate = useCallback(async () => {
    if (!id) {
      setStatus('error');
      setMessage('Document ID not found');
      return;
    }

    if (!prompt.trim()) {
      setStatus('error');
      setMessage('Prompt is required');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Call regenerate endpoint
      const response = await fetch(`/api/image-regeneration/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type,
          season: ['hero', 'lifestyle'].includes(type) ? season : undefined,
          size,
          topic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Regeneration failed');
      }

      // Poll for job completion
      const jobId = data.jobId;
      let attempts = 0;
      const maxAttempts = 150; // 5 minutes max (2s intervals)

      setMessage('Генерація зображення...');

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const jobResponse = await fetch(`/api/image-regeneration/status/${jobId}`);
        const job = await jobResponse.json();

        if (job.status === 'completed') {
          setStatus('success');
          setMessage('Зображення перегенеровано! Оновіть сторінку щоб побачити результат.');

          // Update field values
          typeField.setValue(type);
          seasonField.setValue(season);
          sizeField.setValue(size);

          break;
        } else if (job.status === 'failed') {
          throw new Error(job.error || 'Job failed');
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        setStatus('error');
        setMessage('Timeout - генерація займає занадто довго');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [id, prompt, type, season, size, topic, typeField, seasonField, sizeField]);

  if (!id) {
    return null; // Don't show on create page
  }

  const showSeasonSelect = ['hero', 'lifestyle'].includes(type);

  return (
    <div style={{
      marginBottom: '1.5rem',
      backgroundColor: 'var(--theme-elevation-50)',
      borderRadius: '8px',
      border: '1px solid var(--theme-elevation-100)',
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          margin: 0,
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--theme-text)',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
          Регенерація зображення (AI)
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {!isCollapsed && (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>

      {/* Settings row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showSeasonSelect ? '1fr 1fr 1fr' : '1fr 1fr',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        {/* Type select */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--theme-elevation-800)' }}>
            Тип зображення
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ImageType)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--theme-elevation-150)',
              backgroundColor: 'var(--theme-input-bg)',
              color: 'var(--theme-text)',
              fontSize: '0.875rem',
            }}
          >
            <option value="hero">Hero (широкий)</option>
            <option value="content">Content (квадрат)</option>
            <option value="product">Product (шина)</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
        </div>

        {/* Season select (conditional) */}
        {showSeasonSelect && (
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--theme-elevation-800)' }}>
              Сезон
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value as Season)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--theme-elevation-150)',
                backgroundColor: 'var(--theme-input-bg)',
                color: 'var(--theme-text)',
                fontSize: '0.875rem',
              }}
            >
              <option value="winter">Зима</option>
              <option value="summer">Літо</option>
              <option value="allseason">Всесезон</option>
            </select>
          </div>
        )}

        {/* Size select */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--theme-elevation-800)' }}>
            Розмір
          </label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as ImageSize)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--theme-elevation-150)',
              backgroundColor: 'var(--theme-input-bg)',
              color: 'var(--theme-text)',
              fontSize: '0.875rem',
            }}
          >
            <option value="1024x1024">1024x1024 (квадрат)</option>
            <option value="1792x1024">1792x1024 (широкий)</option>
            <option value="1024x1792">1024x1792 (вертикальний)</option>
          </select>
        </div>
      </div>

      {/* Topic input */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--theme-elevation-800)' }}>
          Тема (для генерації промпта)
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading}
          placeholder="наприклад: зимові шини Bridgestone Blizzak"
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-150)',
            backgroundColor: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
            fontSize: '0.875rem',
          }}
        />
      </div>

      {/* Generate prompt button */}
      <div style={{ marginBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={handleGeneratePrompt}
          disabled={isLoading || isGeneratingPrompt}
          style={{
            padding: '0.375rem 0.75rem',
            backgroundColor: 'transparent',
            color: 'var(--theme-text)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            cursor: isLoading || isGeneratingPrompt ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem',
            opacity: isLoading || isGeneratingPrompt ? 0.5 : 1,
          }}
        >
          {isGeneratingPrompt ? 'Генерація...' : 'Згенерувати стандартний промпт'}
        </button>
      </div>

      {/* Prompt textarea */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--theme-elevation-800)' }}>
          Промпт для генерації
        </label>
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            promptField.setValue(e.target.value);
          }}
          disabled={isLoading}
          placeholder="Введіть промпт для генерації зображення або натисніть кнопку вище"
          rows={8}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--theme-elevation-150)',
            backgroundColor: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            resize: 'vertical',
            lineHeight: 1.4,
          }}
        />
      </div>

      {/* Regenerate button */}
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={isLoading || !prompt.trim()}
        style={{
          padding: '0.625rem 1.25rem',
          backgroundColor: isLoading ? 'var(--theme-elevation-200)' : '#0066cc',
          color: isLoading ? 'var(--theme-elevation-600)' : 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {isLoading ? (
          <>
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            Генерація...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Перегенерувати зображення
          </>
        )}
      </button>

      {/* Status messages */}
      {status === 'success' && (
        <p style={{ color: '#22c55e', marginTop: '0.75rem', fontSize: '0.875rem' }}>
          {message}
        </p>
      )}

      {status === 'error' && (
        <p style={{ color: '#ef4444', marginTop: '0.75rem', fontSize: '0.875rem' }}>
          {message}
        </p>
      )}

      {isLoading && message && status === 'idle' && (
        <p style={{ color: 'var(--theme-elevation-600)', marginTop: '0.75rem', fontSize: '0.875rem' }}>
          {message}
        </p>
      )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        </div>
      )}
    </div>
  );
};

export default RegenerateImageSection;
