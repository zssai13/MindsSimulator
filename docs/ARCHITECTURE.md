# RepSimulator Technical Architecture

**Last Updated:** January 8, 2026
**Status:** Phase 1-8 Complete + Role Preamble | Ready for Vercel Deployment

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
│  │  • Data Upload (4 types)    │    │  • RAG Data Vectorization   │    │
│  │  • System Prompt Generation │───▶│  • Static Rules Editor      │    │
│  │  • Extracted Sections View  │    │  • Context Inputs           │    │
│  │                             │    │  • Chat Simulation          │    │
│  │                             │    │  • Debug Panels             │    │
│  └─────────────────────────────┘    └─────────────────────────────┘    │
│                                                                          │
│  ✅ Supabase pgvector migration complete - Ready for Vercel deployment  │
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
| **Vector DB** | Supabase pgvector | Cloud vector storage | ✅ Complete |
| **Embeddings** | OpenAI text-embedding-3-small | 1536-dim vectors | ✅ Working |
| **LLM** | Anthropic Claude (Opus/Sonnet/Haiku) | AI generation | ✅ All models working |
| **Deployment** | Vercel | Serverless hosting | ⏳ Ready to deploy |

---

## Vector Database Migration (COMPLETE)

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

### Database Schema

```sql
-- Table for storing vectorized chunks
create table rag_chunks (
  id text primary key,
  text text not null,
  type text not null,           -- transcripts, tickets, website, research
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
│   ├── supabase.ts                   # Supabase client (lazy-init)
│   ├── prompts/
│   │   └── extraction-prompts.ts     # System prompt section extraction
│   ├── vectorstore/
│   │   ├── embeddings.ts             # OpenAI embeddings (lazy-init)
│   │   ├── chunk.ts                  # Semantic chunking by content type
│   │   └── index.ts                  # Supabase pgvector operations
│   └── storage.ts                    # LocalStorage save/load
│
├── store/
│   ├── buildStore.ts                 # Tab 1 state
│   ├── ragStore.ts                   # RAG/vector state
│   └── chatStore.ts                  # Chat state
│
├── docs/
│   ├── PRODUCT-PRD.md                # Product requirements
│   ├── ARCHITECTURE.md               # This file - technical architecture
│   ├── BUILDINGPLAN.md               # Development phases and progress
│   ├── HANDOFF.md                    # Session handoff notes
│   ├── CHANGELOG.md                  # Version history
│   ├── VECTOR-MIGRATION.md           # LanceDB → Supabase migration plan
│   ├── MIND-MODE-VISUAL-GUIDE.md     # Visual diagrams of Mind Mode process
│   └── MIND-MODE-IMPLEMENTATION-GUIDE.md  # Deep technical reference
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

### Build Phase Flow (✅ COMPLETE - Simplified in Phase 6 & 8)

```
┌──────────────────┐     ┌──────────────────────────────────────┐
│  Pre-cleaned     │     │         /api/generate-prompt         │
│  .md Files       │────▶│              [Opus]                  │
│  (4 types)       │     │  Extracts 6 sections:                │
│                  │     │  • Identity    • Tone                │
│  • transcripts   │     │  • ICP         • Objections          │
│  • tickets       │     │  • Email       • Competitive         │
│  • website       │     └──────────────────────────────────────┘
│  • research      │                       │
└──────────────────┘                       ▼
                                   ┌──────────────┐
                                   │   System     │
                                   │   Prompt     │
                                   │ (extracted   │
                                   │  sections)   │
                                   └──────────────┘

Notes:
- Data cleaning removed in Phase 6. Users upload pre-cleaned markdown files directly.
- Static rules moved to Tab 2 in Phase 8. System prompt now contains extracted sections only.
```

### RAG Vectorization Flow (✅ COMPLETE - Updated in Phase 7)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  RAG Files   │────▶│   Chunking   │────▶│  Embedding   │────▶│  Supabase    │
│  (4 types)   │     │  (markdown)  │     │   [OpenAI]   │     │  pgvector    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

RAG Types (matches Tab 1):
• transcripts → Sales call insights
• tickets     → Support ticket summaries
• website     → Marketing and website copy
• research    → Market research, ICP, competitive

Chunking Strategy (Unified):
• All types use markdown-based chunking (split by ## headers)
• Fallback to paragraph-based chunking if no headers found
```

