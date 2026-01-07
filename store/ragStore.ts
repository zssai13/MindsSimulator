import { create } from 'zustand';
import { RagType } from '@/lib/vectorstore/chunk';

export type RagStatus = 'empty' | 'uploaded' | 'vectorizing' | 'ready';

export interface RagState {
  // RAG file contents (raw text before vectorization)
  files: Record<RagType, string | null>;
  setFile: (type: RagType, content: string | null) => void;

  // Status per file type
  status: Record<RagType, RagStatus>;
  setStatus: (type: RagType, status: RagStatus) => void;

  // Chunk counts after vectorization
  chunkCounts: Record<RagType, number>;
  setChunkCount: (type: RagType, count: number) => void;

  // Overall vectorization state
  vectorizing: boolean;
  setVectorizing: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Check if any files are ready for vectorization
  hasUploadedFiles: () => boolean;

  // Check if all uploaded files are vectorized
  isFullyVectorized: () => boolean;

  // Reset everything
  reset: () => void;
}

const initialFiles: Record<RagType, string | null> = {
  docs: null,
  case_study: null,
  pricing: null,
  faq: null,
  competitive: null,
  website: null,
};

const initialStatus: Record<RagType, RagStatus> = {
  docs: 'empty',
  case_study: 'empty',
  pricing: 'empty',
  faq: 'empty',
  competitive: 'empty',
  website: 'empty',
};

const initialChunkCounts: Record<RagType, number> = {
  docs: 0,
  case_study: 0,
  pricing: 0,
  faq: 0,
  competitive: 0,
  website: 0,
};

export const useRagStore = create<RagState>((set, get) => ({
  files: { ...initialFiles },
  setFile: (type, content) =>
    set((state) => ({
      files: { ...state.files, [type]: content },
      status: {
        ...state.status,
        [type]: content ? 'uploaded' : 'empty',
      },
      // Reset chunk count when new content is uploaded
      chunkCounts: {
        ...state.chunkCounts,
        [type]: 0,
      },
    })),

  status: { ...initialStatus },
  setStatus: (type, status) =>
    set((state) => ({
      status: { ...state.status, [type]: status },
    })),

  chunkCounts: { ...initialChunkCounts },
  setChunkCount: (type, count) =>
    set((state) => ({
      chunkCounts: { ...state.chunkCounts, [type]: count },
    })),

  vectorizing: false,
  setVectorizing: (loading) => set({ vectorizing: loading }),

  error: null,
  setError: (error) => set({ error }),

  hasUploadedFiles: () => {
    const state = get();
    return Object.values(state.status).some(
      (s) => s === 'uploaded' || s === 'ready'
    );
  },

  isFullyVectorized: () => {
    const state = get();
    // Check if all non-empty files are vectorized
    return Object.entries(state.status).every(
      ([, status]) => status === 'empty' || status === 'ready'
    );
  },

  reset: () =>
    set({
      files: { ...initialFiles },
      status: { ...initialStatus },
      chunkCounts: { ...initialChunkCounts },
      vectorizing: false,
      error: null,
    }),
}));

// RAG type configuration for UI
export const RAG_TYPES: RagType[] = [
  'docs',
  'case_study',
  'pricing',
  'faq',
  'competitive',
  'website',
];

export const RAG_TYPE_CONFIG: Record<RagType, { label: string; description: string }> = {
  docs: {
    label: 'Product Docs',
    description: 'Features, capabilities, technical details',
  },
  case_study: {
    label: 'Case Studies',
    description: 'Customer success stories and results',
  },
  pricing: {
    label: 'Pricing',
    description: 'Plans, pricing tiers, packages',
  },
  faq: {
    label: 'FAQ',
    description: 'Common questions and answers',
  },
  competitive: {
    label: 'Competitive',
    description: 'Competitor comparisons and positioning',
  },
  website: {
    label: 'Website',
    description: 'Marketing pages, landing pages',
  },
};
