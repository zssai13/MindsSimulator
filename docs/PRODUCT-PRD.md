# RepSimulator Testing App
## Product Requirements Document

---

## Executive Summary

RepSimulator is a testing and development environment for building AI-powered sales representatives. It provides complete visibility into every step of the AI pipeline—from data cleaning to response generation—enabling rapid iteration and quality assurance before production deployment.

---

## Problem Statement

### The Challenge

Building an AI sales rep that sends cold emails and engages in sales conversations is complex. The pipeline involves multiple AI models, data processing steps, and retrieval systems working together. Without visibility into each step:

1. **Debugging is blind** - When the AI gives a bad response, you don't know if the problem is in the data cleaning, the system prompt, the RAG retrieval, the message analysis, or the response generation.

2. **Iteration is slow** - Testing a change requires rebuilding the entire system and hoping the output improves.

3. **Quality is inconsistent** - Without seeing the reasoning chain, you can't identify patterns in failures or successes.

4. **Handoff is risky** - Moving from development to production without thorough testing leads to embarrassing AI behavior in front of real prospects.

### Who Feels This Pain

- **Developers** building the AI sales system who need to debug and iterate
- **Product managers** validating AI behavior before launch
- **QA teams** testing edge cases and failure modes
- **Business stakeholders** who need confidence the AI won't damage brand reputation

---

## Vision

**A transparent AI development environment where every decision the AI makes is visible, testable, and improvable.**

The goal is not just to build an AI sales rep—it's to build confidence that the AI will behave correctly in production by exposing the entire reasoning chain during development.

---

## Business Goals

### Primary Goals

1. **Reduce time-to-production** by enabling rapid iteration on AI behavior
2. **Increase AI quality** by providing visibility into failure modes
3. **Build stakeholder confidence** by demonstrating the AI's reasoning process
4. **Enable non-engineers** to participate in AI tuning through visible outputs

### Success Metrics

| Metric | Target |
|--------|--------|
| Time to identify AI issue root cause | < 30 seconds |
| Iteration cycle (change → test → verify) | < 2 minutes |
| Pipeline visibility | 100% of steps exposed |
| State reproducibility | Exact replay capability |

---

## What We're Building

### The AI Sales Rep System

An AI that:
- Sends personalized cold emails based on pages prospects visit
- Engages in multi-turn sales conversations
- Stays on strategy while being flexible and knowledgeable
- Identifies buying stage and adjusts approach accordingly
- Retrieves relevant information from company knowledge base
- Knows when to hand off to humans

### The Testing App (This Product)

A two-tab application that exposes the entire AI pipeline:

**Tab 1: Build Phase**
- Upload and clean raw business data (transcripts, tickets, docs, etc.)
- Generate the AI's core system prompt from cleaned data
- Add operational rules and boundaries
- Produce a production-ready system prompt

**Tab 2: Runtime Phase**
- Upload and vectorize knowledge for RAG retrieval
- Simulate prospect conversations
- See exactly what the AI "thinks" for each response:
  - Haiku's analysis (buying stage, warmth, concerns, strategy)
  - RAG retrieval results (what knowledge was pulled)
  - Final assembled prompt (everything combined)
  - Sonnet's response generation

---

## Why This Architecture

### Two-Phase Design (Build vs Runtime)

**BUILD happens once:**
- Data cleaning is expensive (uses Opus)
- System prompt extraction is expensive (uses Opus)
- These don't change per-message

**RUNTIME happens per-message:**
- Analysis is cheap and fast (Haiku)
- Retrieval is cheap (embeddings)
- Generation is moderate cost (Sonnet)

Separating these phases means you can iterate on runtime behavior without re-running expensive build steps.

### Three-Model Strategy

| Model | Role | Why This Model |
|-------|------|----------------|
| **Opus** | Data cleaning, prompt extraction | One-time, quality matters most |
| **Haiku** | Message analysis | Fast, cheap, runs every message |
| **Sonnet** | Response generation | Balance of quality and cost |

