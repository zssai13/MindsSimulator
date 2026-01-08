'use client';

import { useState } from 'react';
import { useBuildStore } from '@/store/buildStore';

interface FinalPromptDisplayProps {
  onSendToTab2?: () => void;
}

export function FinalPromptDisplay({ onSendToTab2 }: FinalPromptDisplayProps) {
  const [copied, setCopied] = useState(false);

  const systemPrompt = useBuildStore((s) => s.systemPrompt);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(systemPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([systemPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-prompt.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!systemPrompt) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50">
        <p className="text-sm text-gray-500 text-center">
          Generate a system prompt above to see the extracted content here.
        </p>
      </div>
    );
  }

  const wordCount = systemPrompt.split(/\s+/).filter((w) => w.length > 0).length;
  const charCount = systemPrompt.length;

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <h4 className="font-medium text-gray-900">Generated System Prompt</h4>
          <span className="text-sm text-gray-500">
            {wordCount.toLocaleString()} words &bull; {charCount.toLocaleString()} chars
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            Download .md
          </button>
          {onSendToTab2 && (
            <button
              onClick={onSendToTab2}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
            >
              Send to Tab 2 &rarr;
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-4">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
          {systemPrompt}
        </pre>
      </div>
    </div>
  );
}
