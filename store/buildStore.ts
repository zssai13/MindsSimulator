import { create } from 'zustand';

export type DataType = 'transcripts' | 'tickets' | 'website' | 'research';

interface CleanedData {
  transcripts: string | null;
  tickets: string | null;
  website: string | null;
  research: string | null;
}

export interface BuildState {
  // Uploaded data (pre-cleaned markdown files)
  cleanedData: CleanedData;
  setCleanedData: (type: DataType, content: string | null) => void;

  // Extracted sections
  extractedSections: Record<string, string>;
  setExtractedSection: (section: string, content: string) => void;

  // Final prompt
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;

  // Loading states
  generatingPrompt: boolean;
  setGeneratingPrompt: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

const initialCleanedData: CleanedData = {
  transcripts: null,
  tickets: null,
  website: null,
  research: null,
};

export const useBuildStore = create<BuildState>((set) => ({
  cleanedData: { ...initialCleanedData },
  setCleanedData: (type, content) =>
    set((state) => ({ cleanedData: { ...state.cleanedData, [type]: content } })),

  extractedSections: {},
  setExtractedSection: (section, content) =>
    set((state) => ({ extractedSections: { ...state.extractedSections, [section]: content } })),

  systemPrompt: '',
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),

  generatingPrompt: false,
  setGeneratingPrompt: (loading) => set({ generatingPrompt: loading }),

  reset: () => set({
    cleanedData: { ...initialCleanedData },
    extractedSections: {},
    systemPrompt: '',
    generatingPrompt: false,
  }),
}));
