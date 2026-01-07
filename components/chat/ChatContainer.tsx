'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChatStore, HaikuAnalysis, RagChunk, MessageDebug } from '@/store/chatStore';
import { useRagStore } from '@/store/ragStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function ChatContainer() {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const setProcessingStep = useChatStore((s) => s.setProcessingStep);
  const systemPrompt = useChatStore((s) => s.systemPrompt);
  const pageUrl = useChatStore((s) => s.pageUrl);
  const additionalContext = useChatStore((s) => s.additionalContext);
  const initialEmail = useChatStore((s) => s.initialEmail);
  const error = useChatStore((s) => s.error);
  const setError = useChatStore((s) => s.setError);
  const resetChat = useChatStore((s) => s.resetChat);

  const isFullyVectorized = useRagStore((s) => s.isFullyVectorized);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add initial email as first message if set and no messages exist
  useEffect(() => {
    if (initialEmail && messages.length === 0) {
      addMessage({
        role: 'assistant',
        content: initialEmail,
      });
    }
  }, [initialEmail, messages.length, addMessage]);

  // Handle sending a message
  const handleSend = useCallback(async (userMessage: string) => {
    setError(null);

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    // Build conversation history for API calls
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      // Step 1: Analyze with Haiku
      setProcessingStep('analyzing');
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history,
          pageContext: pageUrl,
        }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const { analysis }: { analysis: HaikuAnalysis } = await analyzeRes.json();

      // Step 2: Query RAG if needed
      let ragResults: RagChunk[] = [];
      if (analysis.needs_search && analysis.search_queries && analysis.search_queries.length > 0) {
        setProcessingStep('retrieving');

        const queryRes = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queries: analysis.search_queries,
            // Search all types for maximum thoroughness
            limit: 8,
          }),
        });

        if (queryRes.ok) {
          const queryData = await queryRes.json();
          ragResults = queryData.chunks || [];
        }
        // If query fails, we continue without RAG results
      }

      // Step 3: Generate response with Sonnet
      setProcessingStep('generating');
      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          analysis,
          knowledge: ragResults,
          history,
          message: userMessage,
          additionalContext: additionalContext || undefined,
        }),
      });

      if (!generateRes.ok) {
        const err = await generateRes.json();
        throw new Error(err.error || 'Generation failed');
      }

      const { response, finalPrompt } = await generateRes.json();

      // Add assistant message with debug info
      const debug: MessageDebug = {
        analysis,
        ragResults,
        finalPrompt,
      };

      addMessage({
        role: 'assistant',
        content: response,
        debug,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setProcessingStep('idle');
    }
  }, [messages, systemPrompt, pageUrl, additionalContext, addMessage, setProcessingStep, setError]);

  const hasMessages = messages.length > 0;
  const hasVectorizedData = isFullyVectorized();

  return (
    <section className="border rounded-lg overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold">Chat Simulation</h3>
        <div className="flex items-center gap-3">
          {!hasVectorizedData && (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              No RAG data vectorized
            </span>
          )}
          {hasMessages && (
            <button
              onClick={resetChat}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Reset Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {!hasMessages && (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            <div className="text-center">
              <p className="mb-2">No messages yet</p>
              <p className="text-xs text-gray-400">
                Type a message below to simulate a prospect conversation
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input area */}
      <ChatInput onSend={handleSend} />
    </section>
  );
}
