'use client';

import { useState, KeyboardEvent } from 'react';
import { useChatStore, ProcessingStep } from '@/store/chatStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ChatInputProps {
  onSend: (message: string) => void;
}

const STEP_LABELS: Record<ProcessingStep, string> = {
  idle: '',
  analyzing: 'Analyzing message...',
  retrieving: 'Retrieving knowledge...',
  generating: 'Generating response...',
};

export function ChatInput({ onSend }: ChatInputProps) {
  const [input, setInput] = useState('');
  const processingStep = useChatStore((s) => s.processingStep);
  const isProcessing = processingStep !== 'idle';

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;

    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-white p-4">
      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <LoadingSpinner size="sm" />
          <span>{STEP_LABELS[processingStep]}</span>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type as the prospect... (Enter to send, Shift+Enter for new line)"
          disabled={isProcessing}
          rows={2}
          className="flex-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isProcessing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-2">
        You are simulating the prospect. The AI will respond as the sales rep.
      </p>
    </div>
  );
}
