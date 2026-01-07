'use client';

import { useState } from 'react';
import { useRagStore, RAG_TYPES, RAG_TYPE_CONFIG } from '@/store/ragStore';
import { RagType } from '@/lib/vectorstore/chunk';
import { RagUploadZone } from './RagUploadZone';
import { ModelLabel } from '@/components/ui/ModelLabel';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function RagSection() {
  const [error, setError] = useState<string | null>(null);

  const files = useRagStore((s) => s.files);
  const status = useRagStore((s) => s.status);
  const vectorizing = useRagStore((s) => s.vectorizing);
  const setVectorizing = useRagStore((s) => s.setVectorizing);
  const setStatus = useRagStore((s) => s.setStatus);
  const setChunkCount = useRagStore((s) => s.setChunkCount);
  const hasUploadedFiles = useRagStore((s) => s.hasUploadedFiles);
  const isFullyVectorized = useRagStore((s) => s.isFullyVectorized);

  const handleVectorizeAll = async () => {
    setError(null);
    setVectorizing(true);

    // Get files that need vectorization (uploaded but not ready)
    const filesToVectorize: Array<{ type: RagType; content: string }> = [];

    for (const type of RAG_TYPES) {
      const content = files[type];
      const fileStatus = status[type];

      if (content && fileStatus === 'uploaded') {
        filesToVectorize.push({ type, content });
        setStatus(type, 'vectorizing');
      }
    }

    if (filesToVectorize.length === 0) {
      setVectorizing(false);
      return;
    }

    try {
      const response = await fetch('/api/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToVectorize,
          clearExisting: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Vectorization failed');
      }

      const data = await response.json();

      // Update status and chunk counts for each type
      for (const type of RAG_TYPES) {
        if (data.byType[type] !== undefined) {
          setStatus(type, 'ready');
          setChunkCount(type, data.byType[type]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vectorization failed');

      // Reset status for files that failed
      for (const file of filesToVectorize) {
        setStatus(file.type, 'uploaded');
      }
    } finally {
      setVectorizing(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all RAG data and reset the vector database?')) return;

    try {
      // Call API to clear the vector database
      await fetch('/api/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: [], clearExisting: true }),
      });

      // Reset store
      useRagStore.getState().reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear');
    }
  };

  // Count stats
  const uploadedCount = RAG_TYPES.filter(t => status[t] === 'uploaded').length;
  const vectorizedCount = RAG_TYPES.filter(t => status[t] === 'ready').length;
  const totalChunks = RAG_TYPES.reduce((sum, t) => sum + useRagStore.getState().chunkCounts[t], 0);

  return (
    <section className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">RAG Data (Vectorized)</h3>
          <p className="text-sm text-gray-500">
            Upload content for retrieval-augmented generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {vectorizedCount > 0 && (
            <span className="text-xs text-gray-500">
              {vectorizedCount} types • {totalChunks} chunks
            </span>
          )}
          <button
            onClick={handleClearAll}
            disabled={vectorizing || !hasUploadedFiles()}
            className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Upload zones grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {RAG_TYPES.map((type) => (
          <RagUploadZone
            key={type}
            type={type}
            label={RAG_TYPE_CONFIG[type].label}
            description={RAG_TYPE_CONFIG[type].description}
          />
        ))}
      </div>

      {/* Vectorize button */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-500">
          {uploadedCount > 0 && !isFullyVectorized() && (
            <span>{uploadedCount} file(s) ready to vectorize</span>
          )}
          {isFullyVectorized() && vectorizedCount > 0 && (
            <span className="text-green-600">All files vectorized</span>
          )}
          {!hasUploadedFiles() && (
            <span>Upload files to enable RAG</span>
          )}
        </div>

        <button
          onClick={handleVectorizeAll}
          disabled={vectorizing || !hasUploadedFiles() || isFullyVectorized()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {vectorizing ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Vectorizing...</span>
            </>
          ) : (
            <>
              <span>Vectorize All with</span>
              <ModelLabel model="openai" />
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 rounded p-3">
          {error}
        </div>
      )}
    </section>
  );
}
