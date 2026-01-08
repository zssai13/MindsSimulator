# HYROS Mind Mode - Visual Process Guide

A visual reference for understanding how AI Minds are created and how they respond to prospects.

---

## Overview: Two Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   PHASE 1: CREATE THE MIND                PHASE 2: MIND RESPONDS            │
│   (One-time setup)                        (Every message)                   │
│                                                                             │
│   ┌─────────────────────┐                 ┌─────────────────────┐           │
│   │                     │                 │                     │           │
│   │  Customer Data      │                 │  Prospect Message   │           │
│   │       +             │   ────────►     │       +             │           │
│   │  Business Research  │                 │  Mind Knowledge     │           │
│   │       ↓             │                 │       ↓             │           │
│   │  AI Mind Created    │                 │  AI Response        │           │
│   │                     │                 │                     │           │
│   └─────────────────────┘                 └─────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# PHASE 1: Creating the Mind

## Step 1.1 - Gather the Data

The customer provides 4 types of data (pre-formatted):

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER PROVIDES                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐        │
│   │   WEBSITE      │    │    SUPPORT     │    │     SALES      │        │
│   │   CONTENT      │    │    TICKETS     │    │  TRANSCRIPTS   │        │
│   │                │    │                │    │                │        │
│   │  Product info  │    │  Common Q&A    │    │  Objections    │        │
│   │  Pricing       │    │  Issues        │    │  Tone examples │        │
│   │  Features      │    │  Solutions     │    │  Win patterns  │        │
│   └────────────────┘    └────────────────┘    └────────────────┘        │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │                    BUSINESS URLs                             │       │
│   │         (Website, competitors, industry resources)           │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Note:** We provide customers with instructions/prompts to format their data correctly before uploading.

---

## Step 1.2 - Generate Business Research

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        BUSINESS RESEARCH                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                     Business URLs                                        │
│                          │                                               │
│                          ▼                                               │
│              ┌─────────────────────┐                                     │
│              │                     │                                     │
│              │   GEMINI DEEP       │                                     │
│              │   RESEARCH MODE     │                                     │
│              │                     │                                     │
│              └─────────────────────┘                                     │
│                          │                                               │
│                          ▼                                               │
│              ┌─────────────────────┐                                     │
│              │                     │                                     │
│              │  RESEARCH DOCUMENT  │                                     │
│              │                     │                                     │
│              │  • Market position  │                                     │
│              │  • Competitors      │                                     │
│              │  • ICP details      │                                     │
│              │  • Industry context │                                     │
│              │                     │                                     │
│              └─────────────────────┘                                     │
│                                                                          │
│   MODEL: Google Gemini (Deep Research Mode)                              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1.3 - Create System Prompt

All 4 data sources are combined and sent to Opus to extract 6 sections:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     SYSTEM PROMPT GENERATION                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│   │ Website  │  │ Tickets  │  │Transcripts│  │ Research │                │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘                │
│        │             │             │             │                       │
│        └─────────────┴──────┬──────┴─────────────┘                       │
│                             │                                            │
│                             ▼                                            │
│                 ┌───────────────────────┐                                │
│                 │                       │                                │
│                 │     CLAUDE OPUS       │                                │
│                 │                       │                                │
│                 │  Extracts 6 sections  │                                │
│                 │  using specific       │                                │
│                 │  prompts for each     │                                │
│                 │                       │                                │
│                 └───────────────────────┘                                │
│                             │                                            │
│                             ▼                                            │
│                 ┌───────────────────────┐                                │
│                 │    SYSTEM PROMPT      │                                │
│                 │                       │                                │
│                 │  • Identity           │                                │
│                 │  • ICP                │                                │
│                 │  • Email Framework    │                                │
│                 │  • Tone & Voice       │                                │
│                 │  • Objection Handling │                                │
│                 │  • Competitive        │                                │
│                 │                       │                                │
│                 └───────────────────────┘                                │
│                                                                          │
│   MODEL: Claude Opus 4.5                                                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Extraction Prompts (What We Tell Opus)

Each section is extracted using a specific instruction prompt:

---

#### IDENTITY EXTRACTION PROMPT
```
Extract a 2-3 sentence identity statement.

Include:
- Company name and what it does (simply)
- Core value proposition
- Who it's for

Keep it conversational, not corporate.

Output the identity statement directly, no JSON wrapper.
```

