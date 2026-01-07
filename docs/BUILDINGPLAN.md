# RepSimulator Development Plan

**Last Updated:** All Phases Complete (Phase 4 Session - January 2026)

## Overview

This document outlines the complete build plan to go from foundation to finished app. We build in 4 phases, validating each before moving to the next.

---

## Phase Summary

| Phase | Name | Goal | Components | Status |
|-------|------|------|------------|--------|
| **1** | Build Phase UI | Tab 1 fully functional | 7 components, 2 API routes | ✅ COMPLETE |
| **2** | Vector Database | RAG system working | 4 lib files, 2 API routes, 2 components | ✅ COMPLETE |
| **3** | Chat System | Full pipeline with debug | 5 components, 2 API routes, 1 store | ✅ COMPLETE |
| **4** | Save/Load | State persistence | 2 components, 1 lib file | ✅ COMPLETE |

---

## Phase 1: Tab 1 - Build Phase ✅ COMPLETE

**Goal:** User can upload data, clean it with Opus, generate a system prompt, add rules, and export.

**Completed:** All components built and tested. API routes working with Opus.

### Components Built

| # | Component | File Path | Status |
|---|-----------|-----------|--------|
| 1.1 | DataUploadZone | `components/upload/DataUploadZone.tsx` | ✅ Complete |
| 1.2 | CleanedFileDisplay | `components/upload/CleanedFileDisplay.tsx` | ✅ Complete |
| 1.3 | FileViewModal | `components/upload/FileViewModal.tsx` | ✅ Complete |
| 1.4 | StaticRulesEditor | `components/prompt/StaticRulesEditor.tsx` | ✅ Complete |
| 1.5 | SystemPromptGenerator | `components/prompt/SystemPromptGenerator.tsx` | ✅ Complete |
| 1.6 | FinalPromptDisplay | `components/prompt/FinalPromptDisplay.tsx` | ✅ Complete |
| 1.7 | Tab1BuildPhase | `components/tabs/Tab1BuildPhase.tsx` | ✅ Complete |

### API Routes Built

| # | Route | File Path | Status |
|---|-------|-----------|--------|
| 1.8 | Clean | `app/api/clean/route.ts` | ✅ Complete |
| 1.9 | Generate Prompt | `app/api/generate-prompt/route.ts` | ✅ Complete |

### Validation Checklist

- [x] Can upload 6 different file types (transcripts, tickets, website, docs, research, email-guide)
- [x] Each file shows upload status
- [x] Clean button calls Opus and returns cleaned data
- [x] Model label "opus" visible on clean buttons
- [x] Cleaned files appear in list with View/Download
- [x] View modal shows formatted content
- [x] Download exports file
- [x] Static rules editor has template pre-loaded
- [x] User can add custom "never do" rules
- [x] Generate System Prompt extracts 6 sections
- [x] Final prompt shows combined output
- [x] Copy to clipboard works
- [x] Download as .md works
- [x] "Send to Tab 2" placeholder (full implementation in Phase 3)

### Phase 1 Lessons Learned

1. **Opus Response Format** - Opus sometimes returns JSON wrapped in markdown code blocks (```json...```). The FileViewModal handles this gracefully with `formatContent()`.

2. **React Hook Dependencies** - `useCallback` hooks need proper dependency arrays. Moving `readFile` inside `useCallback` and including it as a dependency in handlers fixed lint warnings.

3. **Parallel API Calls** - The generate-prompt route uses `Promise.all` to extract all 6 sections in parallel, significantly speeding up prompt generation.

4. **Default Template Rules** - StaticRulesEditor initializes with comprehensive default rules via `useEffect`, ensuring users have a working starting point.

5. **Zustand Selectors** - Using granular selectors like `useBuildStore((s) => s.rawData[type])` prevents unnecessary re-renders.

---

## Phase 2: Vector Database ✅ COMPLETE

**Goal:** User can upload RAG content, vectorize it, and query it.

**Completed:** All files built and tested. LanceDB configured for Next.js.

### Lib Files Built

