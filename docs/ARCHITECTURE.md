# RepSimulator Technical Architecture

**Last Updated:** January 7, 2026
**Status:** Phase 1-4 Complete | Phase 5 (Supabase Migration) IN PROGRESS

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
│  │  • Data Upload & Cleaning   │    │  • RAG Data Vectorization   │    │
│  │  • System Prompt Generation │───▶│  • Context Inputs           │    │
│  │  • Static Rules Editor      │    │  • Chat Simulation          │    │
│  │  • Final Prompt Assembly    │    │  • Debug Panels             │    │
│  └─────────────────────────────┘    └─────────────────────────────┘    │
│                                                                          │
│  ⚠️  DEPLOYMENT BLOCKED: Migrating LanceDB → Supabase pgvector          │
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
| **State** | Zustand | Lightweight state management | ✅ All stores working |
| **Vector DB** | ~~LanceDB~~ → **Supabase pgvector** | Cloud vector storage | 🔄 MIGRATING |
| **Embeddings** | OpenAI text-embedding-3-small | 1536-dim vectors | ✅ Working |
| **LLM** | Anthropic Claude (Opus/Sonnet/Haiku) | AI generation | ✅ All models working |
| **Deployment** | Vercel | Serverless hosting | ⏳ Waiting for migration |

---

## Vector Database Migration (IN PROGRESS)

### Why Migrating

LanceDB native binaries (~258MB) exceed Vercel's 250MB serverless function limit:
```
node_modules/@lancedb/lancedb-linux-x64-musl   129.07 MB
node_modules/@lancedb/lancedb-linux-x64-gnu    128.87 MB
```

### New Architecture (Supabase)

```
BEFORE (LanceDB - Local):
Chunks → OpenAI Embeddings → LanceDB (.lancedb/ folder)
                                    ↓
                              Local file storage (ephemeral on serverless)

AFTER (Supabase - Cloud):
Chunks → OpenAI Embeddings → Supabase pgvector (PostgreSQL)
                                    ↓
                              Persistent cloud database
```

### Supabase Configuration

- **Project URL:** `https://hxtsyipupfbwrububeta.supabase.co`
- **Credentials:** Stored in `.env.local`
- **Migration Plan:** See `docs/VECTOR-MIGRATION.md`

### Database Schema (To Be Created)

```sql
-- Table for storing vectorized chunks
create table rag_chunks (
  id text primary key,
  text text not null,
  type text not null,           -- docs, case_study, pricing, faq, competitive, website
  topic text,
  embedding vector(1536),       -- OpenAI embedding dimension
  created_at timestamp with time zone default now()
);

-- Vector similarity search index
create index on rag_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
```

---

## Directory Structure

