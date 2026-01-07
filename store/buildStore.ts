import { create } from 'zustand';

export type DataType = 'transcripts' | 'tickets' | 'website' | 'docs' | 'research' | 'email-guide';

interface CleanedData {
  transcripts: string | null;
  tickets: string | null;
  website: string | null;
  docs: string | null;
  research: string | null;
  'email-guide': string | null;
}

export interface BuildState {
  // Raw uploads
  rawData: Record<DataType, string | null>;
  setRawData: (type: DataType, content: string | null) => void;

  // Cleaned outputs
  cleanedData: CleanedData;
  setCleanedData: (type: DataType, content: string | null) => void;

  // Static rules
  templateRules: string;
  setTemplateRules: (rules: string) => void;
  userRules: string;
  setUserRules: (rules: string) => void;

  // Extracted sections
  extractedSections: Record<string, string>;
  setExtractedSection: (section: string, content: string) => void;

  // Final prompt
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;

  // Loading states
  cleaningInProgress: Record<DataType, boolean>;
  setCleaningInProgress: (type: DataType, loading: boolean) => void;
  generatingPrompt: boolean;
  setGeneratingPrompt: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

const initialCleanedData: CleanedData = {
  transcripts: null,
  tickets: null,
  website: null,
  docs: null,
  research: null,
  'email-guide': null,
};

const initialRawData: Record<DataType, string | null> = {
  transcripts: null,
  tickets: null,
  website: null,
  docs: null,
  research: null,
  'email-guide': null,
};

export const useBuildStore = create<BuildState>((set) => ({
  rawData: { ...initialRawData },
  setRawData: (type, content) =>
    set((state) => ({ rawData: { ...state.rawData, [type]: content } })),

  cleanedData: { ...initialCleanedData },
  setCleanedData: (type, content) =>
    set((state) => ({ cleanedData: { ...state.cleanedData, [type]: content } })),

  templateRules: '',
  setTemplateRules: (rules) => set({ templateRules: rules }),
  userRules: '',
  setUserRules: (rules) => set({ userRules: rules }),

  extractedSections: {},
  setExtractedSection: (section, content) =>
    set((state) => ({ extractedSections: { ...state.extractedSections, [section]: content } })),

  systemPrompt: '',
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),

  cleaningInProgress: {
    transcripts: false,
    tickets: false,
    website: false,
    docs: false,
    research: false,
    'email-guide': false,
  },
  setCleaningInProgress: (type, loading) =>
    set((state) => ({ cleaningInProgress: { ...state.cleaningInProgress, [type]: loading } })),
  generatingPrompt: false,
  setGeneratingPrompt: (loading) => set({ generatingPrompt: loading }),

  reset: () => set({
    rawData: { ...initialRawData },
    cleanedData: { ...initialCleanedData },
    templateRules: '',
    userRules: '',
    extractedSections: {},
    systemPrompt: '',
    cleaningInProgress: {
      transcripts: false,
      tickets: false,
      website: false,
      docs: false,
      research: false,
      'email-guide': false,
    },
    generatingPrompt: false,
  }),
}));
