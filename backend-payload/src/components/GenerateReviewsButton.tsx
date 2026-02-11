'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDocumentInfo } from '@payloadcms/ui';
import './admin-components.css';

const GenerateReviewsButton: React.FC = () => {
  const { id } = useDocumentInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [count, setCount] = useState(3);

  // Fetch current review count
  useEffect(() => {
    if (!id) return;

    const fetchReviewCount = async () => {
      try {
        const response = await fetch(`/api/review-ops/stats/${id}`);
        if (response.ok) {
          const data = await response.json();
          setReviewCount(data.totalCount);
        }
      } catch {
        // Ignore errors
      }
    };

    fetchReviewCount();
  }, [id]);

  const handleGenerate = useCallback(async () => {
    if (!id) {
      setStatus('error');
      setMessage('Document ID not found');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Call generate endpoint
      const response = await fetch(`/api/review-ops/generate/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      // Poll for job completion
      const jobId = data.jobId;
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const jobResponse = await fetch(`/api/review-ops/generate/status/${jobId}`);
        const job = await jobResponse.json();

        if (job.status === 'completed') {
          setStatus('success');
          const newCount = job.createdReviewIds?.length || 0;
          setMessage(`Створено ${newCount} відгуків!`);
          setReviewCount((prev) => (prev || 0) + newCount);
          break;
        } else if (job.status === 'failed') {
          throw new Error(job.error || 'Job failed');
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        setStatus('error');
        setMessage('Timeout - перевірте статус пізніше');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [id, count]);

  if (!id) {
    return null; // Don't show on create page
  }

  return (
    <div className="admin-mb-1">
      <div className="admin-review-count">
        Відгуки: {reviewCount !== null ? reviewCount : '...'} шт.
      </div>

      <div className="admin-controls-row">
        <select
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value, 10))}
          disabled={isLoading}
          className="admin-select--dark"
        >
          {[1, 2, 3, 5, 10].map((n) => (
            <option key={n} value={n}>
              {n} шт.
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="admin-btn admin-btn--success"
        >
          {isLoading ? (
            <>
              <span className="admin-spinner admin-spinner--white" />
              Генерація...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Генерувати відгуки (AI)
            </>
          )}
        </button>
      </div>

      {status === 'success' && (
        <p className="admin-status-msg admin-status-msg--success">{message}</p>
      )}

      {status === 'error' && (
        <p className="admin-status-msg admin-status-msg--error">{message}</p>
      )}
    </div>
  );
};

export default GenerateReviewsButton;