```
MindsSimulator/
├── app/
│   ├── page.tsx                      # Main page with tab navigation
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Tailwind imports
│   └── api/
│       ├── clean/route.ts            # POST: Clean data with Opus
│       ├── generate-prompt/route.ts  # POST: Extract sections with Opus
│       ├── vectorize/route.ts        # POST: Chunk + embed + store
│       ├── query/route.ts            # POST: Vector similarity search
│       ├── analyze/route.ts          # POST: Haiku message analysis
│       └── generate/route.ts         # POST: Sonnet response generation
│
├── components/
│   ├── tabs/
│   │   ├── Tab1BuildPhase.tsx
│   │   └── Tab2RuntimePhase.tsx
│   ├── upload/
│   │   ├── DataUploadZone.tsx
│   │   ├── CleanedFileDisplay.tsx
│   │   └── FileViewModal.tsx
│   ├── prompt/
│   │   ├── SystemPromptGenerator.tsx
│   │   ├── StaticRulesEditor.tsx
│   │   └── FinalPromptDisplay.tsx
│   ├── rag/
│   │   ├── RagUploadZone.tsx
│   │   └── RagSection.tsx
│   ├── chat/
│   │   ├── ChatContainer.tsx         # Orchestrates analyze → query → generate
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ContextInputs.tsx
│   │   └── ExpandableDebug.tsx
│   ├── state/
│   │   ├── SaveStateButton.tsx
│   │   └── LoadStateModal.tsx
│   └── ui/
│       ├── ModelLabel.tsx
│       └── LoadingSpinner.tsx
│
├── lib/
│   ├── anthropic.ts                  # Anthropic client (lazy-init)
│   ├── supabase.ts                   # 🆕 TO CREATE: Supabase client
│   ├── prompts/
│   │   ├── cleaning-prompts.ts
│   │   └── extraction-prompts.ts
│   ├── vectorstore/
│   │   ├── embeddings.ts             # OpenAI embeddings (lazy-init)
│   │   ├── chunk.ts                  # Semantic chunking (unchanged)
│   │   └── index.ts                  # 🔄 TO REPLACE: LanceDB → Supabase
│   └── storage.ts                    # LocalStorage save/load
│
├── store/
│   ├── buildStore.ts                 # Tab 1 state
│   ├── ragStore.ts                   # RAG/vector state
│   └── chatStore.ts                  # Chat state
│
├── docs/
│   ├── PRODUCT-PRD.md
│   ├── ARCHITECTURE.md               # This file
│   ├── BUILDINGPLAN.md
│   ├── HANDOFF.md
│   └── VECTOR-MIGRATION.md           # 🆕 Migration plan
│
├── .env.local                        # API keys + Supabase credentials
├── .env.example
├── CLAUDE.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

---

## Data Flow

### Build Phase Flow (✅ COMPLETE)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Raw Files   │────▶│  /api/clean  │────▶│ Cleaned Data │
│  (6 types)   │     │    [Opus]    │     │    (JSON)    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                     ┌──────────────────────────────────────┐
                     │         /api/generate-prompt         │
                     │              [Opus]                  │
                     │  Extracts 6 sections:                │
                     │  • Identity    • Tone                │
                     │  • ICP         • Objections          │
                     │  • Email       • Competitive         │
                     └──────────────────────────────────────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│Static Rules  │────▶│   Combine    │────▶│   System     │
│(Template +   │     │              │     │   Prompt     │
│ User Rules)  │     └──────────────┘     └──────────────┘
└──────────────┘
```

### RAG Vectorization Flow (🔄 UPDATING)

```
CURRENT (LanceDB):
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  RAG Files   │────▶│   Chunking   │────▶│  Embedding   │────▶│   LanceDB    │
│  (6 types)   │     │  (semantic)  │     │   [OpenAI]   │     │   (local)    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

AFTER MIGRATION (Supabase):
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  RAG Files   │────▶│   Chunking   │────▶│  Embedding   │────▶│  Supabase    │
│  (6 types)   │     │  (semantic)  │     │   [OpenAI]   │     │  pgvector    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

Chunking Strategy by Type (UNCHANGED):
• docs       → By markdown headers (##, ###)
• case_study → By customer story / numbered items
• pricing    → By plan/tier names
• faq        → By Q&A pairs
• competitive→ By competitor sections
• website    → By page sections
```

### Runtime Phase Flow (✅ COMPLETE)

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
│  │      [Haiku]       │  • buying_stage                  │
│  │                    │  • warmth                        │
│  │                    │  • implicit_concerns             │
│  │                    │  • search_queries                │
│  │                    │  • response_strategy             │
│  └────────────────────┘                                  │
│              │                                            │
│              ▼                                            │
│  ┌────────────────────┐                                  │
│  │    /api/query      │  If needs_search: true           │
│  │    [OpenAI]        │  Query via Supabase pgvector     │
│  │                    │  Filter by content_types         │
│  └────────────────────┘                                  │
│              │                                            │
│              ▼                                            │
│  ┌────────────────────────────────────────────┐          │
│  │           PROMPT ASSEMBLY                   │          │
│  │  System Prompt (from Tab 1)                 │          │
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
│  │    [Sonnet]        │  • response text                 │
│  │                    │  • finalPrompt (for debug)       │
│  └────────────────────┘                                  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## API Routes

