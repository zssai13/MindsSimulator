# RepSimulator Technical Architecture

**Last Updated:** All Phases Complete (Phase 4 Session - January 2026)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REPSIMULATOR TESTING APP                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐    │
│  │      TAB 1: BUILD PHASE     │    │    TAB 2: RUNTIME PHASE     │    │
│  │         ✅ COMPLETE          │    │         ✅ COMPLETE          │    │
│  │                             │    │                             │    │
│  │  • Data Upload & Cleaning   │    │  • RAG Data Vectorization ✅│    │
│  │  • System Prompt Generation │───▶│  • Context Inputs        ✅ │    │
│  │  • Static Rules Editor      │    │  • Chat Simulation       ✅ │    │
│  │  • Final Prompt Assembly    │    │  • Debug Panels          ✅ │    │
│  └─────────────────────────────┘    └─────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose | Status |
|-------|------------|---------|--------|
| **Framework** | Next.js 14 (App Router) | React framework with API routes | ✅ Configured |
| **Language** | TypeScript | Type safety | ✅ Configured |
| **Styling** | Tailwind CSS | Utility-first CSS | ✅ Configured |
| **State** | Zustand | Lightweight state management | ✅ buildStore + ragStore + chatStore |
| **Vector DB** | LanceDB (@lancedb/lancedb) | Local vector storage | ✅ Working |
| **Embeddings** | OpenAI text-embedding-3-small | 1536-dim vectors | ✅ Working |
| **LLM** | Anthropic Claude (Opus/Sonnet/Haiku) | AI generation | ✅ All models working |

---

## Directory Structure

```
MindsSimulator/
├── app/
│   ├── page.tsx                      # ✅ Main page with tab navigation
│   ├── layout.tsx                    # ✅ Root layout
│   ├── globals.css                   # ✅ Tailwind imports
│   └── api/
│       ├── clean/
│       │   └── route.ts              # ✅ POST: Clean data with Opus
│       ├── generate-prompt/
│       │   └── route.ts              # ✅ POST: Extract sections with Opus
│       ├── vectorize/
│       │   └── route.ts              # ✅ POST: Chunk + embed + store in LanceDB
│       ├── query/
│       │   └── route.ts              # ✅ POST: Vector similarity search
│       ├── analyze/
│       │   └── route.ts              # ✅ POST: Haiku message analysis
│       └── generate/
│           └── route.ts              # ✅ POST: Sonnet response generation
│
├── components/
│   ├── tabs/
│   │   ├── Tab1BuildPhase.tsx        # ✅ Build phase container
│   │   └── Tab2RuntimePhase.tsx      # ✅ Runtime phase (RAG + Chat complete)
│   ├── upload/
│   │   ├── DataUploadZone.tsx        # ✅ File upload + clean button
│   │   ├── CleanedFileDisplay.tsx    # ✅ View/download cleaned files
│   │   └── FileViewModal.tsx         # ✅ Modal to view file contents
│   ├── prompt/
│   │   ├── SystemPromptGenerator.tsx # ✅ Generate button + sections
│   │   ├── StaticRulesEditor.tsx     # ✅ Template + user rules
│   │   └── FinalPromptDisplay.tsx    # ✅ Combined prompt display
│   ├── rag/
│   │   ├── RagUploadZone.tsx         # ✅ RAG file upload with status
│   │   └── RagSection.tsx            # ✅ Container + Vectorize All button
│   ├── chat/
│   │   ├── ChatContainer.tsx         # ✅ Chat orchestration (analyze → query → generate)
│   │   ├── ChatMessage.tsx           # ✅ Message bubble with debug
│   │   ├── ChatInput.tsx             # ✅ Message input with processing states
│   │   ├── ContextInputs.tsx         # ✅ System prompt, URL, goals, initial email
│   │   └── ExpandableDebug.tsx       # ✅ Collapsible debug panel (3 tabs)
│   ├── state/
│   │   ├── SaveStateButton.tsx       # ✅ Save state modal
│   │   └── LoadStateModal.tsx        # ✅ Load state list
│   └── ui/
│       ├── ModelLabel.tsx            # ✅ Model badge (opus/sonnet/haiku/openai)
│       └── LoadingSpinner.tsx        # ✅ Loading indicator
│
├── lib/
│   ├── anthropic.ts                  # ✅ Anthropic client + model constants
│   ├── prompts/
│   │   ├── cleaning-prompts.ts       # ✅ Per-type cleaning instructions
│   │   └── extraction-prompts.ts     # ✅ Section extraction instructions
│   ├── vectorstore/
│   │   ├── embeddings.ts             # ✅ OpenAI embedding calls (batch support)
│   │   ├── chunk.ts                  # ✅ Semantic chunking by type
│   │   └── index.ts                  # ✅ LanceDB init, index, query operations
│   └── storage.ts                    # ✅ LocalStorage save/load operations
│
├── store/
│   ├── buildStore.ts                 # ✅ Tab 1 state (Zustand)
│   ├── ragStore.ts                   # ✅ RAG/vector state (Zustand)
│   └── chatStore.ts                  # ✅ Chat state (messages, context, processing)
│
├── .lancedb/                         # ✅ Vector database storage (auto-created)
│
├── docs/
│   ├── PRODUCT-PRD.md                # ✅ Product requirements
│   ├── ARCHITECTURE.md               # ✅ This file
│   ├── BUILDINGPLAN.md               # ✅ Development plan
│   └── HANDOFF.md                    # ✅ Session handoff
│
├── .env.local                        # ✅ API keys (gitignored)
├── .env.example                      # ✅ API key template
├── CLAUDE.md                         # ✅ AI assistant context
├── package.json                      # ✅ Dependencies (includes @lancedb/lancedb)
├── tailwind.config.ts                # ✅ Tailwind config
├── tsconfig.json                     # ✅ TypeScript config
└── next.config.mjs                   # ✅ Next.js config (LanceDB externals)
```

