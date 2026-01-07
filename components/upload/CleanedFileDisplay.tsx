'use client';

import { useState } from 'react';
import { useBuildStore, DataType } from '@/store/buildStore';
import { FileViewModal } from './FileViewModal';

const typeLabels: Record<DataType, string> = {
  transcripts: 'Transcripts',
  tickets: 'Support Tickets',
  website: 'Website Content',
  docs: 'Product Docs',
  research: 'Business Research',
  'email-guide': 'Email Guide',
};

const allTypes: DataType[] = ['transcripts', 'tickets', 'website', 'docs', 'research', 'email-guide'];

export function CleanedFileDisplay() {
  const [viewingFile, setViewingFile] = useState<{ type: DataType; content: string } | null>(null);
  const cleanedData = useBuildStore((s) => s.cleanedData);

  const cleanedFiles = allTypes.filter((type) => cleanedData[type] !== null);

  const handleDownload = (type: DataType, content: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned-${type}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (cleanedFiles.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50">
        <p className="text-sm text-gray-500 text-center">
          No cleaned files yet. Upload and clean data above.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg p-4 bg-white">
        <div className="space-y-2">
          {cleanedFiles.map((type) => {
            const content = cleanedData[type]!;
            return (
              <div
                key={type}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <span className="font-medium text-gray-900">{typeLabels[type]}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({content.length.toLocaleString()} chars)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingFile({ type, content })}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(type, content)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {viewingFile && (
        <FileViewModal
          type={viewingFile.type}
          content={viewingFile.content}
          onClose={() => setViewingFile(null)}
        />
      )}
    </>
  );
}
