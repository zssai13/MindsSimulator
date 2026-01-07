# RepSimulator Development Handoff

**Last Updated:** January 7, 2026
**Status:** All 6 Phases Complete | Ready for Vercel Deployment
**GitHub:** https://github.com/zssai13/MindsSimulator.git

---

## Quick Start for New Claude Session

### 1. Read These Documents First
1. `CLAUDE.md` - AI assistant context and instructions
2. `docs/ARCHITECTURE.md` - Technical architecture
3. `docs/BUILDINGPLAN.md` - Development phases (all complete)
4. `docs/CHANGELOG.md` - Version history
5. This file - Current status

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
BUILD PHASE (Tab 1) - Simplified in Phase 6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pre-cleaned .md Files → [Opus] → System Prompt
  (4 types)

RUNTIME PHASE (Tab 2)
━━━━━━━━━━━━━━━━━━━━━━━━━━
Message → [Haiku] → Analysis
                      ↓
              [OpenAI] → RAG Query (Supabase pgvector)
                      ↓
System Prompt + Analysis + Chunks + History
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

## Session Summary - January 7, 2026

### Phase 6 Completed
1. ✅ Removed `/api/clean` route and `cleaning-prompts.ts`
2. ✅ Simplified `buildStore.ts` (4 types, no rawData/cleaningInProgress)
3. ✅ Updated all components for direct upload flow
4. ✅ Added backward compatibility for old saved states
5. ✅ Build verified - passes with no errors
6. ✅ Updated all documentation

### Why This Change
- Data cleaning will happen outside the app
- Users prepare clean MD files externally
- Simpler flow: Upload → Generate (no cleaning step)
- Reduced from 6 data types to 4