### Runtime Phase Flow (✅ COMPLETE - Updated in Phase 8)

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
│  │                    │  Search ALL 4 types (no filter)  │
│  └────────────────────┘                                  │
│              │                                            │
│              ▼                                            │
│  ┌────────────────────────────────────────────┐          │
│  │           PROMPT ASSEMBLY                   │          │
│  │  0. Role Preamble (fixed, hardcoded)        │          │
│  │  1. System Prompt (from Tab 1)              │          │
│  │  2. Static Rules (template) ← Phase 8       │          │
│  │  3. Never Do Rules ← Phase 8                │          │
│  │  4. Additional Context                      │          │
│  │  5. Haiku Analysis                          │          │
│  │  6. Retrieved Knowledge (<knowledge> tags)  │          │
│  │  7. Response Instructions                   │          │
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

### POST /api/generate-prompt
Extracts system prompt sections from uploaded data using Opus.

### POST /api/vectorize
Chunks and embeds files, stores in Supabase pgvector.

### POST /api/query
Queries Supabase pgvector for relevant chunks.

### POST /api/analyze
Analyzes user message with Haiku.

### POST /api/generate
Generates response with Sonnet using assembled prompt.

---

## State Management

### buildStore (Tab 1)
- Uploaded data for 4 data types (transcripts, tickets, website, research)
- Extracted sections and final system prompt
- Loading states
- Note: Rules moved to chatStore in Phase 8

### ragStore (Tab 2 - RAG)
- File contents for 4 RAG types (transcripts, tickets, website, research)
- Status per type: empty | uploaded | vectorizing | ready
- Chunk counts after vectorization
- Error handling

### chatStore (Tab 2 - Chat)
- Context inputs (system prompt, page URL, additional context)
- Template rules and user "Never Do" rules (moved from buildStore in Phase 8)
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
| **5** | Supabase Migration | ✅ COMPLETE |
| **6** | Tab 1 Simplification (Remove Cleaning) | ✅ COMPLETE |
| **7** | Tab 2 RAG Update + Rate Limit Fix | ✅ COMPLETE |
| **8** | Move Static Rules to Tab 2 | ✅ COMPLETE |
| **9** | Vercel Deployment | ⏳ READY |

---

## Key Learnings

1. **Lazy Client Initialization** - API clients (Anthropic, OpenAI) must be lazy-initialized to avoid build-time credential errors on Vercel.

2. **LanceDB Size Issue** - Native bindings (~258MB) exceed Vercel's 250MB limit. Solution: cloud-hosted vector DB (Supabase).

3. **Semantic Chunking** - Type-specific chunking strategies preserve document structure better than character-count splitting.

4. **Debug Visibility** - Exposing Haiku analysis, RAG results, and final prompts is invaluable for iteration.

5. **State Persistence** - LocalStorage works well for saving app state but doesn't persist vector data (need cloud DB for that).

6. **External Data Cleaning** - Separating data cleaning from the app allows more flexibility. Users can use specialized tools for cleaning and upload pre-processed files.

7. **API Rate Limits** - Parallel API calls can exceed token/minute limits. Sequential processing with delays is safer for large payloads.

---

## Files Changed in Phase 5 (Supabase Migration)

| File | Action |
|------|--------|
| `lib/supabase.ts` | CREATE - Supabase client |
| `lib/vectorstore/index.ts` | REPLACE - Supabase implementation |
| `package.json` | UPDATE - Remove LanceDB, add Supabase |
| `next.config.mjs` | UPDATE - Remove LanceDB externals |
| `.gitignore` | UPDATE - Remove .lancedb |
| `.env.local` | UPDATE - Add Supabase credentials |

See `docs/VECTOR-MIGRATION.md` for complete migration plan.

---

## Files Changed in Phase 6 (Tab 1 Simplification)

| File | Action |
|------|--------|
| `app/api/clean/route.ts` | DELETE - Cleaning API removed |
| `lib/prompts/cleaning-prompts.ts` | DELETE - Cleaning prompts removed |
| `store/buildStore.ts` | UPDATE - Remove rawData, cleaningInProgress; reduce to 4 types |
| `lib/storage.ts` | UPDATE - Remove rawData from SavedState |
| `app/api/generate-prompt/route.ts` | UPDATE - CleanedData interface to 4 types |
| `components/upload/DataUploadZone.tsx` | UPDATE - Simplified to direct upload |
| `components/upload/CleanedFileDisplay.tsx` | UPDATE - 4 types, .md download |
| `components/upload/FileViewModal.tsx` | UPDATE - 4 type labels |
| `components/tabs/Tab1BuildPhase.tsx` | UPDATE - 4 upload zones |
| `components/state/SaveStateButton.tsx` | UPDATE - Remove rawData |
| `components/state/LoadStateModal.tsx` | UPDATE - Backward compatibility |

