# Changelog

All notable changes to RepSimulator are documented here.

---

## [Unreleased] - Pending Vercel Deployment

### Deployment Status
- Code pushed to GitHub: https://github.com/zssai13/MindsSimulator.git
- Awaiting Vercel deployment
- Supabase SQL setup required before first use

---

## [0.7.0] - 2026-01-07

### Phase 7: Tab 2 RAG Update + Rate Limit Fix

**Goal:** Align Tab 2 RAG types with Tab 1 data types and fix API rate limit issues.

**Rationale:** Users will re-upload the same cleaned .md files from Tab 1 into Tab 2 for vectorization. Simplifies workflow and ensures consistency.

### Changed - RAG Types
- `lib/vectorstore/chunk.ts` - Updated RagType from 6 → 4 types, simplified to single markdown-based chunking
- `lib/vectorstore/index.ts` - Updated getCountByType for 4 types
- `store/ragStore.ts` - Updated state, config, and UI labels for 4 types
- `app/api/analyze/route.ts` - Updated Haiku prompt with new content_types
- `components/chat/ChatContainer.tsx` - Removed contentTypes filter (now searches ALL types)
- `components/state/LoadStateModal.tsx` - Added backward compatibility for old 6-type saves

### RAG Types
```typescript
// BEFORE (6 types)
type RagType = 'docs' | 'case_study' | 'pricing' | 'faq' | 'competitive' | 'website';

// AFTER (4 types - matches Tab 1)
type RagType = 'transcripts' | 'tickets' | 'website' | 'research';
```

### Changed - Rate Limit Fix
- `app/api/generate-prompt/route.ts` - Changed from parallel to sequential API calls with 1s delay

**Problem:** 6 parallel Opus API calls exceeded 30,000 token/minute rate limit
**Solution:** Process sections sequentially with delays between calls

### Chunking Strategy
- Simplified from 6 type-specific chunkers to single markdown-based strategy
- All content now split by `##` headers with paragraph fallback
- More maintainable and consistent

### Search Behavior
- Now searches ALL 4 types for every query (no filtering)
- Increased limit from 5 to 8 results for better coverage

### Documentation
- Added `docs/RAG-UPDATE.md` - Implementation plan and summary

---

## [0.6.0] - 2026-01-07

### Phase 6: Tab 1 Simplification - Remove Data Cleaning

**Goal:** Remove the Opus data cleaning step from Tab 1. Users now upload pre-cleaned Markdown files directly.

**Rationale:** Data cleaning will happen outside the app using external tools. Users prepare clean MD files and upload them directly to continue with system prompt generation.

### Removed
- `app/api/clean/route.ts` - Data cleaning API endpoint
- `lib/prompts/cleaning-prompts.ts` - Cleaning prompts for 6 data types
- `rawData` state from buildStore (no longer needed)
- `cleaningInProgress` state from buildStore
- "Clean with Opus" button and flow
- 2 data types: `docs` and `email-guide`

### Changed
- `store/buildStore.ts` - Simplified to 4 data types, removed rawData/cleaningInProgress
- `lib/storage.ts` - Removed rawData from SavedState schema
- `app/api/generate-prompt/route.ts` - Updated CleanedData interface to 4 types
- `components/upload/DataUploadZone.tsx` - Simplified to direct upload (no cleaning)
- `components/upload/CleanedFileDisplay.tsx` - Updated to 4 types, .md download format
- `components/upload/FileViewModal.tsx` - Updated type labels
- `components/tabs/Tab1BuildPhase.tsx` - Reduced to 4 upload zones
- `components/state/SaveStateButton.tsx` - Removed rawData from saved state
- `components/state/LoadStateModal.tsx` - Updated restore logic with backward compatibility

### Data Types
```typescript
// BEFORE (6 types)
type DataType = 'transcripts' | 'tickets' | 'website' | 'docs' | 'research' | 'email-guide';

// AFTER (4 types)
type DataType = 'transcripts' | 'tickets' | 'website' | 'research';
```