---

## Data Flow

### Build Phase Flow (✅ IMPLEMENTED)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Raw Files   │────▶│  /api/clean  │────▶│ Cleaned Data │
│  (6 types)   │     │    [Opus]    │     │    (JSON)    │
└──────────────┘     └──────────────┘     └──────────────┘
                            ✅                    │
                                                  ▼
                     ┌──────────────────────────────────────┐
                     │         /api/generate-prompt         │
                     │              [Opus] ✅                │
                     │                                      │
                     │  Extracts 6 sections:                │
                     │  • Identity    • Tone                │
                     │  • ICP         • Objections          │
                     │  • Email       • Competitive         │
                     └──────────────────────────────────────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│Static Rules  │────▶│   Combine    │────▶│   System     │
│(Template +   │     │      ✅       │     │   Prompt     │
│ User Rules)  │     └──────────────┘     └──────────────┘
└──────────────┘
```

### RAG Vectorization Flow (✅ IMPLEMENTED)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  RAG Files   │────▶│   Chunking   │────▶│  Embedding   │────▶│   LanceDB    │
│  (6 types)   │     │  (semantic)  │     │   [OpenAI]   │     │   Storage    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       ✅                   ✅                   ✅                    ✅

Chunking Strategy by Type:
• docs       → By markdown headers (##, ###)
• case_study → By customer story / numbered items
• pricing    → By plan/tier names
• faq        → By Q&A pairs
• competitive→ By competitor sections
• website    → By page sections
```

### Runtime Phase Flow (✅ IMPLEMENTED)

