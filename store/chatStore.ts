import { create } from 'zustand';
import { RagType } from '@/lib/vectorstore/chunk';

// Message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  debug?: MessageDebug;
}

// Debug info attached to each assistant message
export interface MessageDebug {
  analysis: HaikuAnalysis | null;
  ragResults: RagChunk[];
  finalPrompt: string;
}

// Haiku analysis output
export interface HaikuAnalysis {
  buying_stage: 'curious' | 'interested' | 'evaluating' | 'ready';
  stage_evidence: string;
  warmth: 'cold' | 'warming' | 'warm' | 'hot';
  warmth_evidence: string;
  implicit_concerns: string[];
  intent: string;
  needs_search: boolean;
  search_queries: string[] | null;
  content_types: RagType[] | null;
  response_strategy: {
    approach: string;
    tone: string;
    length: string;
    key_focus: string;
  };
}

// RAG chunk result
export interface RagChunk {
  id: string;
  text: string;
  metadata: {
    type: string;
    topic?: string;
  };
  score: number;
}

// Processing state
export type ProcessingStep = 'idle' | 'analyzing' | 'retrieving' | 'generating';

interface ChatState {
  // Context inputs
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  pageUrl: string;
  setPageUrl: (url: string) => void;
  additionalContext: string;
  setAdditionalContext: (context: string) => void;
  initialEmail: string;
  setInitialEmail: (email: string) => void;

  // Messages
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessageDebug: (messageId: string, debug: MessageDebug) => void;

  // Processing state
  processingStep: ProcessingStep;
  setProcessingStep: (step: ProcessingStep) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;

  // Actions
  resetChat: () => void;
  resetAll: () => void;
}

// Generate unique ID
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useChatStore = create<ChatState>((set) => ({
  // Context inputs
  systemPrompt: '',
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),

  pageUrl: '',
  setPageUrl: (url) => set({ pageUrl: url }),

  additionalContext: '',
  setAdditionalContext: (context) => set({ additionalContext: context }),

  initialEmail: '',
  setInitialEmail: (email) => set({ initialEmail: email }),

  // Messages
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        },
      ],
    })),
  updateMessageDebug: (messageId, debug) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, debug } : msg
      ),
    })),

  // Processing state
  processingStep: 'idle',
  setProcessingStep: (step) => set({ processingStep: step }),

  // Error handling
  error: null,
  setError: (error) => set({ error }),

  // Reset chat (keep context inputs)
  resetChat: () =>
    set({
      messages: [],
      processingStep: 'idle',
      error: null,
    }),

  // Reset everything
  resetAll: () =>
    set({
      systemPrompt: '',
      pageUrl: '',
      additionalContext: '',
      initialEmail: '',
      messages: [],
      processingStep: 'idle',
      error: null,
    }),
}));