| # | File | Path | Status |
|---|------|------|--------|
| 2.1 | Embeddings | `lib/vectorstore/embeddings.ts` | ✅ Complete |
| 2.2 | Chunking | `lib/vectorstore/chunk.ts` | ✅ Complete |
| 2.3 | Vector Store | `lib/vectorstore/index.ts` | ✅ Complete |
| 2.4 | RAG Store | `store/ragStore.ts` | ✅ Complete |

### API Routes Built

| # | Route | Path | Status |
|---|-------|------|--------|
| 2.5 | Vectorize | `app/api/vectorize/route.ts` | ✅ Complete |
| 2.6 | Query | `app/api/query/route.ts` | ✅ Complete |

### Components Built

| # | Component | Path | Status |
|---|-----------|------|--------|
| 2.7 | RagUploadZone | `components/rag/RagUploadZone.tsx` | ✅ Complete |
| 2.8 | RagSection | `components/rag/RagSection.tsx` | ✅ Complete |

### Validation Checklist

- [x] LanceDB initializes without errors
- [x] Can upload 6 RAG file types
- [x] Status shows: Empty → Uploaded → Vectorizing → Ready
- [x] Vectorize All processes all files
- [x] Model label "openai" visible
- [x] Chunks stored with correct metadata (type, topic)
- [x] Query returns relevant chunks
- [x] Query can filter by content type
- [x] Vectorized data persists in .lancedb folder

### Phase 2 Implementation Notes

1. **LanceDB on Windows** - Required `serverComponentsExternalPackages` config in next.config.mjs
2. **Semantic Chunking** - Each content type has specialized chunking strategy
3. **Batch Embeddings** - Embeddings are batched for efficiency (100 texts per API call)

---

## Phase 3: Chat System ✅ COMPLETE

**Goal:** Full chat simulation with Haiku analysis, RAG retrieval, Sonnet generation, and debug visibility.

**Completed:** All components built and tested. Full pipeline working.

### Store Built

| # | File | Path | Status |
|---|------|------|--------|
| 3.1 | Chat Store | `store/chatStore.ts` | ✅ Complete |

### API Routes Built

| # | Route | Path | Status |
|---|-------|------|--------|
| 3.2 | Analyze | `app/api/analyze/route.ts` | ✅ Complete |
| 3.3 | Generate | `app/api/generate/route.ts` | ✅ Complete |

### Components Built

| # | Component | Path | Status |
|---|-----------|------|--------|
| 3.4 | ContextInputs | `components/chat/ContextInputs.tsx` | ✅ Complete |
| 3.5 | ChatMessage | `components/chat/ChatMessage.tsx` | ✅ Complete |
| 3.6 | ChatInput | `components/chat/ChatInput.tsx` | ✅ Complete |
| 3.7 | ExpandableDebug | `components/chat/ExpandableDebug.tsx` | ✅ Complete |
| 3.8 | ChatContainer | `components/chat/ChatContainer.tsx` | ✅ Complete |

### Validation Checklist

- [x] System prompt auto-loads from Tab 1 (or manual paste)
- [x] Page URL input works
- [x] Additional context input works
- [x] Initial email displays as first message
- [x] User can type and send messages
- [x] Haiku analysis runs on each message
- [x] RAG retrieval runs if needs_search is true
- [x] Sonnet generates response
- [x] Response appears in chat
- [x] Expand button shows debug panel
- [x] Debug shows Haiku analysis with "haiku" label
- [x] Debug shows RAG results with "openai" label
- [x] Debug shows final prompt with "sonnet" label
- [x] Reset Chat clears messages but keeps inputs
- [x] Loading states during processing

### Phase 3 Implementation Notes

1. **Tab 1 → Tab 2 Wire** - System prompt auto-loads from buildStore if available
2. **Message Flow** - ChatContainer orchestrates: analyze → query → generate
3. **Debug UI** - Collapsible panels with tabbed sections (Analysis, RAG, Prompt)
4. **Processing States** - Shows "Analyzing...", "Retrieving...", "Generating..." during flow
5. **Error Handling** - Graceful fallback if Haiku JSON parsing fails

---

## Phase 4: Save/Load State ✅ COMPLETE

**Goal:** User can save complete app state and reload it later.

