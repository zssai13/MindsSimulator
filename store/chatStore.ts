import { create } from 'zustand';
import { RagType } from '@/lib/vectorstore/chunk';

// Default static rules template
export const DEFAULT_TEMPLATE_RULES = `## KNOWLEDGE HANDLING

When you receive information in <knowledge> tags:
- Use it naturally in your responses
- Never mention that you retrieved or looked up information
- Never reference the tags themselves
- Cite specific details when relevant

## BUYING STAGE RESPONSE RULES

### Curious Stage (Just exploring)
- Keep responses short (2-3 sentences max)
- Focus on value, not features
- One clear CTA

### Interested Stage (Engaged but uncertain)
- Share relevant proof points
- Address implicit concerns
- Suggest next step

### Evaluating Stage (Comparing options)
- Be specific about capabilities
- Acknowledge competitive landscape
- Offer concrete next steps

### Ready Stage (Decision mode)
- Remove friction
- Be direct about pricing/process
- Facilitate the decision

## RESPONSE FORMAT RULES

- Never use bullet points in cold emails
- Keep paragraphs to 2-3 sentences max
- Use "you" more than "we" or "I"
- End with a single, clear question or CTA
- Match the prospect's formality level

## BOUNDARIES

- Never discuss specific pricing without permission
- Never make guarantees about results
- Never disparage competitors by name
- If unsure, ask clarifying questions
- Suggest human handoff for complex technical questions`;

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

export interface ChatState {
  // Context inputs
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  templateRules: string;
  setTemplateRules: (rules: string) => void;
  userRules: string;
  setUserRules: (rules: string) => void;
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

  templateRules: DEFAULT_TEMPLATE_RULES,
  setTemplateRules: (rules) => set({ templateRules: rules }),

  userRules: '',
  setUserRules: (rules) => set({ userRules: rules }),

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
      templateRules: DEFAULT_TEMPLATE_RULES,
      userRules: '',
      pageUrl: '',
      additionalContext: '',
      initialEmail: '',
      messages: [],
      processingStep: 'idle',
      error: null,
    }),
}));