---

#### ICP (Ideal Customer Profile) EXTRACTION PROMPT
```
Extract the Ideal Customer Profile.

Include:
- Primary buyer types
- Spend/size thresholds
- Common pain points (in their words)
- Disqualification criteria

Output as a structured section with clear bullet points.
```

---

#### EMAIL FRAMEWORK EXTRACTION PROMPT
```
Distill email strategy into actionable rules.

Format:
- Structure (5 bullets)
- Opening lines (5 bullets)
- Subject lines (5 bullets)
- CTAs (3 bullets)
- Never do (5 bullets)

Max 300 words. Specific, not generic.

Output as a formatted section with headers and bullets.
```

---

#### TONE & VOICE EXTRACTION PROMPT
```
Extract tone and voice guidelines.

Include:
- How to sound (confident but not...)
- How to match prospect energy
- What to avoid (corporate speak, etc.)
- Formality guidance

Output as a formatted section with clear guidelines.
```

---

#### OBJECTION HANDLING EXTRACTION PROMPT
```
Extract top 10-15 objections with responses.

Format each as:
**"[Objection in their words]"**
- Why they say this
- Response framework
- Key phrases that worked

Only include proven responses.

Output as a formatted playbook.
```

---

#### COMPETITIVE POSITIONING EXTRACTION PROMPT
```
Extract competitive positioning.

Format:
vs [Competitor 1]:
- Key differentiator
- When we win
- What to say

Repeat for each major competitor mentioned in the data.

Output as a formatted competitive guide.
```

---

## Step 1.4 - Vectorize RAG Data

The same 4 data sources are also stored for retrieval during conversations:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         RAG VECTORIZATION                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│   │ Website  │  │ Tickets  │  │Transcripts│  │ Research │                │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘                │
│        │             │             │             │                       │
│        └─────────────┴──────┬──────┴─────────────┘                       │
│                             │                                            │
│                     ┌───────┴───────┐                                    │
│                     │   CHUNKING    │                                    │
│                     │               │                                    │
│                     │ Split by ##   │                                    │
│                     │ headers or    │                                    │
│                     │ paragraphs    │                                    │
│                     └───────┬───────┘                                    │
│                             │                                            │
│                             ▼                                            │
│                 ┌───────────────────────┐                                │
│                 │                       │                                │
│                 │    OPENAI EMBEDDINGS  │                                │
│                 │                       │                                │
│                 │  Convert text into    │                                │
│                 │  searchable vectors   │                                │
│                 │                       │                                │
│                 └───────────────────────┘                                │
│                             │                                            │
│                             ▼                                            │
│                 ┌───────────────────────┐                                │
│                 │                       │                                │
│                 │    VECTOR DATABASE    │                                │
│                 │                       │                                │
│                 │  Searchable knowledge │                                │
│                 │  base for the Mind    │                                │
│                 │                       │                                │
│                 └───────────────────────┘                                │
│                                                                          │
│   MODEL: OpenAI text-embedding-3-small (1536 dimensions)                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Chunking Strategy

All content is split using markdown headers:
- Split by `##` or `###` headers
- If no headers found, fall back to paragraph-based splitting (~500 chars)
- Each chunk is labeled with its source type (website, tickets, transcripts, research)

---

## Mind Creation Complete

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        MIND CREATED                                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   The Mind now has:                                                      │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │                                                             │       │
│   │   1. SYSTEM PROMPT (Core Identity)                          │       │
│   │      • Who it is                                            │       │
│   │      • Who it sells to                                      │       │
│   │      • How it communicates                                  │       │
│   │      • Key knowledge condensed                              │       │
│   │                                                             │       │
│   │   2. VECTOR DATABASE (Searchable Knowledge)                 │       │
│   │      • All detailed info from 4 sources                     │       │
│   │      • Searchable per conversation                          │       │
│   │                                                             │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
│   THIS PART IS SET IN STONE AND DOES NOT CHANGE                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

# PHASE 2: Mind Responds to Messages

