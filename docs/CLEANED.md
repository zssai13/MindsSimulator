# CLEANED.md - Tab 1 Simplification (IMPLEMENTED)

**Status:** COMPLETE
**Implemented:** January 7, 2026

## Overview

**Goal:** Remove the Opus data cleaning step from Tab 1. Users upload pre-cleaned Markdown files directly instead of uploading raw files and cleaning them with AI.

**Rationale:** Cleaning happens outside this app. Users prepare clean MD files externally and upload them here to continue with system prompt generation.

---

## Summary of Changes

| Change | Description |
|--------|-------------|
| **Remove cleaning** | No more "Clean with Opus" step |
| **Direct upload** | Users upload pre-cleaned `.md` files directly |
| **Reduce data types** | From 6 types to 4 types |
| **Keep types** | `transcripts`, `tickets`, `website`, `research` |
| **Remove types** | `docs`, `email-guide` |
| **Delete files** | `/api/clean` route, `cleaning-prompts.ts` |

---

## Files Changed

### Deleted

| File | Reason |
|------|--------|
| `app/api/clean/route.ts` | Cleaning API no longer needed |
| `lib/prompts/cleaning-prompts.ts` | Cleaning prompts no longer needed |

### Modified

| File | Changes |
|------|---------|
| `store/buildStore.ts` | Removed `rawData`, `cleaningInProgress`; updated `DataType` to 4 types |
| `lib/storage.ts` | Removed `rawData` from SavedState schema |
| `app/api/generate-prompt/route.ts` | Updated CleanedData interface to 4 types |
| `components/state/SaveStateButton.tsx` | Removed rawData from saved state |
| `components/state/LoadStateModal.tsx` | Updated restore logic, added backward compatibility |
| `components/upload/DataUploadZone.tsx` | Simplified to direct upload (removed cleaning) |
| `components/upload/CleanedFileDisplay.tsx` | Updated to 4 types, changed download to .md |
| `components/upload/FileViewModal.tsx` | Updated type labels to 4 types |
| `components/tabs/Tab1BuildPhase.tsx` | Updated to 4 upload zones, changed UI text |
| `components/prompt/SystemPromptGenerator.tsx` | Updated help text |

---

## New Tab 1 Flow

```
BEFORE (with cleaning):
Raw File → Upload → [Opus Clean] → Cleaned Data → Generate Prompt

AFTER (no cleaning):
Pre-cleaned .md File → Upload → Generate Prompt
```

---

## Data Types

```typescript
// BEFORE (6 types)
type DataType = 'transcripts' | 'tickets' | 'website' | 'docs' | 'research' | 'email-guide';

// AFTER (4 types)
type DataType = 'transcripts' | 'tickets' | 'website' | 'research';
```

---

## Backward Compatibility

Old saved states with 6 data types will load gracefully:
- Only the 4 supported types are restored
- `docs` and `email-guide` data from old saves is ignored
- Missing fields handled with optional chaining

---

## Testing Checklist

- [x] Build passes (`npm run build`)
- [ ] Upload .md files to 4 upload zones
- [ ] Files appear in "Uploaded Files" section
- [ ] "Generate System Prompt" works
- [ ] Save/Load state works
- [ ] Old saved states load without errors