**Completed:** All files built and tested. Full save/load functionality working.

### Lib Built

| # | File | Path | Status |
|---|------|------|--------|
| 4.1 | Storage | `lib/storage.ts` | ✅ Complete |

### Components Built

| # | Component | Path | Status |
|---|-----------|------|--------|
| 4.2 | SaveStateButton | `components/state/SaveStateButton.tsx` | ✅ Complete |
| 4.3 | LoadStateModal | `components/state/LoadStateModal.tsx` | ✅ Complete |

### Page Updated

- `app/page.tsx` - Added Save/Load buttons to header

### Validation Checklist

- [x] Save State opens modal
- [x] Can enter save name
- [x] Save captures all Tab 1 state
- [x] Save captures all Tab 2 state (RAG status, chat, inputs)
- [x] Save appears in Load modal with timestamp
- [x] Load restores exact state
- [x] Can delete saves
- [x] Multiple saves work
- [x] State survives browser refresh

### Phase 4 Implementation Notes

1. **SavedState Schema** - Combines all three Zustand stores (build, rag, chat) into one serializable object
2. **LocalStorage Strategy** - Saves list stored separately from full state objects for efficient listing
3. **Restoration Helpers** - Dedicated functions for each store prevent coupling
4. **UI in Header** - Save/Load buttons added directly to page.tsx header, no separate Header component needed
5. **No Vector Re-indexing** - Save preserves RAG status but vectors must be re-created after load (LanceDB not saved)

### Important Note on Vector Data

The Save/Load system saves:
- RAG file contents (raw text)
- Vectorization status (empty/uploaded/ready)
- Chunk counts

It does **NOT** save:
- Actual vector embeddings in LanceDB
- The `.lancedb/` folder data

After loading a saved state with "ready" RAG status, users may need to re-vectorize if the LanceDB data was cleared. The status will show as "ready" but queries won't return results until re-vectorized.

---

## Post-MVP Enhancements (Future)

These are NOT in current scope but documented for future:

| Enhancement | Description |
|-------------|-------------|
| Cost Analysis | Show cost per action, running totals |
| Model Swapping | Dropdown to change models per step |
| Bulk Testing | Run multiple scenarios automatically |
| Quality Scoring | Rate responses, track improvements |
| Export Training Data | Export conversations for fine-tuning |
| A/B Testing | Compare prompt versions side-by-side |
| Streaming Responses | Stream Sonnet output in real-time |

---

## Success Criteria

The app is complete when:

1. **Tab 1 works end-to-end:** Upload → Clean → Generate → Export ✅ DONE
2. **Tab 2 works end-to-end:** Vectorize → Chat → See full debug ✅ DONE
3. **State persists:** Save → Close → Reopen → Load → Continue ✅ DONE
4. **All models labeled:** User always knows which AI is running ✅ DONE
5. **Debug is complete:** Can see every step of every response ✅ DONE

**ALL PHASES COMPLETE - APP READY FOR PRODUCTION USE**

---

## Dependency Map

```
Phase 1 (Tab 1) ✅ COMPLETE
    │
    ├── System Prompt output ──────────────┐
    │                                       │
    ▼                                       ▼
Phase 2 (Vector DB) ✅ COMPLETE       Phase 3 (Chat) ✅ COMPLETE
    │                                       │
    └── RAG queries ───────────────────────┘
                        │
                        ▼
                  Phase 4 (Save/Load) ✅ COMPLETE
```

Phase 1 ✅ Complete
Phase 2 ✅ Complete
Phase 3 ✅ Complete
Phase 4 ✅ Complete

**ALL PHASES COMPLETE**

---

## Estimated Effort

| Phase | Components | API Routes | Complexity | Status |
|-------|------------|------------|------------|--------|
| 1 | 7 | 2 | Medium | ✅ Done |
| 2 | 2 + 4 lib | 2 | Medium-High (LanceDB) | ✅ Done |
| 3 | 5 + 1 store | 2 | High (orchestration) | ✅ Done |
| 4 | 2 + 1 lib | 0 | Low | ✅ Done |

**Current Position:** All phases complete. App is ready for production use.