## The Flexible Layer (Changeable Without Rebuilding Mind)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    FLEXIBLE CONTEXT (Changeable)                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  STATIC RULES / BIZ RULES                                   │       │
│   │  Sales strategy based on business model                     │       │
│   │  (HYROS users can switch business model on the fly)         │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  NEVER DO RULES                                             │       │
│   │  Things the Mind should never say/do                        │       │
│   │  (Users can add to this list anytime)                       │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  PAGE URL                                                   │       │
│   │  The page that triggered the original email                 │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  ADDITIONAL CONTEXT                                         │       │
│   │  Last-minute instructions (set in Stream Builder)           │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  CONVERSATION HISTORY                                       │       │
│   │  Initial email + all subsequent messages                    │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### DEFAULT STATIC RULES / BIZ RULES TEMPLATE

This is injected into the prompt wrapped in `<operating_rules>` tags:

```
## KNOWLEDGE HANDLING

When you receive information in <knowledge> tags:
- Use it naturally in your responses
- Never mention that you retrieved or looked up information
- Never reference the tags themselves
- Cite specific details when relevant

## BUYING STAGE RESPONSE RULES

### Curious Stage (Just exploring)
- Keep responses short (2-3 sentences max)
- Focus on value, not features
- One clear CTA

### Interested Stage (Engaged but uncertain)
- Share relevant proof points
- Address implicit concerns
- Suggest next step

### Evaluating Stage (Comparing options)
- Be specific about capabilities
- Acknowledge competitive landscape
- Offer concrete next steps

### Ready Stage (Decision mode)
- Remove friction
- Be direct about pricing/process
- Facilitate the decision

## RESPONSE FORMAT RULES

- Never use bullet points in cold emails
- Keep paragraphs to 2-3 sentences max
- Use "you" more than "we" or "I"
- End with a single, clear question or CTA
- Match the prospect's formality level

## BOUNDARIES

- Never discuss specific pricing without permission
- Never make guarantees about results
- Never disparage competitors by name
- If unsure, ask clarifying questions
- Suggest human handoff for complex technical questions
```

---

## Step 2.1 - Analyze the Message (Haiku)

When a prospect replies, Haiku analyzes what they're asking:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       MESSAGE ANALYSIS                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    Prospect Message                                      │
│                          │                                               │
│                          ▼                                               │
│              ┌───────────────────────┐                                   │
│              │                       │                                   │
│              │     CLAUDE HAIKU      │                                   │
│              │                       │                                   │
│              └───────────────────────┘                                   │
│                          │                                               │
│                          ▼                                               │
│              ┌───────────────────────┐                                   │
│              │      ANALYSIS         │                                   │
│              │                       │                                   │
│              │  • Buying Stage       │                                   │
│              │  • Warmth Level       │                                   │
│              │  • Hidden Concerns    │                                   │
│              │  • Search Queries     │                                   │
│              │  • Response Strategy  │                                   │
│              │                       │                                   │
│              └───────────────────────┘                                   │
│                                                                          │
│   MODEL: Claude Haiku                                                    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### HAIKU ANALYSIS PROMPT (Full Prompt)

```
You are an expert sales analyst. Analyze this prospect's message to help a sales AI craft the perfect response.

CONTEXT:
- Page they visited: {pageContext}
- Conversation history provided below

YOUR TASK:
Analyze the prospect's latest message and return a JSON analysis.

RETURN EXACTLY THIS JSON STRUCTURE (no markdown, no explanation, just valid JSON):
{
  "buying_stage": "curious|interested|evaluating|ready",
  "stage_evidence": "brief quote or observation supporting your stage assessment",
  "warmth": "cold|warming|warm|hot",
  "warmth_evidence": "brief quote or observation supporting your warmth assessment",
  "implicit_concerns": ["concern1", "concern2"],
  "intent": "What the prospect is really trying to accomplish with this message",
  "needs_search": true/false,
  "search_queries": ["query1", "query2"] or null if needs_search is false,
  "content_types": ["transcripts", "tickets", "website", "research"] or null,
  "response_strategy": {
    "approach": "How to approach the response (e.g., 'address concern directly', 'build curiosity', 'provide proof')",
    "tone": "professional|casual|empathetic|enthusiastic|consultative",
    "length": "brief|moderate|detailed",
    "key_focus": "The single most important thing to address"
  }
}

BUYING STAGE DEFINITIONS:
- curious: Just learning, no commitment signals
- interested: Engaged, asking questions, but not comparing options
- evaluating: Actively comparing, asking about specifics, pricing, competition
- ready: Showing intent to buy, asking about next steps, implementation

WARMTH DEFINITIONS:
- cold: Skeptical, short responses, resistance
- warming: Neutral, open to conversation
- warm: Positive engagement, multiple questions, showing interest
- hot: Enthusiastic, asking about next steps, ready to proceed

SEARCH QUERY GUIDELINES:
- Set needs_search to true if the prospect asks about features, pricing, capabilities, or anything that requires specific knowledge
- Set needs_search to false for greetings, simple acknowledgments, or emotional responses that don't need data
- search_queries should be specific semantic search phrases that would find relevant content
- content_types should filter to the most relevant types (e.g., ["pricing"] for pricing questions)

CONVERSATION HISTORY:
[History is appended here]

LATEST MESSAGE TO ANALYZE:
USER: [Message]

Respond with the JSON analysis only:
```

