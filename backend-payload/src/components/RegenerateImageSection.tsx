'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDocumentInfo, useField } from '@payloadcms/ui';
import './admin-components.css';

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
    <div className="admin-section">
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="admin-section__header"
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
        <div className="admin-section__body">

      {/* Settings row */}
      <div className={`admin-settings-grid ${showSeasonSelect ? 'admin-settings-grid--3col' : 'admin-settings-grid--2col'}`}>
        {/* Type select */}
        <div>
          <label className="admin-label">
            Тип зображення
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ImageType)}
            disabled={isLoading}
            className="admin-select"
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
            <label className="admin-label">
              Сезон
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value as Season)}
              disabled={isLoading}
              className="admin-select"
            >
              <option value="winter">Зима</option>
              <option value="summer">Літо</option>
              <option value="allseason">Всесезон</option>
            </select>
          </div>
        )}

        {/* Size select */}
        <div>
          <label className="admin-label">
            Розмір
          </label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as ImageSize)}
            disabled={isLoading}
            className="admin-select"
          >
            <option value="1024x1024">1024x1024 (квадрат)</option>
            <option value="1792x1024">1792x1024 (широкий)</option>
            <option value="1024x1792">1024x1792 (вертикальний)</option>
          </select>
        </div>
      </div>

      {/* Topic input */}
      <div className="admin-field-group">
        <label className="admin-label">
          Тема (для генерації промпта)
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading}
          placeholder="наприклад: зимові шини Bridgestone Blizzak"
          className="admin-input"
        />
      </div>

      {/* Generate prompt button */}
      <div className="admin-field-group">
        <button
          type="button"
          onClick={handleGeneratePrompt}
          disabled={isLoading || isGeneratingPrompt}
          className="admin-btn--outline"
        >
          {isGeneratingPrompt ? 'Генерація...' : 'Згенерувати стандартний промпт'}
        </button>
      </div>

      {/* Prompt textarea */}
      <div className="admin-mb-1">
        <label className="admin-label">
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
          className="admin-textarea"
        />
      </div>

      {/* Regenerate button */}
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={isLoading || !prompt.trim()}
        className={`admin-btn admin-btn--regen ${!isLoading ? 'admin-btn--primary' : ''}`}
      >
        {isLoading ? (
          <>
            <span className="admin-spinner" />
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
        <p className="admin-status-msg admin-status-msg--success">
          {message}
        </p>
      )}

      {status === 'error' && (
        <p className="admin-status-msg admin-status-msg--error">
          {message}
        </p>
      )}

      {isLoading && message && status === 'idle' && (
        <p className="admin-status-msg admin-status-msg--info">
          {message}
        </p>
      )}

        </div>
      )}
    </div>
  );
};

export default RegenerateImageSection;
