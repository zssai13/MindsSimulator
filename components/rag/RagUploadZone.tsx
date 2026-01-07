'use client';

import { useCallback, useState } from 'react';
import { useRagStore, RagStatus } from '@/store/ragStore';
import { RagType } from '@/lib/vectorstore/chunk';
import { ModelLabel } from '@/components/ui/ModelLabel';

interface RagUploadZoneProps {
  type: RagType;
  label: string;
  description: string;
}

const statusConfig: Record<RagStatus, { bg: string; text: string; label: string }> = {
  empty: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Empty' },
  uploaded: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Ready' },
  vectorizing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Vectorizing...' },
  ready: { bg: 'bg-green-100', text: 'text-green-700', label: 'Vectorized' },
};

export function RagUploadZone({ type, label, description }: RagUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const file = useRagStore((s) => s.files[type]);
  const status = useRagStore((s) => s.status[type]);
  const chunkCount = useRagStore((s) => s.chunkCounts[type]);
  const setFile = useRagStore((s) => s.setFile);

  const readFile = useCallback((uploadedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFile(type, content);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(uploadedFile);
  }, [type, setFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      readFile(files[0]);
    }
  }, [readFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      readFile(files[0]);
    }
  }, [readFile]);

  const handleClear = () => {
    setFile(type, null);
    setError(null);
  };

  const statusInfo = statusConfig[status];

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <div className="flex items-center gap-2">
          <ModelLabel model="openai" />
          <span className={`text-xs px-2 py-0.5 rounded ${statusInfo.bg} ${statusInfo.text}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-3">{description}</p>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id={`rag-upload-${type}`}
            accept=".txt,.md,.json,.csv"
          />
          <label
            htmlFor={`rag-upload-${type}`}
            className="cursor-pointer text-sm text-gray-600"
          >
            <span className="text-blue-600 hover:text-blue-700 font-medium">
              Click to upload
            </span>
            {' '}or drag and drop
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <div className={`rounded-lg p-3 ${status === 'ready' ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {status === 'ready' ? (
                  <span className="text-green-700">
                    {chunkCount} chunks indexed
                  </span>
                ) : status === 'vectorizing' ? (
                  <span className="text-blue-700">
                    Processing...
                  </span>
                ) : (
                  <span className="text-gray-600">
                    {file.length.toLocaleString()} chars
                  </span>
                )}
              </div>
              <button
                onClick={handleClear}
                disabled={status === 'vectorizing'}
                className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}