---

## Step 2.2 - Search Knowledge Base (RAG Query)

Based on Haiku's search queries, we find relevant information:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        RAG SEARCH                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│              Search Queries from Haiku                                   │
│                          │                                               │
│                          ▼                                               │
│              ┌───────────────────────┐                                   │
│              │                       │                                   │
│              │    OPENAI EMBEDDINGS  │                                   │
│              │                       │                                   │
│              │  Convert query to     │                                   │
│              │  searchable vector    │                                   │
│              │                       │                                   │
│              └───────────────────────┘                                   │
│                          │                                               │
│                          ▼                                               │
│              ┌───────────────────────┐                                   │
│              │                       │                                   │
│              │    VECTOR DATABASE    │                                   │
│              │                       │                                   │
│              │  Find most similar    │                                   │
│              │  chunks (top 8)       │                                   │
│              │                       │                                   │
│              └───────────────────────┘                                   │
│                          │                                               │
│                          ▼                                               │
│              ┌───────────────────────┐                                   │
│              │                       │                                   │
│              │   RELEVANT KNOWLEDGE  │                                   │
│              │                       │                                   │
│              │  [WEBSITE] chunk...   │                                   │
│              │  [TICKETS] chunk...   │                                   │
│              │  [TRANSCRIPTS] chunk..│                                   │
│              │                       │                                   │
│              └───────────────────────┘                                   │
│                                                                          │
│   MODEL: OpenAI text-embedding-3-small                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Step 2.3 - Generate Response (Sonnet)

