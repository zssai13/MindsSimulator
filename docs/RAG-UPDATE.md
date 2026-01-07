# RAG-UPDATE.md - Tab 2 RAG Data Types Update

**Status:** COMPLETE
**Implemented:** January 7, 2026

## Overview

**Goal:** Replace the 6 RAG data types in Tab 2 with 4 types that match Tab 1, and simplify chunking to use a single markdown-based strategy.

**Why:** Users will re-upload the same cleaned .md files from Tab 1 into Tab 2 for vectorization. This keeps the workflow simple and consistent.

---

## Summary of Changes

| Change | Description |
|--------|-------------|
| **Replace RAG types** | From 6 types → 4 types |
| **Old types (remove)** | `docs`, `case_study`, `pricing`, `faq`, `competitive`, `website` |
| **New types (add)** | `transcripts`, `tickets`, `website`, `research` |
| **Simplify chunking** | Single markdown-based strategy (split by `##` headers) |
| **Search behavior** | Always search ALL types (no filtering) |

---

## Current vs New RAG Types

```typescript
// BEFORE (6 types)
type RagType = 'docs' | 'case_study' | 'pricing' | 'faq' | 'competitive' | 'website';

// AFTER (4 types - matches Tab 1)
type RagType = 'transcripts' | 'tickets' | 'website' | 'research';
```

---

## Files to Modify

### 1. `lib/vectorstore/chunk.ts` - Core Type Definition (MODIFY FIRST)

**Changes:**
1. Update `RagType` union to 4 new types
2. Remove all type-specific chunking functions (chunkDocs, chunkCaseStudy, etc.)
3. Replace with single `chunkMarkdown` function that splits by `##` headers
4. Update `RAG_TYPE_LABELS` object

```typescript
// NEW RagType
export type RagType = 'transcripts' | 'tickets' | 'website' | 'research';

// NEW simplified chunking - single strategy for all types
function chunkMarkdown(content: string): string[] {
  const cleaned = cleanText(content);

  // Split by markdown headers (##, ###)
  const sections = cleaned.split(/(?=^#{2,3}\s)/m);

  return sections
    .map(s => s.trim())
    .filter(s => s.length > 50);
}

// NEW chunkContent - uses single strategy
export function chunkContent(content: string, type: RagType): Chunk[] {
  const textChunks = chunkMarkdown(content);

  return textChunks.map((text, index) => ({
    id: generateChunkId(type, index),
    text,
    type,
  }));
}

// NEW labels
export const RAG_TYPE_LABELS: Record<RagType, string> = {
  transcripts: 'Sales Call Transcripts',
  tickets: 'Support Tickets',
  website: 'Website Content',
  research: 'Deep Research',
};
```

---

### 2. `store/ragStore.ts` - State Management

**Changes:**
1. Update `initialFiles`, `initialStatus`, `initialChunkCounts` to 4 types
2. Update `RAG_TYPES` array
3. Update `RAG_TYPE_CONFIG` object

```typescript
// NEW initial values
const initialFiles: Record<RagType, string | null> = {
  transcripts: null,
  tickets: null,
  website: null,
  research: null,
};

const initialStatus: Record<RagType, RagStatus> = {
  transcripts: 'empty',
  tickets: 'empty',
  website: 'empty',
  research: 'empty',
};

const initialChunkCounts: Record<RagType, number> = {
  transcripts: 0,
  tickets: 0,
  website: 0,
  research: 0,
};

// NEW RAG_TYPES array
export const RAG_TYPES: RagType[] = ['transcripts', 'tickets', 'website', 'research'];

// NEW config
export const RAG_TYPE_CONFIG: Record<RagType, { label: string; description: string }> = {
  transcripts: {
    label: 'Sales Transcripts',
    description: 'Sales call insights and winning patterns',
  },
  tickets: {
    label: 'Support Tickets',
    description: 'Customer support summaries and common issues',
  },
  website: {
    label: 'Website Content',
    description: 'Marketing pages and website copy',
  },
  research: {
    label: 'Deep Research',
    description: 'Market research, ICP definitions, competitive analysis',
  },
};
```

---

### 3. `app/api/analyze/route.ts` - Haiku Analysis

**Changes:**
1. Update `content_types` in the prompt to list new 4 types
2. Since we're searching all types every time, we can simplify the prompt

```typescript
// Update the content_types line in ANALYSIS_PROMPT:
"content_types": ["transcripts", "tickets", "website", "research"] or null,

// Note: We'll ignore this field when querying and always search all types
```

---

### 4. `components/chat/ChatContainer.tsx` - Chat Orchestration

