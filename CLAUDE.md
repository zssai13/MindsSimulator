# RepSimulator - AI Assistant Context

## Context Management

**IMPORTANT:** When approaching 70% context usage, pause and suggest we manually `/compact` with specific preservation instructions before continuing. Include in the suggestion:
- Current task in progress
- Key files being modified
- Any state that needs to be preserved
- Next steps to resume after compacting

---

## Quick Start for New Sessions

**Read these documents in order before starting work:**

1. `docs/PRODUCT-PRD.md` - Understand WHAT we're building and WHY
2. `docs/ARCHITECTURE.md` - Understand HOW it's built technically
3. `docs/BUILDINGPLAN.md` - Understand the FULL PLAN (6 phases complete)
4. `docs/HANDOFF.md` - Understand WHERE we are and what's next

---

## Project Summary

RepSimulator is a testing app for AI sales reps. It has two tabs:
- **Tab 1 (Build Phase):** Upload pre-cleaned .md files → Generate system prompt with Opus
- **Tab 2 (Runtime Phase):** Vectorize RAG data → Chat simulation with Haiku/RAG/Sonnet pipeline

The app exposes every step of the AI pipeline for debugging and iteration.

**Note:** Data cleaning was removed in Phase 6. Users now upload pre-cleaned markdown files directly.

---

## Current Status

**All Phases COMPLETE - Ready for Vercel Deployment**

**Phase 1 (Tab 1 - Build): COMPLETE**
- Upload pre-cleaned .md files (4 types: transcripts, tickets, website, research)
- Generate system prompt with Opus
- Static rules editor

**Phase 2 (Vector DB): COMPLETE**
- Supabase pgvector for cloud vector storage
- Semantic chunking by 6 content types
- OpenAI embeddings with batch support

**Phase 3 (Chat System): COMPLETE**
- Full Haiku → RAG → Sonnet pipeline working
- Chat UI with collapsible debug panels

**Phase 4 (Save/Load): COMPLETE**
- LocalStorage save/load for all state

**Phase 5 (Supabase Migration): COMPLETE**
- Migrated from LanceDB to Supabase pgvector

**Phase 6 (Tab 1 Simplification): COMPLETE**
- Removed Opus data cleaning step
- Reduced data types from 6 to 4
- Users upload pre-cleaned .md files directly

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main page with tab navigation |
| `store/buildStore.ts` | Tab 1 state management (4 data types) |
| `store/ragStore.ts` | RAG/vector state management |
| `store/chatStore.ts` | Chat state management |
| `lib/anthropic.ts` | Anthropic client + model constants |
| `lib/supabase.ts` | Supabase pgvector client |
| `lib/vectorstore/index.ts` | Vector operations |
| `app/api/generate-prompt/route.ts` | Opus prompt extraction |
| `app/api/analyze/route.ts` | Haiku message analysis |
| `app/api/generate/route.ts` | Sonnet response generation |
| `components/chat/ChatContainer.tsx` | Chat orchestration |

---

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Tab 1 - Build Phase | ✅ Complete |
| 2 | Vector DB (Supabase) | ✅ Complete |
| 3 | Chat System | ✅ Complete |
| 4 | Save/Load State | ✅ Complete |
| 5 | Supabase Migration | ✅ Complete |
| 6 | Tab 1 Simplification | ✅ Complete |
| 7 | Vercel Deployment | ⏳ Ready |

---

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build
npm run build        # Production build (verify no errors)

# Lint
npm run lint         # ESLint check
```

---

## API Keys

Before running AI features, ensure `.env.local` has:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
```

---

## Architecture Quick Reference

### Build Phase (Tab 1) - Simplified
```
Pre-cleaned .md Files (4 types)
        ↓
[Opus Extract] → Sections
        ↓
+ Static Rules → System Prompt
```

### Runtime Phase (Tab 2)
```
Message → [Haiku Analyze] → Analysis
                              ↓
                    [OpenAI Query] → RAG Chunks
                              ↓
System Prompt + Analysis + Chunks + History
                              ↓
                    [Sonnet Generate] → Response
```

### Models Used
| Step | Model |
|------|-------|
| Prompt extraction | Opus |
| Message analysis | Haiku |
| Embeddings | OpenAI text-embedding-3-small |
| Response generation | Sonnet |

---

## Data Types

```typescript
// For Tab 1 uploads (4 types - simplified in Phase 6)
type DataType = 'transcripts' | 'tickets' | 'website' | 'research';

// For RAG (Tab 2) - unchanged
type RagType = 'docs' | 'case_study' | 'pricing' | 'faq' | 'competitive' | 'website';
```

---

## What to Build Next

See `docs/HANDOFF.md` for deployment instructions.

**Immediate next steps:**
1. Run Supabase SQL setup
2. Configure Vercel environment variables
3. Deploy to Vercel
4. Test end-to-end with real data

---

## Conventions

- **Model labels**: Always show which AI model is being used (ModelLabel component)
- **Loading states**: Use LoadingSpinner during API calls
- **State**: Use Zustand stores, update immediately after operations
- **API routes**: Return `{ data, model }` format for consistency
- **Components**: Use 'use client' directive for interactive components

---

## Key Documentation

| Document | Purpose |
|----------|---------|
| `docs/HANDOFF.md` | Current status and next steps |
| `docs/ARCHITECTURE.md` | Technical architecture |
| `docs/BUILDINGPLAN.md` | Development phases |
| `docs/CHANGELOG.md` | Version history |
| `docs/CLEANED.md` | Phase 6 implementation details |
| `docs/VECTOR-MIGRATION.md` | Supabase migration plan |
