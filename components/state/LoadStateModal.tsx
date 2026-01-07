'use client';

import { useState, useEffect } from 'react';
import { getSavesList, loadState, deleteState, formatSaveDate, SaveMetadata, SavedState } from '@/lib/storage';
import { useBuildStore, DataType, BuildState } from '@/store/buildStore';
import { useRagStore, RagState } from '@/store/ragStore';
import { useChatStore, ChatState } from '@/store/chatStore';
import { RagType } from '@/lib/vectorstore/chunk';

interface LoadStateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoadStateModal({ isOpen, onClose }: LoadStateModalProps) {
  const [saves, setSaves] = useState<SaveMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store references for restoration
  const buildStore = useBuildStore();
  const ragStore = useRagStore();
  const chatStore = useChatStore();

  // Load saves list when modal opens
  useEffect(() => {
    if (isOpen) {
      setSaves(getSavesList());
      setError(null);
    }
  }, [isOpen]);

  const handleLoad = (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const state = loadState(id);
      if (!state) {
        setError('Failed to load state - save not found');
        setLoading(false);
        return;
      }

      // Restore build store state
      restoreBuildState(state, buildStore);

      // Restore RAG store state
      restoreRagState(state, ragStore);

      // Restore chat store state
      restoreChatState(state, chatStore);

      onClose();
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load state');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this save?')) return;

    setDeleting(id);
    try {
      deleteState(id);
      setSaves(getSavesList());
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete save');
    } finally {
      setDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Load Saved State</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {saves.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <p>No saved states yet</p>
              <p className="text-sm mt-1">Use the Save State button to create your first save</p>
            </div>
          ) : (
            <div className="space-y-3">
              {saves.map((save) => (
                <div
                  key={save.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{save.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatSaveDate(save.createdAt)}
                      {save.updatedAt !== save.createdAt && (
                        <span className="ml-2 text-gray-400">
                          (updated {formatSaveDate(save.updatedAt)})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleLoad(save.id)}
                      disabled={loading}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load'}
                    </button>
                    <button
                      onClick={() => handleDelete(save.id)}
                      disabled={deleting === save.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete save"
                    >
                      {deleting === save.id ? (
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50 rounded-b-lg shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to restore build store state
function restoreBuildState(
  state: SavedState,
  store: BuildState
) {
  const { build } = state;

  // Restore raw data
  const dataTypes: DataType[] = ['transcripts', 'tickets', 'website', 'docs', 'research', 'email-guide'];
  dataTypes.forEach((type) => {
    store.setRawData(type, build.rawData[type]);
    store.setCleanedData(type, build.cleanedData[type]);
  });

  // Restore rules
  store.setTemplateRules(build.templateRules);
  store.setUserRules(build.userRules);

  // Restore extracted sections
  Object.entries(build.extractedSections).forEach(([section, content]) => {
    store.setExtractedSection(section, content);
  });

  // Restore system prompt
  store.setSystemPrompt(build.systemPrompt);
}

// Helper function to restore RAG store state
function restoreRagState(
  state: SavedState,
  store: RagState
) {
  const { rag } = state;

  const ragTypes: RagType[] = ['docs', 'case_study', 'pricing', 'faq', 'competitive', 'website'];

  ragTypes.forEach((type) => {
    // Set file content - this will also update status to 'uploaded' if content exists
    store.setFile(type, rag.files[type]);

    // Override with saved status
    store.setStatus(type, rag.status[type]);

    // Set chunk counts
    store.setChunkCount(type, rag.chunkCounts[type]);
  });
}

// Helper function to restore chat store state
function restoreChatState(
  state: SavedState,
  store: ChatState
) {
  const { chat } = state;

  // Reset first to clear any existing messages
  store.resetAll();

  // Restore context inputs
  store.setSystemPrompt(chat.systemPrompt);
  store.setPageUrl(chat.pageUrl);
  store.setAdditionalContext(chat.additionalContext);
  store.setInitialEmail(chat.initialEmail);

  // Restore messages
  chat.messages.forEach((msg) => {
    store.addMessage({
      role: msg.role,
      content: msg.content,
      debug: msg.debug,
    });
  });
}