```
┌──────────────────────────────────────────────────────────┐
│                    PER-MESSAGE FLOW                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  User Message + Page URL + History                        │
│              │                                            │
│              ▼                                            │
│  ┌────────────────────┐                                  │
│  │    /api/analyze    │  Outputs:                        │
│  │      [Haiku] ✅     │  • buying_stage                  │
│  │                    │  • warmth                        │
│  │                    │  • implicit_concerns             │
│  │                    │  • search_queries                │
│  │                    │  • response_strategy             │
│  └────────────────────┘                                  │
│              │                                            │
│              ▼                                            │
│  ┌────────────────────┐                                  │
│  │    /api/query      │  If needs_search: true           │
│  │    [OpenAI] ✅      │  Query with search_queries       │
│  │                    │  Filter by content_types         │
│  └────────────────────┘                                  │
│              │                                            │
│              ▼                                            │
│  ┌────────────────────────────────────────────┐          │
│  │           PROMPT ASSEMBLY                   │          │
│  │                                             │          │
│  │  System Prompt (from Tab 1) ✅              │          │
│  │  + Additional Context                       │          │
│  │  + Haiku Analysis                           │          │
│  │  + Retrieved Knowledge (in <knowledge> tags)│          │
│  │  + Conversation History                     │          │
│  │  + Current Message                          │          │
│  └────────────────────────────────────────────┘          │
│              │                                            │
│              ▼                                            │
│  ┌────────────────────┐                                  │
│  │   /api/generate    │  Returns:                        │
│  │    [Sonnet] ✅      │  • response text                 │
│  │                    │  • finalPrompt (for debug)       │
│  └────────────────────┘                                  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## API Routes

### POST /api/clean ✅ IMPLEMENTED

Cleans raw data using Opus with type-specific prompts.

**Request:**
```typescript
{
  type: 'transcripts' | 'tickets' | 'website' | 'docs' | 'research' | 'email-guide',
  content: string  // Raw file content
}
```

**Response:**
```typescript
{
  cleaned: string,  // Cleaned/structured JSON
  model: 'opus'
}
```

### POST /api/generate-prompt ✅ IMPLEMENTED

Extracts system prompt sections from all cleaned data.

**Request:**
```typescript
{
  cleanedData: {
    transcripts: string | null,
    tickets: string | null,
    website: string | null,
    docs: string | null,
    research: string | null,
    'email-guide': string | null
  },
  staticRules: string,
  userRules: string
}
```

**Response:**
```typescript
{
  systemPrompt: string,
  sections: {
    identity: string,
    icp: string,
    email_framework: string,
    tone: string,
    objections: string,
    competitive: string
  },
  model: 'opus'
}
```

### POST /api/vectorize ✅ IMPLEMENTED

Chunks and embeds files for RAG retrieval.

**Request:**
```typescript
{
  files: Array<{
    type: 'docs' | 'case_study' | 'pricing' | 'faq' | 'competitive' | 'website',
    content: string
  }>,
  clearExisting?: boolean  // Optional: clear DB before indexing
}
```

**Response:**
```typescript
{
  success: boolean,
  chunksIndexed: number,
  byType: Record<string, number>,  // Chunks per type
  model: 'openai'
}
```

**Tested Output Example:**
```json
{"success":true,"chunksIndexed":3,"byType":{"faq":3},"model":"openai"}
```

### POST /api/query ✅ IMPLEMENTED

Queries vector database for relevant chunks.

**Request:**
```typescript
{
  queries: string[],           // Search queries (single or multiple)
  contentTypes?: string[],     // Optional type filter
  limit?: number               // Max results (default: 5)
}
```

**Response:**
```typescript
{
  chunks: Array<{
    id: string,
    text: string,
    metadata: {
      type: string,
      topic?: string
    },
    score: number  // Lower = more relevant (distance metric)
  }>,
  model: 'openai'
}
```

**Tested Output Example:**
```json
{
  "chunks": [
    {
      "id": "faq_1767695443316_2",
      "text": "Q: What models are used?\nA: Opus for cleaning...",
      "metadata": {"type": "faq", "topic": ""},
      "score": 0.9679348468780518
    }
  ],
  "model": "openai"
}
```

### POST /api/analyze ✅ IMPLEMENTED

Analyzes user message with Haiku to determine buying stage, warmth, concerns, and search queries.

**Request:**
```typescript
{
  message: string,
  history: Array<{ role: 'user' | 'assistant', content: string }>,
  pageContext: string
}
```

**Response:**
```typescript
{
  analysis: {
    buying_stage: 'curious' | 'interested' | 'evaluating' | 'ready',
    stage_evidence: string,
    warmth: 'cold' | 'warming' | 'warm' | 'hot',
    warmth_evidence: string,
    implicit_concerns: string[],
    intent: string,
    needs_search: boolean,
    search_queries: string[] | null,
    content_types: string[] | null,
    response_strategy: {
      approach: string,
      tone: string,
      length: string,
      key_focus: string
    }
  },
  model: 'haiku'
}
```

### POST /api/generate ✅ IMPLEMENTED

Generates response with Sonnet using assembled prompt.

**Request:**
```typescript
{
  systemPrompt: string,
  analysis: HaikuAnalysis,
  knowledge: Array<RagChunk>,
  history: Array<{ role: 'user' | 'assistant', content: string }>,
  message: string,
  additionalContext?: string
}
```

**Response:**
```typescript
{
  response: string,
  finalPrompt: string,
  model: 'sonnet'
}
```

---

## State Management

### buildStore (Tab 1) ✅ IMPLEMENTED

```typescript
interface BuildState {
  rawData: Record<DataType, string | null>;
  cleanedData: Record<DataType, string | null>;
  templateRules: string;
  userRules: string;
  extractedSections: Record<string, string>;
  systemPrompt: string;
  cleaningInProgress: Record<DataType, boolean>;
  generatingPrompt: boolean;
  reset: () => void;
}
```

### ragStore (Tab 2 - RAG) ✅ IMPLEMENTED

```typescript
interface RagState {
  // RAG file contents
  files: Record<RagType, string | null>;
  setFile: (type: RagType, content: string | null) => void;