Everything is assembled into a final prompt for Sonnet:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      FINAL PROMPT ASSEMBLY                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   The final prompt sent to Sonnet is assembled in this exact order:      │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  0. ROLE PREAMBLE (Fixed - Always Present)                  │       │
│   │     [Tells the agent it's a sales rep responding to a       │       │
│   │      prospect who replied to a cold email]                  │       │
│   ├─────────────────────────────────────────────────────────────┤       │
│   │  1. SYSTEM PROMPT (from Mind creation)                      │       │
│   │     [The extracted identity, ICP, tone, etc.]               │       │
│   ├─────────────────────────────────────────────────────────────┤       │
│   │  2. STATIC RULES wrapped in tags                            │       │
│   │     <operating_rules>                                       │       │
│   │     [Business model rules / sales strategy]                 │       │
│   │     </operating_rules>                                      │       │
│   ├─────────────────────────────────────────────────────────────┤       │
│   │  3. NEVER DO RULES wrapped in tags                          │       │
│   │     <never_do>                                              │       │
│   │     CRITICAL: You must NEVER do any of the following:       │       │
│   │     [User's never do rules]                                 │       │
│   │     </never_do>                                             │       │
│   ├─────────────────────────────────────────────────────────────┤       │
│   │  4. ADDITIONAL CONTEXT wrapped in tags                      │       │
│   │     <additional_context>                                    │       │
│   │     [User's last-minute instructions]                       │       │
│   │     </additional_context>                                   │       │
│   ├─────────────────────────────────────────────────────────────┤       │
│   │  5. HAIKU ANALYSIS wrapped in tags                          │       │
│   │     <prospect_analysis>                                     │       │
│   │     [Buying stage, warmth, concerns, strategy]              │       │
│   │     </prospect_analysis>                                    │       │
│   ├─────────────────────────────────────────────────────────────┤       │
│   │  6. RAG KNOWLEDGE wrapped in tags                           │       │
│   │     <knowledge>                                             │       │
│   │     [Retrieved chunks with type labels]                     │       │
│   │     </knowledge>                                            │       │
│   ├─────────────────────────────────────────────────────────────┤       │
│   │  7. RESPONSE INSTRUCTIONS                                   │       │
│   │     <response_instructions>                                 │       │
│   │     [How to craft the response]                             │       │
│   │     </response_instructions>                                │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
│   + CONVERSATION HISTORY (as messages)                                   │
│   + CURRENT MESSAGE                                                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### EXACT FINAL PROMPT STRUCTURE

Here is the exact template showing how each piece is wrapped and presented to Sonnet:

```
[ROLE PREAMBLE - Fixed, always present, not editable]
────────────────────────────────────────────────────────────────────────
You are a sales representative responding to a prospect who has replied
to a cold outreach email you previously sent. Your goal is to continue
this conversation naturally and move them toward a sale while being
genuinely helpful - not pushy.

The prospect received an initial email from you and has now replied.
You are continuing that conversation. Use the context below to understand
who you represent, how to communicate, and what knowledge you have
access to.
────────────────────────────────────────────────────────────────────────

[SYSTEM PROMPT - Extracted sections from Mind creation]

<operating_rules>
[STATIC RULES / BIZ RULES - The sales strategy template]
</operating_rules>

<never_do>
CRITICAL: You must NEVER do any of the following:
[USER'S NEVER DO RULES - Line by line]
</never_do>

<additional_context>
[USER'S ADDITIONAL CONTEXT - Last minute instructions]
</additional_context>

<prospect_analysis>
Current Buying Stage: [curious/interested/evaluating/ready]
Evidence: [Haiku's evidence quote]

Warmth Level: [cold/warming/warm/hot]
Evidence: [Haiku's evidence quote]

Implicit Concerns: [List of concerns or "None identified"]

Prospect Intent: [What they're really trying to accomplish]

Recommended Response Strategy:
- Approach: [How to approach]
- Tone: [professional/casual/empathetic/enthusiastic/consultative]
- Length: [brief/moderate/detailed]
- Key Focus: [Single most important thing]
</prospect_analysis>

<knowledge>
The following information was retrieved from our knowledge base. Use it to inform your response when relevant:

[WEBSITE] [Chunk text...]

---

[TICKETS] [Chunk text...]

---

[TRANSCRIPTS] [Chunk text...]
</knowledge>

<response_instructions>
Based on the prospect analysis above, craft your response following the recommended strategy. Key reminders:
- Match the recommended tone and length
- Address the key focus area
- Use knowledge from <knowledge> tags when relevant (but don't cite the tags themselves)
- Be natural and conversational - you're having a real sales conversation
- If you don't have information to answer a question, be honest and offer to find out
</response_instructions>
```

**Then the conversation messages are sent:**
- All previous messages (history)
- Current prospect message

**MODEL: Claude Sonnet**

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    MIND MODE - COMPLETE FLOW                                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ══════════════════════════════════════════════════════════════════════   │
│   PHASE 1: CREATE THE MIND (One-Time Setup)                                 │
│   ══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   Customer Data                    Business URLs                            │
│   ┌─────────┐ ┌─────────┐         ┌─────────────┐                          │
│   │Website  │ │Tickets  │         │   URLs      │                          │
│   │Transcripts│Research │         └──────┬──────┘                          │
│   └────┬────┘ └────┬────┘                │                                  │
│        │           │                     ▼                                  │
│        │           │            ┌─────────────────┐                         │
│        │           │            │ GEMINI DEEP     │                         │
│        │           │            │ RESEARCH        │                         │
│        │           │            └────────┬────────┘                         │
│        │           │                     │                                  │
│        └─────┬─────┴─────────────────────┘                                  │
│              │                                                              │
│              ▼                                                              │
│   ┌──────────────────────┐         ┌──────────────────────┐                │
│   │     OPUS 4.5         │         │  OPENAI EMBEDDINGS   │                │
│   │ (6 extraction        │         │  (Vectorization)     │                │
│   │  prompts)            │         └──────────┬───────────┘                │
│   └──────────┬───────────┘                    │                             │
│              │                                │                             │
│              ▼                                ▼                             │
│   ┌──────────────────┐            ┌──────────────────────┐                 │
│   │  SYSTEM PROMPT   │            │   VECTOR DATABASE    │                 │
│   │  (Mind Identity) │            │   (Searchable KB)    │                 │
│   └──────────────────┘            └──────────────────────┘                 │
│                                                                             │
│   ══════════════════════════════════════════════════════════════════════   │
│   PHASE 2: MIND RESPONDS (Every Message)                                    │
│   ══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│                         Prospect Message                                    │
│                               │                                             │
│                               ▼                                             │
│                     ┌─────────────────┐                                     │
│                     │   HAIKU         │                                     │
│                     │   (Analysis     │                                     │
│                     │    Prompt)      │                                     │
│                     └────────┬────────┘                                     │
│                              │                                              │
│              ┌───────────────┼───────────────┐                              │
│              │               │               │                              │
│              ▼               ▼               ▼                              │
│   ┌─────────────────┐ ┌───────────┐ ┌─────────────────┐                    │
│   │ Analysis Results│ │  OpenAI   │ │ Flexible Layer  │                    │
│   │ (JSON output)   │ │  (Search) │ │ • Static Rules  │                    │
│   │                 │ │     │     │ │ • Never Do      │                    │
│   │                 │ │     ▼     │ │ • Page URL      │                    │
│   │                 │ │  Relevant │ │ • Context       │                    │
│   └────────┬────────┘ │ Knowledge │ │ • Chat History  │                    │
│            │          └─────┬─────┘ └────────┬────────┘                    │
│            │                │                │                              │
│            └────────────────┼────────────────┘                              │
│                             │                                               │
│              System Prompt + All Context                                    │
│              (assembled with XML tags)                                      │
│                             │                                               │
│                             ▼                                               │
│                     ┌─────────────────┐                                     │
│                     │    SONNET       │                                     │
│                     │   (Response)    │                                     │
│                     └────────┬────────┘                                     │
│                              │                                              │
│                              ▼                                              │
│                     ┌─────────────────┐                                     │
│                     │  MIND RESPONSE  │                                     │
│                     │  (To Prospect)  │                                     │
│                     └─────────────────┘                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Models & Prompts Summary

| Step | Model | Prompt/Purpose |
|------|-------|----------------|
| Business Research | **Gemini Deep Research** | Web research on business URLs |
| Identity Extraction | **Claude Opus 4.5** | "Extract a 2-3 sentence identity statement..." |
| ICP Extraction | **Claude Opus 4.5** | "Extract the Ideal Customer Profile..." |
| Email Framework Extraction | **Claude Opus 4.5** | "Distill email strategy into actionable rules..." |
| Tone Extraction | **Claude Opus 4.5** | "Extract tone and voice guidelines..." |
| Objection Extraction | **Claude Opus 4.5** | "Extract top 10-15 objections with responses..." |
| Competitive Extraction | **Claude Opus 4.5** | "Extract competitive positioning..." |
| Vectorization | **OpenAI Embeddings** | Convert chunks to 1536-dim vectors |
| Message Analysis | **Claude Haiku** | Full analysis prompt (see above) |
| RAG Search | **OpenAI Embeddings** | Convert query to vector, find similar |
| Response Generation | **Claude Sonnet** | Assembled prompt with XML tags (see above) |

---

## What HYROS Users Can Change

| Setting | Changeable? | Where |
|---------|-------------|-------|
| Business Model / Static Rules | Yes | Mind settings |
| Never Do Rules | Yes (add to list) | Mind settings |
| Additional Context | Yes | Stream Builder email module |
| Page URL | Yes | Per email trigger |
| System Prompt | No | Requires Mind rebuild |
| RAG Data | No | Requires Mind rebuild |

---

## Key XML Tags Used

| Tag | Purpose | When Added |
|-----|---------|------------|
| `<operating_rules>` | Contains static rules / business strategy | Always |
| `<never_do>` | Contains user's "never do" rules | If rules exist |
| `<additional_context>` | Contains last-minute instructions | If context exists |
| `<prospect_analysis>` | Contains Haiku's analysis output | Always |
| `<knowledge>` | Contains retrieved RAG chunks | If search was needed |
| `<response_instructions>` | Final instructions for response | Always |
