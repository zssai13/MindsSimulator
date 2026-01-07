'use client';

import { useCallback, useState } from 'react';
import { useBuildStore, DataType } from '@/store/buildStore';
import { ModelLabel } from '@/components/ui/ModelLabel';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface DataUploadZoneProps {
  type: DataType;
  label: string;
  description: string;
}

export function DataUploadZone({ type, label, description }: DataUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawData = useBuildStore((s) => s.rawData[type]);
  const cleanedData = useBuildStore((s) => s.cleanedData[type]);
  const isLoading = useBuildStore((s) => s.cleaningInProgress[type]);
  const setRawData = useBuildStore((s) => s.setRawData);
  const setCleanedData = useBuildStore((s) => s.setCleanedData);
  const setCleaningInProgress = useBuildStore((s) => s.setCleaningInProgress);

  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawData(type, content);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  }, [type, setRawData]);

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
      const file = files[0];
      readFile(file);
    }
  }, [readFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      readFile(files[0]);
    }
  }, [readFile]);

  const handleClean = async () => {
    if (!rawData) return;

    setError(null);
    setCleaningInProgress(type, true);

    try {
      const response = await fetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content: rawData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clean data');
      }

      const data = await response.json();
      setCleanedData(type, data.cleaned);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clean data');
    } finally {
      setCleaningInProgress(type, false);
    }
  };

  const handleClear = () => {
    setRawData(type, null);
    setCleanedData(type, null);
    setError(null);
  };

  const getStatus = () => {
    if (cleanedData) return 'cleaned';
    if (rawData) return 'uploaded';
    return 'empty';
  };

  const status = getStatus();

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <div className="flex items-center gap-2">
          <ModelLabel model="opus" />
          {status === 'cleaned' && (
            <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
              Cleaned
            </span>
          )}
          {status === 'uploaded' && (
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
              Ready to Clean
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-3">{description}</p>

      {!rawData ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id={`upload-${type}`}
            accept=".txt,.md,.json,.csv"
          />
          <label
            htmlFor={`upload-${type}`}
            className="cursor-pointer text-sm text-gray-600"
          >
            <span className="text-blue-600 hover:text-blue-700 font-medium">
              Click to upload
            </span>
            {' '}or drag and drop
            <br />
            <span className="text-xs text-gray-400">
              .txt, .md, .json, .csv
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {rawData.length.toLocaleString()} characters uploaded
              </span>
              <button
                onClick={handleClear}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>

          {!cleanedData && (
            <button
              onClick={handleClean}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Cleaning with Opus...</span>
                </>
              ) : (
                <>
                  <span>Clean with</span>
                  <ModelLabel model="opus" />
                </>
              )}
            </button>
          )}

          {cleanedData && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">
                  Cleaned: {cleanedData.length.toLocaleString()} characters
                </span>
                <button
                  onClick={handleClean}
                  disabled={isLoading}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  Re-clean
                </button>
              </div>
            </div>
          )}
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