### POST /api/clean
Cleans raw data using Opus with type-specific prompts.

### POST /api/generate-prompt
Extracts system prompt sections from all cleaned data.

### POST /api/vectorize (🔄 UPDATING)
Chunks and embeds files, stores in Supabase pgvector.

### POST /api/query (🔄 UPDATING)
Queries Supabase pgvector for relevant chunks.

### POST /api/analyze
Analyzes user message with Haiku.

### POST /api/generate
Generates response with Sonnet using assembled prompt.

---

## State Management

### buildStore (Tab 1)
- Raw/cleaned data for 6 data types
- Template and user rules
- Extracted sections and final system prompt
- Loading states

### ragStore (Tab 2 - RAG)
- File contents for 6 RAG types
- Status per type: empty | uploaded | vectorizing | ready
- Chunk counts after vectorization
- Error handling

### chatStore (Tab 2 - Chat)
- Context inputs (system prompt, page URL, additional context)
- Messages with debug info
- Processing step tracking
- Error handling

---

## Model Configuration

```typescript
// lib/anthropic.ts
export const MODELS = {
  OPUS: 'claude-opus-4-20250514',
  SONNET: 'claude-sonnet-4-20250514',
  HAIKU: 'claude-3-haiku-20240307',
};

// lib/vectorstore/embeddings.ts
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;
```

| Task | Model | Reasoning |
|------|-------|-----------|
| Data cleaning | Opus | Quality matters, runs once |
| Prompt extraction | Opus | Quality matters, runs once |
| Embeddings | OpenAI text-embedding-3-small | Industry standard, 1536 dims |
| Message analysis | Haiku | Fast, cheap, classification task |
| Response generation | Sonnet | Balance of quality and cost |

---

## Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...      # Required for Opus/Sonnet/Haiku
OPENAI_API_KEY=sk-...              # Required for embeddings
SUPABASE_URL=https://xxx.supabase.co    # 🆕 Supabase project URL
SUPABASE_SERVICE_KEY=eyJ...             # 🆕 Supabase service role key
```

---

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| **1** | Tab 1 - Build Phase | ✅ COMPLETE |
| **2** | Vector DB (LanceDB) | ✅ COMPLETE |
| **3** | Chat System | ✅ COMPLETE |
| **4** | Save/Load State | ✅ COMPLETE |
| **5** | Supabase Migration | 🔄 IN PROGRESS |
| **6** | Vercel Deployment | ⏳ WAITING |

---

## Key Learnings

1. **Lazy Client Initialization** - API clients (Anthropic, OpenAI) must be lazy-initialized to avoid build-time credential errors on Vercel.

2. **LanceDB Size Issue** - Native bindings (~258MB) exceed Vercel's 250MB limit. Solution: cloud-hosted vector DB (Supabase).

3. **Semantic Chunking** - Type-specific chunking strategies preserve document structure better than character-count splitting.

4. **Debug Visibility** - Exposing Haiku analysis, RAG results, and final prompts is invaluable for iteration.

5. **State Persistence** - LocalStorage works well for saving app state but doesn't persist vector data (need cloud DB for that).

---

## Files Changed in Migration

| File | Action |
|------|--------|
| `lib/supabase.ts` | CREATE - Supabase client |
| `lib/vectorstore/index.ts` | REPLACE - Supabase implementation |
| `package.json` | UPDATE - Remove LanceDB, add Supabase |
| `next.config.mjs` | UPDATE - Remove LanceDB externals |
| `.gitignore` | UPDATE - Remove .lancedb |
| `.env.local` | UPDATE - Add Supabase credentials |

See `docs/VECTOR-MIGRATION.md` for complete migration plan.