**Changes:**
1. Remove `contentTypes` from the query API call (always search all)

```typescript
// BEFORE
const queryRes = await fetch('/api/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    queries: analysis.search_queries,
    contentTypes: analysis.content_types || undefined,  // REMOVE THIS
    limit: 5,
  }),
});

// AFTER - search all types
const queryRes = await fetch('/api/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    queries: analysis.search_queries,
    limit: 8,  // Increase limit since searching all
  }),
});
```

---

### 5. `store/chatStore.ts` - Update HaikuAnalysis Type

**Changes:**
1. Update `content_types` type to use new RagType values

```typescript
// content_types will still be RagType[] | null (type inferred from chunk.ts)
// No explicit change needed since RagType is imported
```

---

### 6. `lib/storage.ts` - SavedState Schema

**Changes:**
1. The `RagType` import from chunk.ts will automatically update
2. No explicit changes needed (type is imported)

---

### 7. `components/rag/RagSection.tsx` - UI Component

**Changes:**
1. No code changes needed - uses `RAG_TYPES` and `RAG_TYPE_CONFIG` from store
2. Grid layout will automatically adjust (4 items = 2x2 grid)

---

### 8. `components/state/LoadStateModal.tsx` - Backward Compatibility

**Changes:**
1. Add backward compatibility for old saves with 6 RAG types

```typescript
// When restoring RAG state, only restore matching types
const ragTypes: RagType[] = ['transcripts', 'tickets', 'website', 'research'];
ragTypes.forEach((type) => {
  store.setFile(type, rag.files?.[type] ?? null);
  store.setStatus(type, rag.status?.[type] ?? 'empty');
  store.setChunkCount(type, rag.chunkCounts?.[type] ?? 0);
});
```

---

## Execution Order

Execute modifications in this order to avoid TypeScript errors:

1. **Modify** `lib/vectorstore/chunk.ts` (source of truth for RagType)
2. **Modify** `store/ragStore.ts` (state and config)
3. **Modify** `app/api/analyze/route.ts` (Haiku prompt)
4. **Modify** `components/chat/ChatContainer.tsx` (remove contentTypes filter)
5. **Modify** `components/state/LoadStateModal.tsx` (backward compatibility)

---

## Files NOT Needing Changes

| File | Reason |
|------|--------|
| `app/api/query/route.ts` | Types imported from chunk.ts, contentTypes becomes optional |
| `app/api/vectorize/route.ts` | Types imported from chunk.ts |
| `lib/vectorstore/index.ts` | Types imported from chunk.ts |
| `components/rag/RagUploadZone.tsx` | Uses types from ragStore |
| `components/chat/ExpandableDebug.tsx` | Displays whatever types come back |
| `lib/storage.ts` | Types imported |
| `store/chatStore.ts` | Types imported |

---

## New Tab 2 RAG Flow

```
BEFORE:
6 upload zones → Type-specific chunking → Filtered search by type

AFTER:
4 upload zones → Markdown chunking (all same) → Search ALL types every time
```

---

## UI Changes

### RagSection Grid
- Changes from 6 zones (3x2 grid) to 4 zones (2x2 grid)
- Grid CSS class `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` works fine

### Upload Zone Labels
| Type | Label | Description |
|------|-------|-------------|
| transcripts | Sales Transcripts | Sales call insights and winning patterns |
| tickets | Support Tickets | Customer support summaries and common issues |
| website | Website Content | Marketing pages and website copy |
| research | Deep Research | Market research, ICP definitions, competitive analysis |

---

## Backward Compatibility

Old saved states will have 6 RAG types. When loading:
- Only the new 4 types are restored
- `docs`, `case_study`, `pricing`, `faq`, `competitive` data is ignored
- Missing fields handled with optional chaining

---

## Testing Checklist

- [ ] Build passes (`npm run build`)
- [ ] Tab 2 shows 4 upload zones
- [ ] Upload .md files to all 4 types
- [ ] "Vectorize All" creates chunks
- [ ] Chat sends message → searches all types → returns results
- [ ] RAG results show correct type labels
- [ ] Save/Load works with new types
- [ ] Old saves load gracefully (no errors)

---

## Summary

| Action | File |
|--------|------|
| MODIFY | `lib/vectorstore/chunk.ts` |
| MODIFY | `lib/vectorstore/index.ts` |
| MODIFY | `store/ragStore.ts` |
| MODIFY | `app/api/analyze/route.ts` |
| MODIFY | `components/chat/ChatContainer.tsx` |
| MODIFY | `components/state/LoadStateModal.tsx` |

**Total: 6 modifications**
