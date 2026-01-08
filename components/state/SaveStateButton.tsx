'use client';

import { useState } from 'react';
import { useBuildStore } from '@/store/buildStore';
import { useRagStore } from '@/store/ragStore';
import { useChatStore } from '@/store/chatStore';
import { saveState } from '@/lib/storage';

interface SaveStateButtonProps {
  onSaved?: () => void;
}

export function SaveStateButton({ onSaved }: SaveStateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get state from all stores
  const buildState = useBuildStore();
  const ragState = useRagStore();
  const chatState = useChatStore();

  const handleOpen = () => {
    setIsOpen(true);
    setSaveName('');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSaveName('');
    setError(null);
    setSuccess(false);
  };

  const handleSave = () => {
    if (!saveName.trim()) {
      setError('Please enter a name for this save');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      saveState(saveName.trim(), {
        build: {
          cleanedData: buildState.cleanedData,
          extractedSections: buildState.extractedSections,
          systemPrompt: buildState.systemPrompt,
        },
        rag: {
          files: ragState.files,
          status: ragState.status,
          chunkCounts: ragState.chunkCounts,
        },
        chat: {
          systemPrompt: chatState.systemPrompt,
          templateRules: chatState.templateRules,
          userRules: chatState.userRules,
          pageUrl: chatState.pageUrl,
          additionalContext: chatState.additionalContext,
          initialEmail: chatState.initialEmail,
          messages: chatState.messages,
        },
      });

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSaved?.();
      }, 1000);
    } catch (err) {
      setError('Failed to save state');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          />
        </svg>
        Save State
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Save State</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {success ? (
                <div className="flex items-center gap-3 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">State saved successfully!</span>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Save Name
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="e.g., My Sales Rep Config"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    autoFocus
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                  <p className="mt-3 text-xs text-gray-500">
                    This will save your current Tab 1 data, Tab 2 RAG files, and chat history.
                  </p>
                </>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
