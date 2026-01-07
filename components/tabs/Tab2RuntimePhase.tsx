'use client';

import { RagSection } from '@/components/rag/RagSection';
import { ContextInputs } from '@/components/chat/ContextInputs';
import { ChatContainer } from '@/components/chat/ChatContainer';

export function Tab2RuntimePhase() {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold">Runtime Phase</h2>
      <p className="text-gray-600">Test the Haiku → RAG → Sonnet pipeline with full visibility.</p>

      {/* Section 1: RAG Data (Vectorized) */}
      <RagSection />

      {/* Section 2: Context Inputs */}
      <ContextInputs />

      {/* Section 3: Chat Simulation */}
      <ChatContainer />
    </div>
  );
}