  // Status per file: 'empty' | 'uploaded' | 'vectorizing' | 'ready'
  status: Record<RagType, RagStatus>;
  setStatus: (type: RagType, status: RagStatus) => void;

  // Chunk counts after vectorization
  chunkCounts: Record<RagType, number>;
  setChunkCount: (type: RagType, count: number) => void;

  // Loading state
  vectorizing: boolean;
  setVectorizing: (loading: boolean) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;

  // Helpers
  hasUploadedFiles: () => boolean;
  isFullyVectorized: () => boolean;
  reset: () => void;
}
```

### chatStore (Tab 2 - Chat) ✅ IMPLEMENTED

```typescript
interface ChatState {
  // Context inputs
  systemPrompt: string;
  pageUrl: string;
  additionalContext: string;
  initialEmail: string;

  // Messages with debug info
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    debug?: {
      analysis: HaikuAnalysis | null;
      ragResults: RagChunk[];
      finalPrompt: string;
    };
  }>;

  // Processing state
  processingStep: 'idle' | 'analyzing' | 'retrieving' | 'generating';

  // Error handling
  error: string | null;

  // Actions
  addMessage, updateMessageDebug, resetChat, resetAll
}
```

---

## Vector Database Schema ✅ IMPLEMENTED

### LanceDB Configuration

- **Package:** `@lancedb/lancedb`
- **Storage Path:** `.lancedb/` in project root
- **Table Name:** `rag_chunks`

**Important:** LanceDB uses native Node.js bindings. Required Next.js config:

```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@lancedb/lancedb'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@lancedb/lancedb');
    }
    return config;
  },
};
```

### Table Schema: rag_chunks

| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique chunk ID (format: `{type}_{timestamp}_{index}`) |
| text | string | Chunk content |
| vector | float[1536] | OpenAI embedding |
| type | string | Content type (docs, case_study, pricing, faq, competitive, website) |
| topic | string | Optional topic tag |

### Chunking Strategy (Semantic)

| Type | Strategy | Test Result |
|------|----------|-------------|
| docs | By markdown headers (##, ###) | 2 chunks from 2 sections |
| case_study | By customer story patterns | Working |
| pricing | By plan/tier names | Working |
| faq | By Q&A pairs | 3 chunks from 3 Q&As |
| competitive | By competitor sections | Working |
| website | By page sections | Working |

---

## Model Configuration

```typescript
// lib/anthropic.ts
export const MODELS = {
  OPUS: 'claude-opus-4-20250514',
  SONNET: 'claude-sonnet-4-20250514',
  HAIKU: 'claude-3-haiku-20240307',
} as const;

