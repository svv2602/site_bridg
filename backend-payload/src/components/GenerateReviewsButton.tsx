'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDocumentInfo } from '@payloadcms/ui';

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
        const response = await fetch(`/api/reviews/stats/${id}`);
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
      const response = await fetch(`/api/reviews/generate/${id}`, {
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

        const jobResponse = await fetch(`/api/reviews/generate/status/${jobId}`);
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
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#888' }}>
        Відгуки: {reviewCount !== null ? reviewCount : '...'} шт.
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <select
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value, 10))}
          disabled={isLoading}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #444',
            backgroundColor: '#2a2a2a',
            color: 'white',
            fontSize: '0.875rem',
          }}
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
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isLoading ? '#666' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {isLoading ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
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
        <p style={{ color: '#22c55e', marginTop: '0.5rem', fontSize: '0.875rem' }}>{message}</p>
      )}

      {status === 'error' && (
        <p style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.875rem' }}>{message}</p>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GenerateReviewsButton;