### New Tab 1 Flow
```
BEFORE: Raw File → Upload → [Opus Clean] → Cleaned Data → Generate Prompt
AFTER:  Pre-cleaned .md File → Upload → Generate Prompt
```

### Backward Compatibility
- Old saved states with 6 types load gracefully (only 4 types restored)
- Missing fields handled with optional chaining

### Documentation
- Added `docs/CLEANED.md` - Implementation plan and summary

---

## [0.5.0] - 2026-01-07

### Phase 5: Supabase pgvector Migration

**Problem Solved:** LanceDB native binaries (~258MB) exceeded Vercel's 250MB serverless function limit, blocking deployment.

**Solution:** Migrated to Supabase pgvector - a cloud-hosted PostgreSQL with vector extensions.

### Added
- `lib/supabase.ts` - Lazy-initialized Supabase client
- Supabase pgvector for persistent cloud vector storage
- `docs/VECTOR-MIGRATION.md` - Complete migration documentation

### Changed
- `lib/vectorstore/index.ts` - Replaced LanceDB with Supabase implementation
- `package.json` - Swapped `@lancedb/lancedb` for `@supabase/supabase-js`
- `next.config.mjs` - Removed LanceDB-specific webpack config
- `.gitignore` - Removed `.lancedb/` entry
- `.env.example` - Added Supabase credential placeholders

### Removed
- `@lancedb/lancedb` dependency (~258MB of native binaries)
- LanceDB webpack externals configuration
- Local `.lancedb/` folder requirement

### Benefits
- Vercel deployment now possible (function size < 250MB)
- Vector data persists across serverless invocations
- No ephemeral storage issues
- Free tier: 500MB storage (~70k chunks)

### Migration Notes
- Supabase SQL setup required (see `docs/VECTOR-MIGRATION.md`)
- Environment variables needed: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- API interface unchanged - drop-in replacement

---

## [0.4.0] - 2026-01-07

### Phase 4: Save/Load State

**Goal:** User can save complete app state and reload it later.

### Added
- `lib/storage.ts` - LocalStorage save/load/delete operations
- `components/state/SaveStateButton.tsx` - Save button with name modal
- `components/state/LoadStateModal.tsx` - List saves, load, delete
- Save/Load buttons in app header

### Features
- Save captures all Tab 1 state (raw data, cleaned data, system prompt)
- Save captures all Tab 2 state (RAG files, chat messages, context)
- Named saves with timestamps
- Multiple saves supported
- State survives browser refresh

### Limitations
- Vector embeddings not saved (stored in cloud DB)
- After loading, may need to re-vectorize if vector DB was cleared

---

## [0.3.0] - 2026-01-06

### Phase 3: Chat System

**Goal:** Full chat simulation with Haiku analysis, RAG retrieval, Sonnet generation, and debug visibility.

### Added
- `store/chatStore.ts` - Chat state management
- `app/api/analyze/route.ts` - Haiku message analysis endpoint
- `app/api/generate/route.ts` - Sonnet response generation endpoint
- `components/chat/ChatContainer.tsx` - Orchestrates the full pipeline
- `components/chat/ChatMessage.tsx` - Message display component
- `components/chat/ChatInput.tsx` - User input component
- `components/chat/ContextInputs.tsx` - System prompt, URL, context inputs
- `components/chat/ExpandableDebug.tsx` - Collapsible debug panel with 3 tabs

### Features
- System prompt auto-loads from Tab 1
- Haiku analyzes each message (buying stage, warmth, concerns, queries)
- RAG retrieval based on Haiku's search queries
- Sonnet generates response using full context
- Debug panel shows: Analysis, RAG Results, Final Prompt
- Model labels visible for each step
- Reset Chat clears messages but preserves context

---

## [0.2.0] - 2026-01-05

### Phase 2: Vector Database (LanceDB)

**Goal:** User can upload RAG content, vectorize it, and query it.