This isn't arbitrary—it's cost-optimized for the task. Opus is 10x more expensive than Sonnet, but we only use it during build. Haiku is 60x cheaper than Sonnet, perfect for the classification task.

### Haiku Analysis Step

Before querying RAG, Haiku analyzes the message to determine:
- Buying stage (curious → interested → evaluating → ready)
- Warmth level (cold → warming → warm → hot)
- Implicit concerns (what they're really worried about)
- Search queries (what to look up in RAG)
- Response strategy (how Sonnet should respond)

**Why not skip this and go straight to Sonnet?**
1. Haiku's analysis guides WHAT to retrieve from RAG
2. Haiku's analysis tells Sonnet HOW to respond
3. It's visible—you can see if the AI is misreading the prospect

### RAG Over Fine-Tuning

We use retrieval-augmented generation instead of fine-tuning because:
1. **Updateable** - Add new case studies, pricing, features without retraining
2. **Inspectable** - See exactly what knowledge was used for each response
3. **Controllable** - Filter by content type based on the question
4. **Cost-effective** - No training costs, just embedding costs

### System Prompt Composition

The system prompt has two sources:

**Extracted from data (via Opus):**
- Identity and positioning
- ICP definition
- Email framework (distilled from guides)
- Tone rules
- Objection playbook
- Competitive positioning

**Static templates (written by humans):**
- Knowledge handling instructions (how to use RAG results)
- Buying stage response rules
- Response format rules
- Boundaries and handoffs

Why both? The AI can extract WHAT to say from your data, but it can't infer HOW your system works (like how to interpret `<knowledge>` tags).

---

## User Stories

### Developer Stories

1. **As a developer**, I want to see why the AI gave a bad response so I can fix the root cause.

2. **As a developer**, I want to test changes to the system prompt without re-cleaning all data.

3. **As a developer**, I want to see what RAG chunks were retrieved so I can improve chunking strategy.

4. **As a developer**, I want to save and reload test scenarios for regression testing.

### Product Manager Stories

1. **As a PM**, I want to see the AI's reasoning chain so I can validate it matches our sales methodology.

2. **As a PM**, I want to test how the AI handles specific objections before launch.

3. **As a PM**, I want to compare AI responses across different system prompts.

### QA Stories

1. **As QA**, I want to test edge cases like angry prospects or off-topic questions.

2. **As QA**, I want to verify the AI never makes claims it shouldn't (pricing, guarantees, etc.).

3. **As QA**, I want to reproduce exact scenarios from bug reports.

---

## Feature Requirements

### Tab 1: Build Phase

#### Data Upload (Simplified in Phase 6)
- 4 upload zones for pre-cleaned markdown files:
  - Transcripts (sales call insights)
  - Tickets (support ticket summaries)
  - Website (marketing content)
  - Research (business/market research)
- Each zone: upload pre-cleaned .md file → view/download
- Note: Data cleaning happens outside the app using external tools

#### System Prompt Generation
- "Generate System Prompt" button extracts 6 sections from cleaned data:
  - Identity & positioning
  - ICP definition
  - Email framework
  - Tone rules
  - Objection playbook
  - Competitive positioning
- Model label "opus" visible

#### Static Rules Editor
- Pre-loaded template with editable rules:
  - Knowledge handling instructions
  - Buying stage response rules
  - Response format rules
- User "Never Do" textarea for custom boundaries

#### Final System Prompt
- Scrollable view of complete combined prompt
- Copy to clipboard
- Download as markdown
- "Send to Tab 2" to pass to runtime testing

### Tab 2: Runtime Phase

#### RAG Data Section (Updated in Phase 7)
- 4 upload zones for RAG content (matches Tab 1 types):
  - Transcripts (sales call insights)
  - Tickets (support ticket summaries)
  - Website (marketing content)
  - Research (market research, ICP, competitive)
- Status indicators: Empty → Uploaded → Vectorizing → Ready
- "Vectorize All" button
- Model label "openai" (embeddings)
- Note: Same files from Tab 1 can be re-uploaded here for vectorization

#### Context Inputs
- System prompt (auto-loaded from Tab 1 or manual paste)
- Page URL (simulates what page prospect visited)
- Additional goals/context (optional instructions)
- Initial email (conversation starter)

#### Chat Simulation
- Standard chat interface
- User types as the prospect
- AI responds with expandable debug panel

#### Expandable Debug (per AI response)
Three collapsible sections:

**1. Haiku Analysis** (model label: haiku)
- Buying stage + evidence
- Warmth + evidence
- Implicit concerns
- Search queries generated
- Response strategy

**2. RAG Results** (model label: openai)
- List of retrieved chunks with type labels
- Or "No retrieval needed"

**3. Final Assembled Prompt** (model label: sonnet)
- Complete prompt sent to Sonnet
- Scrollable view

#### Reset Chat
- Clears conversation only
- Preserves: system prompt, URL, context, initial email, vectorized data

### Cross-Tab Features

#### Save/Load State (Phase 4)
- Save complete state of both tabs
- Named saves with timestamps
- Load previous states exactly
- Delete old saves

---

## Non-Functional Requirements

### Performance
| Action | Target |
|--------|--------|
| Data cleaning | < 30 seconds per file |
| Vectorization | < 60 seconds for full corpus |
| Chat response | < 3 seconds total latency |

### Cost (per message)
| Component | Estimated Cost |
|-----------|---------------|
| Haiku analysis | ~$0.002 |
| Embeddings/retrieval | ~$0.001 |
| Sonnet generation | ~$0.015-0.02 |
| **Total per message** | **~$0.02-0.03** |

Build-time Opus calls: ~$0.50 per file (one-time)

### Storage
- LocalStorage for session state (save/load)
- Supabase pgvector for vector storage (cloud-hosted PostgreSQL)

---

## Future Enhancements (Not in Current Scope)

1. **Cost Analysis** - Display cost for each action, running totals
2. **Model Swapping** - Dropdown to select different models per step
3. **Bulk Testing** - Run multiple scenarios automatically
4. **Quality Scoring** - Rate responses, track improvements
5. **Export Training Data** - Export conversations for fine-tuning
6. **A/B Testing** - Compare system prompt versions side-by-side

---

## Glossary

| Term | Definition |
|------|------------|
| **Build Phase** | One-time setup: data cleaning + system prompt generation |
| **Runtime Phase** | Per-message: analysis + retrieval + generation |
| **System Prompt** | The AI's core instructions, personality, and knowledge |
| **RAG** | Retrieval-Augmented Generation - pulling relevant info per query |
| **Haiku Analysis** | Fast classification of message intent and buyer state |
| **ICP** | Ideal Customer Profile - who we're selling to |
| **Buying Stage** | Where prospect is: curious → interested → evaluating → ready |
| **Warmth** | Engagement level: cold → warming → warm → hot |

---

## Appendix: The Full Pipeline

```
BUILD PHASE (one-time) - Simplified in Phase 6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pre-cleaned .md Files (4 types)
              ↓
         [Opus] → Extracted Sections
              ↓
              + Static Rules → System Prompt


RUNTIME PHASE (per-message) - Updated in Phase 7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RAG Data (4 types: transcripts, tickets, website, research)
              ↓
         [OpenAI] → Vectorize → Supabase pgvector

Message + Page Context + History
              ↓
         [Haiku] → Analysis (stage, warmth, queries, strategy)
              ↓
         [OpenAI] → RAG Query → Search ALL types → Retrieved Chunks
              ↓
System Prompt + Analysis + Chunks + History + Message
              ↓
         [Sonnet] → Response
```

Notes:
- Data cleaning removed from the app in Phase 6. Users prepare clean files externally.
- RAG types updated in Phase 7 to match Tab 1 types. Search now queries all types for maximum coverage.