// lib/vectorstore/embeddings.ts
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;
```

### Model Selection Rationale

| Task | Model | Reasoning | Status |
|------|-------|-----------|--------|
| Data cleaning | Opus | Quality matters, runs once | ✅ Working |
| Prompt extraction | Opus | Quality matters, runs once | ✅ Working |
| Embeddings | OpenAI text-embedding-3-small | Industry standard, 1536 dims | ✅ Working |
| Message analysis | Haiku | Fast, cheap, classification task | ✅ Working |
| Response generation | Sonnet | Balance of quality and cost | ✅ Working |

---

## Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...  # ✅ Required for Opus/Sonnet/Haiku
OPENAI_API_KEY=sk-...          # ✅ Required for embeddings
```

---

## Development Phases

| Phase | Focus | Key Deliverables | Status |
|-------|-------|------------------|--------|
| **1** | Tab 1 - Build | Upload, cleaning, prompt generation | ✅ COMPLETE |
| **2** | Vectorization | LanceDB, chunking, embeddings, RAG UI | ✅ COMPLETE |
| **3** | Chat System | Analysis, retrieval, generation, debug UI | ✅ COMPLETE |
| **4** | Save/Load | State persistence across sessions | ✅ COMPLETE |

**ALL PHASES COMPLETE - APP READY FOR PRODUCTION USE**

---

## Phase 2 Implementation Notes

### Key Discoveries

1. **LanceDB Native Bindings** - LanceDB uses native Node.js modules that don't bundle with webpack. Required `serverComponentsExternalPackages` config in next.config.mjs.

2. **Semantic Chunking** - Each content type has a specialized chunking strategy using regex patterns to split by semantic units (Q&A pairs, markdown headers, pricing tiers, etc.) rather than character count.

3. **Batch Embeddings** - OpenAI embeddings are batched (100 texts per API call) for efficiency. The `getEmbeddings()` function handles this automatically.

4. **Distance Metric** - LanceDB returns a `score` field where lower values = more similar. This is a distance metric, not a similarity score.

5. **Multi-Query Support** - The `/api/query` endpoint supports multiple queries and deduplicates results automatically.

### Test Results (All Passing)

| Test | Input | Output |
|------|-------|--------|
| Vectorize FAQ | 3 Q&A pairs | `chunksIndexed: 3` |
| Vectorize Docs | 2 markdown sections | `chunksIndexed: 2` |
| Query single | "What models?" | Returns 3 chunks, best score: 0.70 |
| Query with filter | contentTypes: ["docs"] | Returns only docs (2 results) |
| Query multi | 2 queries | Combines & deduplicates (3 unique) |

### Files Created in Phase 2

| File | Purpose |
|------|---------|
| `lib/vectorstore/embeddings.ts` | OpenAI embedding functions with batch support |
| `lib/vectorstore/chunk.ts` | Semantic chunking by 6 content types |
| `lib/vectorstore/index.ts` | LanceDB init, index, query, clear operations |
| `store/ragStore.ts` | Zustand store for RAG state |
| `app/api/vectorize/route.ts` | Chunk + embed + store endpoint |
| `app/api/query/route.ts` | Vector similarity search endpoint |
| `components/rag/RagUploadZone.tsx` | Upload zone with status indicator |
| `components/rag/RagSection.tsx` | Container with Vectorize All button |

---

## Phase 3 Implementation Notes

### Key Implementation Details

1. **Haiku JSON Parsing** - Haiku sometimes wraps JSON in markdown code blocks. The analyze route strips these before parsing and falls back to sensible defaults if parsing fails.

2. **Processing States** - The chat UI shows detailed processing states: "Analyzing...", "Retrieving...", "Generating..." to give users visibility into which step is running.

3. **Tab 1 → Tab 2 Integration** - The ContextInputs component uses a useEffect to auto-load the system prompt from buildStore when it's available. Users can also manually paste.

4. **Debug UI Design** - The ExpandableDebug component uses three tabbed panels (Analysis, RAG, Prompt) to keep debug info accessible but not overwhelming.