### Added
- `lib/vectorstore/embeddings.ts` - OpenAI embeddings with batch support
- `lib/vectorstore/chunk.ts` - Semantic chunking by content type
- `lib/vectorstore/index.ts` - LanceDB operations (later replaced)
- `store/ragStore.ts` - RAG state management
- `app/api/vectorize/route.ts` - Vectorization endpoint
- `app/api/query/route.ts` - Vector search endpoint
- `components/rag/RagUploadZone.tsx` - File upload for RAG
- `components/rag/RagSection.tsx` - RAG management UI

### Features
- 6 RAG content types: docs, case_study, pricing, faq, competitive, website
- Semantic chunking strategies per content type
- Batch embeddings (100 texts per API call)
- Type-filtered vector search
- Status indicators: Empty → Uploaded → Vectorizing → Ready

### Technical Notes
- LanceDB required `serverComponentsExternalPackages` config
- OpenAI text-embedding-3-small (1536 dimensions)

---

## [0.1.0] - 2026-01-04

### Phase 1: Build Phase UI

**Goal:** User can upload data, clean it with Opus, generate a system prompt, add rules, and export.

### Added
- `components/upload/DataUploadZone.tsx` - File upload for 6 data types
- `components/upload/CleanedFileDisplay.tsx` - Display cleaned files
- `components/upload/FileViewModal.tsx` - View file contents
- `components/prompt/StaticRulesEditor.tsx` - Template and user rules
- `components/prompt/SystemPromptGenerator.tsx` - Generate prompt from data
- `components/prompt/FinalPromptDisplay.tsx` - Combined prompt display
- `components/tabs/Tab1BuildPhase.tsx` - Tab 1 container
- `app/api/clean/route.ts` - Data cleaning with Opus
- `app/api/generate-prompt/route.ts` - Prompt extraction with Opus
- `store/buildStore.ts` - Tab 1 state management
- `lib/anthropic.ts` - Anthropic client with lazy initialization
- `lib/prompts/cleaning-prompts.ts` - Type-specific cleaning prompts
- `lib/prompts/extraction-prompts.ts` - Section extraction prompts
- `components/ui/ModelLabel.tsx` - AI model indicator
- `components/ui/LoadingSpinner.tsx` - Loading indicator

### Features
- Upload 6 data types: transcripts, tickets, website, docs, research, email-guide
- Clean data with Opus (type-specific prompts)
- Generate system prompt extracting 6 sections
- Static rules editor with default template
- User "Never Do" rules
- Copy to clipboard, download as markdown
- Send system prompt to Tab 2

---

## [0.0.1] - 2026-01-03

### Initial Setup

### Added
- Next.js 14 with App Router
- TypeScript configuration
- Tailwind CSS styling
- Zustand state management
- Project structure and documentation
- `CLAUDE.md` for AI assistant context
- `docs/PRODUCT-PRD.md` - Product requirements
- `docs/ARCHITECTURE.md` - Technical architecture
- `docs/BUILDINGPLAN.md` - Development phases
- `docs/HANDOFF.md` - Session handoff notes

---

## Git Commits Reference

| Hash | Date | Description |
|------|------|-------------|
| `5c089ce` | 2026-01-07 | Migrate from LanceDB to Supabase pgvector |
| `4d8b4d8` | 2026-01-07 | Update docs for Supabase migration - session handoff |
| `715ac9a` | 2026-01-07 | Add Supabase pgvector migration plan |
| `52c4cf9` | 2026-01-07 | Fix build-time API client initialization |
| `733f8ea` | 2026-01-07 | Fix TypeScript build error in LoadStateModal |
| `3a5424b` | 2026-01-07 | Initial commit: RepSimulator Testing App |

---

## Deployment Checklist

### Supabase Setup (Required)
- [ ] Create Supabase project
- [ ] Enable pgvector extension
- [ ] Create `rag_chunks` table
- [ ] Create `match_chunks` function
- [ ] Create `clear_all_chunks` function

### Vercel Setup
- [ ] Connect GitHub repository
- [ ] Add environment variables:
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
- [ ] Deploy

### Post-Deployment Testing
- [ ] Tab 1: Upload → Clean → Generate works
- [ ] Tab 2: Vectorize → Query works
- [ ] Tab 2: Chat → Full pipeline works
- [ ] Save/Load state works
