'use client';

import React, { useState, useCallback } from 'react';
import { useDocumentInfo } from '@payloadcms/ui';

const RegenerateContentButton: React.FC = () => {
  const { id, collectionSlug } = useDocumentInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRegenerate = useCallback(async () => {
    if (!id) {
      setStatus('error');
      setMessage('Document ID not found');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Get current document to extract slug
      const docResponse = await fetch(`/api/tyres/${id}`);
      const doc = await docResponse.json();
      const tyreSlug = doc.slug;

      if (!tyreSlug) {
        throw new Error('Tyre slug not found');
      }

      // Call regenerate endpoint
      const response = await fetch(`/api/content/regenerate/${tyreSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Regeneration failed');
      }

      // Poll for job completion
      const jobId = data.jobId;
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const jobResponse = await fetch(`/api/content/job/${jobId}`);
        const job = await jobResponse.json();

        if (job.status === 'completed') {
          setStatus('success');
          setMessage('Контент перегенеровано! Оновіть сторінку.');
          break;
        } else if (job.status === 'failed') {
          throw new Error(job.error || 'Job failed');
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        setStatus('error');
        setMessage('Timeout - перевірте статус в /api/content/jobs');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [id, collectionSlug]);

  if (!id) {
    return null; // Don't show on create page
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={isLoading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: isLoading ? '#666' : '#0066cc',
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
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2px solid #fff',
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
            Перегенерувати контент (AI)
          </>
        )}
      </button>

      {status === 'success' && (
        <p style={{ color: '#22c55e', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          {message}
        </p>
      )}

      {status === 'error' && (
        <p style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          {message}
        </p>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegenerateContentButton;
