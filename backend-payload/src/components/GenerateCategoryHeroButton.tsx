'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDocumentInfo, useField } from '@payloadcms/ui';
import './admin-components.css';

type Season = 'summer' | 'winter' | 'allseason';

const GenerateCategoryHeroButton: React.FC = () => {
  const { id } = useDocumentInfo();

  // Read page fields
  const heroImageField = useField<number | null>({ path: 'heroImage' });
  const titleField = useField<string>({ path: 'title' });
  const slugField = useField<string>({ path: 'slug' });
  const pageTypeField = useField<string>({ path: 'pageType' });
  const seasonField = useField<string>({ path: 'season' });
  const vehicleTypeField = useField<string>({ path: 'vehicleType' });

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [topic, setTopic] = useState('');
  const [season, setSeason] = useState<Season | ''>('');
  const [customPrompt, setCustomPrompt] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Auto-detect topic/season from page fields
  useEffect(() => {
    const pt = pageTypeField.value;
    const s = seasonField.value;
    const vt = vehicleTypeField.value;

    if (pt === 'season') {
      setSeason((s as Season) || '');
      switch (s) {
        case 'summer':
          setTopic('summer tires on European highway, sunny day');
          break;
        case 'winter':
          setTopic('winter SUV tires on snowy mountain road');
          break;
        case 'allseason':
          setTopic('allseason tires on wet autumn road');
          break;
        default:
          setTopic(titleField.value || '');
      }
    } else if (pt === 'vehicle') {
      setSeason('');
      switch (vt) {
        case 'passenger':
          setTopic('elegant sedan passenger car tires, city street');
          break;
        case 'suv':
          setTopic('premium SUV tires on scenic mountain viewpoint');
          break;
        case 'van':
          setTopic('delivery van LCV tires in urban business district');
          break;
        default:
          setTopic(titleField.value || '');
      }
    } else {
      setTopic(titleField.value || '');
    }
  }, [pageTypeField.value, seasonField.value, vehicleTypeField.value, titleField.value]);

  const hasHeroImage = !!heroImageField.value;

  const handleGenerate = useCallback(async () => {
    if (!id) {
      setStatus('error');
      setMessage('Document ID not found. Save the page first.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Build request body
      const body: Record<string, string> = {};
      if (customPrompt.trim()) {
        body.prompt = customPrompt.trim();
      } else {
        if (topic.trim()) body.topic = topic.trim();
        if (season) body.season = season;
      }

      const response = await fetch(`/api/category-image/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      // Poll for completion
      const jobId = data.jobId;
      let attempts = 0;
      const maxAttempts = 150; // 5 minutes max (2s intervals)

      setMessage('Генерація зображення...');

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const jobResponse = await fetch(`/api/category-image/status/${jobId}`);
        const job = await jobResponse.json();

        if (job.status === 'completed') {
          setStatus('success');
          setMessage('Hero зображення згенеровано! Оновіть сторінку щоб побачити результат.');
          break;
        } else if (job.status === 'failed') {
          throw new Error(job.error || 'Job failed');
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        setStatus('error');
        setMessage('Timeout — генерація займає занадто довго');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [id, topic, season, customPrompt]);

  if (!id) return null;

  const buttonLabel = isLoading
    ? 'Генерація...'
    : hasHeroImage
      ? 'Перегенерувати Hero (AI)'
      : 'Згенерувати Hero (AI)';

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Main button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className={`admin-btn ${!isLoading ? 'admin-btn--primary' : ''}`}
        >
          {isLoading ? (
            <>
              <span className="admin-spinner" />
              {buttonLabel}
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
              {buttonLabel}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="admin-btn--outline"
          disabled={isLoading}
        >
          {showAdvanced ? 'Сховати налаштування' : 'Налаштування'}
        </button>
      </div>

      {/* Advanced controls */}
      {showAdvanced && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', border: '1px solid var(--theme-elevation-100)', borderRadius: '6px' }}>
          <div className="admin-settings-grid admin-settings-grid--2col">
            <div>
              <label className="admin-label">Тема</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                placeholder="автовизначається з полів сторінки"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Сезон</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as Season | '')}
                disabled={isLoading}
                className="admin-select"
              >
                <option value="">Авто</option>
                <option value="summer">Літо</option>
                <option value="winter">Зима</option>
                <option value="allseason">Всесезон</option>
              </select>
            </div>
          </div>
          <div>
            <label className="admin-label">Власний промпт (необовʼязково, замінить тему/сезон)</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={isLoading}
              placeholder="Залиште порожнім для автоматичної генерації промпта"
              rows={4}
              className="admin-textarea"
            />
          </div>
        </div>
      )}

      {/* Status messages */}
      {status === 'success' && (
        <p className="admin-status-msg admin-status-msg--success">{message}</p>
      )}
      {status === 'error' && (
        <p className="admin-status-msg admin-status-msg--error">{message}</p>
      )}
      {isLoading && message && status === 'idle' && (
        <p className="admin-status-msg admin-status-msg--info">{message}</p>
      )}
    </div>
  );
};

export default GenerateCategoryHeroButton;
