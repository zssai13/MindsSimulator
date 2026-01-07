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
3. `docs/BUILDINGPLAN.md` - Understand the FULL PLAN (4 phases, all tasks)
4. `docs/HANDOFF.md` - Understand WHERE we are and what's next

---

## Project Summary

RepSimulator is a testing app for AI sales reps. It has two tabs:
- **Tab 1 (Build Phase):** Upload data → Clean with Opus → Generate system prompt
- **Tab 2 (Runtime Phase):** Vectorize RAG data → Chat simulation with Haiku/RAG/Sonnet pipeline

The app exposes every step of the AI pipeline for debugging and iteration.

---

## Current Status

**Phase 1 (Tab 1 - Build): COMPLETE**
- All 7 components built and working
- 2 API routes (`/api/clean`, `/api/generate-prompt`) tested with Opus
- Upload → Clean → Generate → Export flow verified

**Phase 2 (Vector DB): COMPLETE**
- LanceDB configured with Next.js (serverComponentsExternalPackages)
- Semantic chunking by 6 content types
- OpenAI embeddings with batch support
- `/api/vectorize` and `/api/query` endpoints working

**Phase 3 (Chat System): COMPLETE**
- Full Haiku → RAG → Sonnet pipeline working
- `/api/analyze` (Haiku) and `/api/generate` (Sonnet) endpoints
- Chat UI with collapsible debug panels (Analysis, RAG, Prompt tabs)
- System prompt auto-loads from Tab 1

**Phase 4 (Save/Load): READY TO START**
- All dependencies met (buildStore, ragStore, chatStore available)
- Need: storage.ts, SaveStateButton, LoadStateModal, Header

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main page with tab navigation |
| `store/buildStore.ts` | Tab 1 state management |
| `store/ragStore.ts` | RAG/vector state management |
| `store/chatStore.ts` | Chat state management |
| `lib/anthropic.ts` | Anthropic client + model constants |
| `lib/vectorstore/index.ts` | LanceDB operations |
| `app/api/analyze/route.ts` | Haiku message analysis |
| `app/api/generate/route.ts` | Sonnet response generation |
| `components/chat/ChatContainer.tsx` | Chat orchestration |
| `components/chat/ExpandableDebug.tsx` | Debug panel (3 tabs) |

---

## Development Phases

> **Full task breakdown in `docs/BUILDINGPLAN.md`**

| Phase | Focus | Components | Status |
|-------|-------|------------|--------|
| 1 | Tab 1 - Build Phase | 7 components, 2 API routes | ✅ Complete |
| 2 | Vector DB (LanceDB) | 4 lib files, 2 API routes, 2 components | ✅ Complete |
| 3 | Chat System | 5 components, 2 API routes, 1 store | ✅ Complete |
| 4 | Save/Load State | 3 components, 1 lib file | ⏳ Next |

**Current Position:** Phases 1-3 complete. Ready to start Phase 4 (Save/Load).

---

## Original Source Documents

These are the original planning documents from the user:

| Document | Path |
|----------|------|
| Conversation Summary | `c:\Users\bills\OneDrive\Desktop\HYROS CODE\Resources\RepSimulatorPRD\files\1-conversation-summary.md` |
| Original PRD | `c:\Users\bills\OneDrive\Desktop\HYROS CODE\Resources\RepSimulatorPRD\files\2-testing-app-prd.md` |
| Technical Implementation | `c:\Users\bills\OneDrive\Desktop\HYROS CODE\Resources\RepSimulatorPRD\files\3-technical-implementation.md` |

These contain detailed code examples and the full context of how the system was designed.

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
```

---

## Architecture Quick Reference

### Build Phase (Tab 1)
```
Raw Data → [Opus Clean] → Cleaned Data
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
| Data cleaning | Opus |
| Prompt extraction | Opus |
| Message analysis | Haiku |
| Embeddings | OpenAI text-embedding-3-small |
| Response generation | Sonnet |

---

## Data Types

```typescript
// For cleaning (Tab 1)
type DataType = 'transcripts' | 'tickets' | 'website' | 'docs' | 'research' | 'email-guide';

// For RAG (Tab 2)
type RagType = 'docs' | 'case_study' | 'pricing' | 'faq' | 'competitive' | 'website';
```

---

## What to Build Next

See `docs/HANDOFF.md` for the prioritized task list.

**Phase 4 - Immediate next steps:**
1. Build `lib/storage.ts` - LocalStorage save/load/delete operations
2. Define SavedState schema (combine buildStore, ragStore, chatStore)
3. Build `components/state/SaveStateButton.tsx` - Save button with name modal
4. Build `components/state/LoadStateModal.tsx` - List saves, load, delete
5. Build `components/Header.tsx` - App header with save/load buttons
6. Wire state restoration to all stores
7. Update `page.tsx` to use Header

---

## Conventions

- **Model labels**: Always show which AI model is being used (ModelLabel component)
- **Loading states**: Use LoadingSpinner during API calls
- **State**: Use Zustand stores, update immediately after operations
- **API routes**: Return `{ data, model }` format for consistency
- **Components**: Use 'use client' directive for interactive components

---

## Testing Approach

Build phase-by-phase with validation:
1. Build Phase 1 → Test upload/clean/generate flow
2. Build Phase 2 → Test vectorization/query
3. Build Phase 3 → Test full chat pipeline
4. Build Phase 4 → Test save/load

User has real data ready for testing.
