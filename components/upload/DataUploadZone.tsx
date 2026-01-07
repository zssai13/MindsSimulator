'use client';

import { useCallback, useState } from 'react';
import { useBuildStore, DataType } from '@/store/buildStore';

interface DataUploadZoneProps {
  type: DataType;
  label: string;
  description: string;
}

export function DataUploadZone({ type, label, description }: DataUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanedData = useBuildStore((s) => s.cleanedData[type]);
  const setCleanedData = useBuildStore((s) => s.setCleanedData);

  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCleanedData(type, content);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  }, [type, setCleanedData]);

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

  const handleClear = () => {
    setCleanedData(type, null);
    setError(null);
  };

  const isUploaded = cleanedData !== null;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{label}</h4>
        {isUploaded && (
          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
            Uploaded
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-3">{description}</p>

      {!isUploaded ? (
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
            accept=".md"
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
              Markdown files (.md)
            </span>
          </label>
        </div>
      ) : (
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">
              {cleanedData.length.toLocaleString()} characters
            </span>
            <button
              onClick={handleClear}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Remove
            </button>
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