5. **Error Handling** - Each step can fail independently. Errors are displayed in the UI and the pipeline stops gracefully.

### Chat Flow Implementation

```
User types message → ChatInput
        │
        ▼
ChatContainer.handleSend()
        │
        ├─→ POST /api/analyze (Haiku)
        │   Returns: buying_stage, warmth, search_queries, strategy
        │
        ├─→ POST /api/query (if needs_search: true)
        │   Returns: relevant knowledge chunks
        │
        └─→ POST /api/generate (Sonnet)
            Returns: response + finalPrompt for debug
        │
        ▼
ChatMessage renders with ExpandableDebug
```

---

## Phase 4 Implementation Notes

### Save/Load State Architecture

The save/load system persists complete application state to browser LocalStorage.

### Storage Schema

```typescript
// lib/storage.ts
interface SavedState {
  id: string;           // Unique ID: save_{timestamp}_{random}
  name: string;         // User-provided name
  createdAt: number;    // Unix timestamp
  updatedAt: number;    // Unix timestamp

  build: {              // Tab 1 state
    rawData: Record<DataType, string | null>;
    cleanedData: Record<DataType, string | null>;
    templateRules: string;
    userRules: string;
    extractedSections: Record<string, string>;
    systemPrompt: string;
  };

  rag: {                // Tab 2 RAG state
    files: Record<RagType, string | null>;
    status: Record<RagType, RagStatus>;
    chunkCounts: Record<RagType, number>;
  };

  chat: {               // Tab 2 Chat state
    systemPrompt: string;
    pageUrl: string;
    additionalContext: string;
    initialEmail: string;
    messages: ChatMessage[];
  };
}
```

### LocalStorage Keys

| Key | Purpose |
|-----|---------|
| `repsimulator_saves` | JSON array of save metadata (id, name, timestamps) |
| `repsimulator_state_{id}` | Full SavedState object for each save |

### State Restoration Flow

```
Load Button Click
       │
       ▼
LoadStateModal opens
       │
       ▼
User selects save
       │
       ▼
loadState(id) retrieves SavedState
       │
       ├─→ restoreBuildState() → Updates buildStore
       ├─→ restoreRagState() → Updates ragStore
       └─→ restoreChatState() → Resets and updates chatStore
       │
       ▼
Modal closes, UI reflects restored state
```

### Key Implementation Details

1. **Store Independence** - Each store is restored via dedicated helper functions, making the system modular
2. **RAG Status Preservation** - Saves the vectorization status (empty/uploaded/ready) so users know what's been processed
3. **Chat History Complete** - Messages include debug info (analysis, RAG results, final prompt) for replay
4. **Delete Confirmation** - Browser confirm() dialog prevents accidental deletion
5. **Success Feedback** - Visual confirmation when save completes before modal closes

### Components Built

| Component | Path | Purpose |
|-----------|------|---------|
| SaveStateButton | `components/state/SaveStateButton.tsx` | Header button + name input modal |
| LoadStateModal | `components/state/LoadStateModal.tsx` | Save list + load/delete actions |

### Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `lib/storage.ts` | ~130 | Save/load/delete/update operations |
| `components/state/SaveStateButton.tsx` | ~150 | Save UI with modal |
| `components/state/LoadStateModal.tsx` | ~180 | Load UI with list |

---

## Performance Considerations

1. **Parallel Extraction** - Phase 1: Extract all 6 sections in parallel with Promise.all ✅
2. **Batch Embeddings** - Phase 2: Embed up to 100 texts per API call ✅
3. **Vector Persistence** - LanceDB persists in `.lancedb/` folder, survives restarts ✅
4. **Sequential Chat Pipeline** - Phase 3: analyze → query → generate must run sequentially
5. **Lazy Loading** - Load tab content only when active

---

## Component Patterns Established

- All interactive components use `'use client'` directive
- Loading states managed in Zustand stores
- Model labels (ModelLabel component) shown on all AI-powered actions
- Error states displayed inline with red background
- Status badges show current state (Empty, Ready, Vectorizing, Vectorized)
- Drag-and-drop file upload with click fallback
