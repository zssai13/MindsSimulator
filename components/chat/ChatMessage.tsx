'use client';

import { ChatMessage as ChatMessageType } from '@/store/chatStore';
import { ExpandableDebug } from './ExpandableDebug';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] ${
          isUser ? 'order-1' : 'order-2'
        }`}
      >
        {/* Message bubble */}
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Role label */}
          <div
            className={`text-xs font-medium mb-1 ${
              isUser ? 'text-blue-200' : 'text-gray-500'
            }`}
          >
            {isUser ? 'Prospect' : 'Sales Rep'}
          </div>

          {/* Message content */}
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>

          {/* Timestamp */}
          <div
            className={`text-xs mt-2 ${
              isUser ? 'text-blue-200' : 'text-gray-400'
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>

        {/* Debug panel for assistant messages */}
        {!isUser && message.debug && (
          <div className="mt-2">
            <ExpandableDebug debug={message.debug} />
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