See `docs/CLEANED.md` for complete implementation plan.

---

## Files Changed in Phase 7 (Tab 2 RAG Update)

| File | Action |
|------|--------|
| `lib/vectorstore/chunk.ts` | UPDATE - 4 RAG types, unified markdown chunking |
| `lib/vectorstore/index.ts` | UPDATE - getCountByType for 4 types |
| `store/ragStore.ts` | UPDATE - State, config, UI labels for 4 types |
| `app/api/analyze/route.ts` | UPDATE - Haiku prompt content_types |
| `app/api/generate-prompt/route.ts` | UPDATE - Sequential API calls (rate limit fix) |
| `components/chat/ChatContainer.tsx` | UPDATE - Search all types, no filtering |
| `components/state/LoadStateModal.tsx` | UPDATE - Backward compatibility for 6-type saves |

See `docs/RAG-UPDATE.md` for complete implementation plan.

---

## Files Changed in Phase 8 (Move Static Rules to Tab 2)

| File | Action |
|------|--------|
| `store/chatStore.ts` | UPDATE - Added templateRules, userRules, DEFAULT_TEMPLATE_RULES |
| `store/buildStore.ts` | UPDATE - Removed templateRules, userRules |
| `components/chat/ContextInputs.tsx` | UPDATE - Added collapsible rules editor UI |
| `components/tabs/Tab1BuildPhase.tsx` | UPDATE - Removed StaticRulesEditor import |
| `components/prompt/StaticRulesEditor.tsx` | DELETE - No longer needed in Tab 1 |
| `components/prompt/FinalPromptDisplay.tsx` | UPDATE - Simplified titles |
| `components/prompt/SystemPromptGenerator.tsx` | UPDATE - Removed rules from API call |
| `app/api/generate-prompt/route.ts` | UPDATE - Removed rules from prompt assembly |
| `app/api/generate/route.ts` | UPDATE - Combines rules with prompt at chat time |
| `components/chat/ChatContainer.tsx` | UPDATE - Pass rules to generate API |
| `lib/storage.ts` | UPDATE - Moved rules from build to chat in SavedState |
| `components/state/SaveStateButton.tsx` | UPDATE - Save rules in chat section |
| `components/state/LoadStateModal.tsx` | UPDATE - Backward compat for old saves |

### Architecture Change
```
BEFORE:
Tab 1: Upload → Generate Prompt → Add Rules → Final Combined Prompt
Tab 2: Receive combined prompt → Chat

AFTER:
Tab 1: Upload → Generate Prompt (extracted sections only)
Tab 2: Receive prompt + Edit Rules here → Combined at chat time
```

### Benefits
- Rules are editable during testing without going back to Tab 1
- Separates "what AI knows" (Tab 1) from "how AI behaves" (Tab 2)
- Faster iteration during testing
- Cleaner separation of build-time vs runtime concerns

---

## Role Preamble (Post-Phase 8 Enhancement)

A fixed role preamble was added to ensure the AI always knows its fundamental role as a sales rep responding to cold email replies.

### Location
`app/api/generate/route.ts` - `ROLE_PREAMBLE` constant

### Content
```
You are a sales representative responding to a prospect who has replied
to a cold outreach email you previously sent. Your goal is to continue
this conversation naturally and move them toward a sale while being
genuinely helpful - not pushy.

The prospect received an initial email from you and has now replied.
You are continuing that conversation. Use the context below to understand
who you represent, how to communicate, and what knowledge you have
access to.
```

### Why Hardcoded?
- Ensures Sonnet always knows its fundamental role
- Can't be accidentally removed or modified
- Sets the right frame before any other context
- Appears first in every prompt assembly

---

## Documentation Reference

| Document | Purpose |
|----------|---------|
| `MIND-MODE-VISUAL-GUIDE.md` | Visual ASCII diagrams of the entire Mind Mode process with all prompts |
| `MIND-MODE-IMPLEMENTATION-GUIDE.md` | Deep technical reference for developers - all prompts, data structures, model rationale |
| `PRODUCT-PRD.md` | Product requirements and user stories |
| `ARCHITECTURE.md` | Technical architecture (this file) |
| `BUILDINGPLAN.md` | Development phases and task breakdown |
| `HANDOFF.md` | Session handoff notes and quick start |
| `CHANGELOG.md` | Version history |
