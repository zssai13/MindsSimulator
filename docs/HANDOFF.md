# RepSimulator Development Handoff

**Last Updated:** January 8, 2026
**Status:** All 8 Phases Complete + Role Preamble + Documentation | Ready for Vercel Deployment
**GitHub:** https://github.com/zssai13/MindsSimulator.git

---

## Quick Start for New Claude Session

### 1. Read These Documents First
1. `CLAUDE.md` - AI assistant context and instructions
2. `docs/ARCHITECTURE.md` - Technical architecture
3. `docs/BUILDINGPLAN.md` - Development phases (all complete)
4. `docs/CHANGELOG.md` - Version history
5. `docs/MIND-MODE-IMPLEMENTATION-GUIDE.md` - **Deep technical reference** (all prompts, data structures)
6. `docs/MIND-MODE-VISUAL-GUIDE.md` - Visual diagrams of Mind Mode process
7. This file - Current status

### 2. Key Commands
```bash
cd MindsSimulator
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Check for issues
```

### 3. Current State
- All code complete and working
- Build passes with no errors
- Phase 6 (Tab 1 Simplification) complete
- Phase 7 (Tab 2 RAG Update + Rate Limit Fix) complete
- Phase 8 (Move Static Rules to Tab 2) complete
- Role Preamble added (ensures AI always knows it's a sales rep)
- Comprehensive documentation created (visual guide + implementation guide)
- Awaiting Vercel deployment

---

## Development Progress

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT PROGRESS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PHASE 1        ████████████████████████████████████████  100%      │
│  (Tab 1 Build)  ✅ COMPLETE                                          │
│                                                                      │
│  PHASE 2        ████████████████████████████████████████  100%      │
│  (Vector DB)    ✅ COMPLETE (Supabase pgvector)                      │
│                                                                      │
│  PHASE 3        ████████████████████████████████████████  100%      │
│  (Chat System)  ✅ COMPLETE                                          │
│                                                                      │
│  PHASE 4        ████████████████████████████████████████  100%      │
│  (Save/Load)    ✅ COMPLETE                                          │
│                                                                      │
│  PHASE 5        ████████████████████████████████████████  100%      │
│  (Supabase)     ✅ COMPLETE - Migration done, build verified         │
│                                                                      │
│  PHASE 6        ████████████████████████████████████████  100%      │
│  (Tab 1 Simple) ✅ COMPLETE - Cleaning removed, 4 data types         │
│                                                                      │
│  PHASE 7        ████████████████████████████████████████  100%      │
│  (Tab 2 RAG)    ✅ COMPLETE - RAG types aligned, rate limit fixed    │
│                                                                      │
│  PHASE 8        ████████████████████████████████████████  100%      │
│  (Rules→Tab2)   ✅ COMPLETE - Static rules moved to Tab 2            │
│                                                                      │
│  DEPLOYMENT     ████████████████████████████████████████  READY     │
│  (Vercel)       ⏳ SQL setup needed, then deploy                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What Changed in Phase 6

**Goal:** Remove Opus data cleaning from Tab 1. Users now upload pre-cleaned .md files directly.

### Summary
- Removed `/api/clean` endpoint and cleaning prompts
- Reduced data types from 6 to 4
- Simplified DataUploadZone to direct upload (no cleaning button)
- Tab 1 flow: Upload .md → Generate Prompt (no cleaning step)

### Data Types (New)
```typescript
type DataType = 'transcripts' | 'tickets' | 'website' | 'research';
// Removed: 'docs', 'email-guide'
```

### Files Changed
See `docs/CLEANED.md` for complete implementation details.

---

## Deployment Instructions

### Step 1: Supabase SQL Setup (Required)

Go to https://hxtsyipupfbwrububeta.supabase.co → **SQL Editor** and run:

```sql
-- Enable pgvector
create extension if not exists vector;

-- Create table
create table rag_chunks (
  id text primary key,
  text text not null,
  type text not null,
  topic text,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create indexes
create index on rag_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on rag_chunks (type);

-- Create search function
create or replace function match_chunks (
  query_embedding vector(1536),
  match_count int default 5,
  filter_types text[] default null
)
returns table (id text, text text, type text, topic text, similarity float)
language plpgsql as $$
begin
  return query
  select rag_chunks.id, rag_chunks.text, rag_chunks.type, rag_chunks.topic,
    1 - (rag_chunks.embedding <=> query_embedding) as similarity
  from rag_chunks
  where filter_types is null or rag_chunks.type = any(filter_types)
  order by rag_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create clear function
create or replace function clear_all_chunks() returns void
language plpgsql as $$
begin delete from rag_chunks; end;
$$;
```

### Step 2: Vercel Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (from .env.local) |
| `OPENAI_API_KEY` | `sk-proj-...` (from .env.local) |
| `SUPABASE_URL` | `https://hxtsyipupfbwrububeta.supabase.co` |
| `SUPABASE_SERVICE_KEY` | (from .env.local) |

### Step 3: Deploy

Connect GitHub repo to Vercel and deploy, or:
```bash
npx vercel --prod
```

---

## Key Files Reference

| Purpose | File |
|---------|------|
| Main page | `app/page.tsx` |
| Build state | `store/buildStore.ts` |
| RAG state | `store/ragStore.ts` |
| Chat state | `store/chatStore.ts` |
| Supabase client | `lib/supabase.ts` |
| Vector operations | `lib/vectorstore/index.ts` |
| Tab 1 layout | `components/tabs/Tab1BuildPhase.tsx` |
| Tab 2 layout | `components/tabs/Tab2RuntimePhase.tsx` |
| Chat orchestration | `components/chat/ChatContainer.tsx` |

---

## Architecture Summary

```
BUILD PHASE (Tab 1) - Simplified in Phase 6 & 8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pre-cleaned .md Files → [Opus] → System Prompt (extracted sections only)
  (4 types)

RUNTIME PHASE (Tab 2) - Updated in Phase 8 + Role Preamble
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Message → [Haiku] → Analysis
                      ↓
              [OpenAI] → RAG Query (Supabase pgvector)
                      ↓
         PROMPT ASSEMBLY (in order):
         0. Role Preamble (fixed) ← "You are a sales rep..."
         1. System Prompt (from Tab 1)
         2. Static Rules (template)
         3. Never Do Rules
         4. Additional Context
         5. Haiku Analysis
         6. Knowledge Chunks
         7. Response Instructions
                      ↓
              [Sonnet] → Response
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Vector DB | Supabase pgvector |
| Embeddings | OpenAI text-embedding-3-small |
| LLM | Anthropic Claude (Opus, Sonnet, Haiku) |
| Deployment | Vercel |

---

## Testing After Deployment

1. **Tab 1 Test:** Upload .md file → Generate prompt (no cleaning step)
2. **Tab 2 Test:** Upload RAG content → Vectorize → Chat
3. **Chat Test:** Send message → See Haiku analysis → See RAG results → Get Sonnet response
4. **Save/Load Test:** Save state → Reload page → Load state

---

## Next Steps (Post-Deployment)

1. End-to-end testing with real data
2. Performance monitoring
3. Consider future enhancements (see BUILDINGPLAN.md)
4. User feedback collection

---

## What Changed in Phase 8

**Goal:** Move static rules from Tab 1 to Tab 2 for faster iteration during testing.

### Summary
- Static rules (template + "Never Do") now edited in Tab 2
- Tab 1 system prompt contains only extracted sections
- Rules combined with system prompt at chat time in `/api/generate`
- Separates "what AI knows" (Tab 1) from "how AI behaves" (Tab 2)

### Key Files Changed
- `store/chatStore.ts` - Added templateRules, userRules, DEFAULT_TEMPLATE_RULES
- `store/buildStore.ts` - Removed templateRules, userRules
- `components/chat/ContextInputs.tsx` - Added rules editor UI
- `components/prompt/StaticRulesEditor.tsx` - DELETED (no longer needed)
- `app/api/generate-prompt/route.ts` - Removed rules from assembly
- `app/api/generate/route.ts` - Now combines rules at chat time
- `lib/storage.ts` - Rules now in chat section of SavedState

See `docs/CHANGELOG.md` for complete implementation details.

---

## Session Summary - January 8, 2026

### Phase 8 Completed
1. ✅ Added templateRules and userRules to chatStore
2. ✅ Removed rules from buildStore
3. ✅ Added rules editor to ContextInputs.tsx
4. ✅ Deleted StaticRulesEditor.tsx from Tab 1
5. ✅ Updated generate-prompt API to not include rules
6. ✅ Updated generate API to combine rules at chat time
7. ✅ Updated storage schema and backward compatibility
8. ✅ Build verified - passes with no errors
9. ✅ Updated all documentation

### Previous Sessions

#### January 7, 2026 - Phase 6 & 7

**Phase 6 Completed:**
1. ✅ Removed `/api/clean` route and `cleaning-prompts.ts`
2. ✅ Simplified `buildStore.ts` (4 types, no rawData/cleaningInProgress)
3. ✅ Updated all components for direct upload flow
4. ✅ Added backward compatibility for old saved states

**Phase 7 Completed:**
1. ✅ Updated RAG types from 6 to 4 (matches Tab 1)
2. ✅ Simplified chunking to single markdown-based strategy
3. ✅ RAG search now queries ALL types (no filtering)
4. ✅ Fixed rate limit issue (sequential API calls with delays)
5. ✅ Added backward compatibility for old 6-type saves

### Why Phase 8 Changes
- Rules are editable during testing without going back to Tab 1
- Separates "what AI knows" from "how AI behaves"
- Faster iteration - don't need to regenerate system prompt to test different rules
- Cleaner separation of build-time vs runtime concerns

---

## Session Summary - January 8, 2026 (Continued)

### Role Preamble Added
**Problem:** The system prompt extraction and rules provided context about WHO the AI represents and HOW to behave, but never explicitly stated WHAT the AI is.

**Solution:** Added a fixed, hardcoded role preamble in `app/api/generate/route.ts`:
```
You are a sales representative responding to a prospect who has replied
to a cold outreach email you previously sent. Your goal is to continue
this conversation naturally and move them toward a sale while being
genuinely helpful - not pushy.
```

This preamble:
- Appears first in every prompt (before system prompt)
- Cannot be removed or modified
- Sets the fundamental frame for all responses

### Documentation Created
1. **`docs/MIND-MODE-VISUAL-GUIDE.md`**
   - ASCII diagrams of entire Mind Mode flow
   - All 6 Opus extraction prompts (verbatim)
   - Haiku analysis prompt
   - Final prompt assembly structure
   - Role preamble text

2. **`docs/MIND-MODE-IMPLEMENTATION-GUIDE.md`**
   - Comprehensive technical reference (~1500 lines)
   - All prompts with examples
   - All TypeScript data structures
   - Model selection rationale
   - Error handling & edge cases
   - Configuration options
   - Quick reference card
   - File locations appendix

### Files Changed
- `app/api/generate/route.ts` - Added ROLE_PREAMBLE constant
- `docs/MIND-MODE-VISUAL-GUIDE.md` - Created, then updated with role preamble
- `docs/MIND-MODE-IMPLEMENTATION-GUIDE.md` - Created
- `docs/ARCHITECTURE.md` - Updated with role preamble section
- `docs/CHANGELOG.md` - Added v0.8.1 entry
- `docs/HANDOFF.md` - Updated (this file)

### Build Status
✅ Build passes with no errors
