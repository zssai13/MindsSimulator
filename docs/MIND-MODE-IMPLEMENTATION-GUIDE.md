# Mind Mode Implementation Guide

## Complete Technical Reference for AI Sales Representative System

**Purpose:** This document provides exhaustive technical detail on how the Mind Mode AI sales system works, from raw data input to final response generation. Use this as a reference when asking Claude questions about any part of the implementation.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Phase 1: Mind Creation (Build Phase)](#2-phase-1-mind-creation-build-phase)
3. [Phase 2: Runtime Response Generation](#3-phase-2-runtime-response-generation)
4. [Data Structures](#4-data-structures)
5. [Complete Prompt Reference](#5-complete-prompt-reference)
6. [RAG System Details](#6-rag-system-details)
7. [Final Prompt Assembly](#7-final-prompt-assembly)
8. [Model Selection Rationale](#8-model-selection-rationale)
9. [Error Handling & Edge Cases](#9-error-handling--edge-cases)
10. [Configuration & Customization](#10-configuration--customization)

---

## 1. System Overview

### What This System Does

This is an AI sales representative that:
- Responds to prospects who reply to cold outreach emails
- Analyzes each message to understand buying intent and emotional state
- Retrieves relevant knowledge from a vector database
- Generates contextually appropriate responses
- Maintains conversation history

### Two-Phase Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MIND MODE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PHASE 1: MIND CREATION (One-Time)                                      │
│  ─────────────────────────────────                                      │
│  Input: 4 types of business data (markdown files)                       │
│  Process: 6 parallel extraction calls to Claude Opus                    │
│  Output: System prompt containing extracted business knowledge          │
│  Cost: ~$0.50-2.00 total (one-time)                                     │
│                                                                         │
│  PHASE 2: RUNTIME (Per-Message)                                         │
│  ─────────────────────────────────                                      │
│  Input: Prospect message + conversation history                         │
│  Process: Haiku analysis → RAG retrieval → Sonnet generation            │
│  Output: AI response to prospect                                        │
│  Cost: ~$0.02-0.03 per message                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why Two Phases?

**Cost Optimization:** Opus is 10x more expensive than Sonnet. By using Opus only once during Mind creation, we get high-quality extraction without per-message Opus costs.

**Separation of Concerns:**
- Phase 1 = "What the AI knows" (business knowledge, extracted once)
- Phase 2 = "How the AI behaves" (rules, analysis, responses per message)

---

## 2. Phase 1: Mind Creation (Build Phase)

### Input Data Types

The system accepts 4 types of pre-cleaned markdown files:

| Type | Description | Example Content |
|------|-------------|-----------------|
| `transcripts` | Sales call recordings/notes | "Customer asked about pricing, mentioned competitor X..." |
| `tickets` | Support ticket summaries | "Issue: Integration failed. Resolution: API key was..." |
| `website` | Marketing/product content | "Our platform helps teams collaborate with AI-powered..." |
| `research` | Market/competitive research | "Competitor analysis: Company X charges $99/mo for..." |

### Data Combination

All 4 data types are concatenated into a single combined document:

```typescript
// From app/api/generate-prompt/route.ts
const combinedData = `
## Sales Transcripts
${cleanedData.transcripts || 'No transcripts provided.'}

## Support Tickets
${cleanedData.tickets || 'No tickets provided.'}

## Website Content
${cleanedData.website || 'No website content provided.'}

## Research & Competitive Intel
${cleanedData.research || 'No research provided.'}
`;
```

**Why combine?** Each extraction prompt needs access to ALL data because:
- Identity might come from website + transcripts
- Objections might come from tickets + transcripts + research
- Competitive positioning needs research + website + transcripts

### The 6 Extraction Prompts

The combined data is sent to Claude Opus 6 times, each with a different extraction prompt. These run sequentially with 1-second delays to avoid rate limits.

#### Extraction 1: Identity & Positioning

```
You are an expert at analyzing business data to extract company identity and positioning.

Given the following business data, extract and synthesize:
1. Company name and what they do
2. Core value proposition (1-2 sentences)
3. Key differentiators from competitors
4. Target market/industry focus
5. Brand voice characteristics

Format your response as clear, usable content for a sales AI's system prompt.
Focus on what makes this company unique and how they should present themselves.

<business_data>
{combinedData}
</business_data>

Extract the identity and positioning information:
```

**Output Example:**
```
Company: Acme Analytics
What We Do: AI-powered business intelligence platform that turns raw data into actionable insights.

Value Proposition: We help mid-market companies make data-driven decisions 10x faster without needing a data science team.

Key Differentiators:
- No-code interface (competitors require SQL)
- Real-time dashboards (competitors batch process overnight)
- Industry-specific templates (competitors are generic)

Target Market: Mid-market B2B companies (100-1000 employees) in SaaS, e-commerce, and financial services.

Brand Voice: Professional but approachable. We simplify complexity. We're confident but not arrogant.
```

#### Extraction 2: ICP (Ideal Customer Profile)

```
You are an expert at analyzing business data to identify ideal customer profiles.

Given the following business data, extract and synthesize:
1. Primary ICP characteristics (company size, industry, role)
2. Common pain points these customers have
3. Triggers that cause them to seek solutions
4. Decision-making process and stakeholders
5. Budget expectations and buying timeline

Format your response as clear, usable content for a sales AI to understand who they're selling to.

<business_data>
{combinedData}
</business_data>

Extract the ideal customer profile:
```

**Output Example:**
```
Primary ICP:
- Company Size: 100-1000 employees
- Industries: SaaS, E-commerce, Financial Services
- Key Roles: VP of Operations, Head of Analytics, CFO

Pain Points:
- Drowning in data but starving for insights
- Data team backlog is 6+ months
- Making decisions on gut feel, not data
- Competitors are more data-driven

Buying Triggers:
- Just raised funding (need to show metrics to board)
- New executive hire (wants to make data-driven changes)
- Lost deal to data-driven competitor
- Annual planning season

Decision Process:
- Champion: Usually VP Ops or Head of Analytics
- Economic Buyer: CFO or CEO
- Timeline: 2-4 weeks for mid-market, 2-3 months for enterprise
- Budget: $2k-10k/month depending on company size
```

#### Extraction 3: Email Framework

```
You are an expert at analyzing sales communication patterns.

Given the following business data, extract and synthesize:
1. Effective email subject line patterns
2. Opening hook strategies that work
3. Value proposition framing that resonates
4. Call-to-action approaches
5. Follow-up cadence and messaging

Format your response as actionable guidelines for a sales AI writing emails.

<business_data>
{combinedData}
</business_data>

Extract the email framework:
```

**Output Example:**
```
Subject Line Patterns:
- Question format: "Quick question about [their specific challenge]"
- Peer reference: "[Similar company] increased efficiency by 40%"
- Direct value: "Cut your reporting time from days to minutes"

Opening Hooks:
- Reference their specific situation: "Noticed you're scaling your analytics team..."
- Trigger event: "Congrats on the Series B - that usually means..."
- Pain acknowledgment: "Most [role] I talk to are frustrated by..."

Value Framing:
- Lead with outcome, not features
- Use specific numbers when possible
- Connect to their business goals, not our product

CTAs:
- Low commitment: "Worth a 15-min call to see if there's a fit?"
- Value-first: "Happy to share how [similar company] approached this"
- Direct: "Open to a quick demo this week?"

Follow-up Cadence:
- Day 3: Different angle, same value prop
- Day 7: Social proof / case study
- Day 14: Breakup email
```

#### Extraction 4: Tone & Communication Rules

```
You are an expert at analyzing communication style and tone.

Given the following business data, extract and synthesize:
1. Appropriate formality level
2. Industry-specific language to use/avoid
3. Humor and personality guidelines
4. Response length preferences
5. Communication dos and don'ts

Format your response as clear tone guidelines for a sales AI.

<business_data>
{combinedData}
</business_data>

Extract the tone and communication rules:
```

**Output Example:**
```
Formality Level: Professional-casual
- Use contractions (we're, you'll, it's)
- First names after initial introduction
- No jargon unless they use it first

Industry Language:
- USE: ROI, data-driven, insights, dashboards, KPIs
- AVOID: Synergy, leverage, circle back, touch base
- MATCH: If they say "metrics," say "metrics" not "KPIs"

Personality:
- Confident but not pushy
- Helpful, not salesy
- Brief humor okay, don't force it
- Show genuine curiosity about their business

Response Length:
- Initial outreach: 3-4 sentences max
- Follow-ups: 2-3 sentences
- Detailed answers: Use bullets, keep paragraphs short

Dos:
- Ask thoughtful questions
- Acknowledge their concerns before addressing
- Be specific, not generic

Don'ts:
- Don't oversell or overpromise
- Don't badmouth competitors directly
- Don't use "just checking in" or "circling back"
```

#### Extraction 5: Objection Handling Playbook

```
You are an expert at analyzing sales objection patterns and responses.

Given the following business data, extract and synthesize:
1. Common objections prospects raise
2. Root causes behind each objection
3. Effective responses and reframes
4. Questions to ask when objections arise
5. When to push vs. when to back off

Format your response as an objection handling playbook for a sales AI.

<business_data>
{combinedData}
</business_data>

Extract the objection handling playbook:
```

**Output Example:**
```
OBJECTION: "It's too expensive"
Root Cause: Usually means they don't see the value yet, not actual budget issue
Response: "Totally fair - can I ask what you're comparing it to? I want to make sure I'm showing you the right value."
Questions: "What would solving [their pain] be worth to your team?"
Push/Back Off: Push gently with ROI framing. Back off if they cite specific budget constraints.

OBJECTION: "We're already using [Competitor]"
Root Cause: Switching cost concern, or genuinely happy
Response: "Nice - how's that working for you? Any gaps you've noticed?"
Questions: "What made you choose them originally? Has anything changed since then?"
Push/Back Off: Only push if they mention frustrations. Otherwise, plant seeds for future.

OBJECTION: "Not the right time"
Root Cause: Either genuinely busy or polite rejection
Response: "Totally understand. When would be a better time to revisit this?"
Questions: "Is there a specific event or timeline driving that?"
Push/Back Off: Get specific timing. If vague, it's a soft no - offer value and move on.

OBJECTION: "Need to talk to my team/boss"
Root Cause: Either real or stall tactic
Response: "Of course - would it help if I put together a one-pager they can review?"
Questions: "What do you think their main concerns would be?"
Push/Back Off: Offer to help them sell internally. Don't push for meeting with boss directly.

OBJECTION: "Send me more info"
Root Cause: Often a brush-off, sometimes genuine interest
Response: "Happy to - what specifically would be most useful?"
Questions: "Are you evaluating other solutions right now?"
Push/Back Off: Qualify interest before sending generic materials. Specific > Generic.
```

#### Extraction 6: Competitive Positioning

```
You are an expert at analyzing competitive landscapes.

Given the following business data, extract and synthesize:
1. Key competitors and their positioning
2. Our advantages over each competitor
3. Their advantages over us (be honest)
4. How to handle competitor mentions
5. Competitive landmines to avoid

Format your response as competitive intelligence for a sales AI.

<business_data>
{combinedData}
</business_data>

Extract the competitive positioning:
```

**Output Example:**
```
COMPETITOR: DataCo
Their Positioning: Enterprise-grade analytics for large companies
Our Advantages:
- 10x faster implementation (days vs months)
- No SQL required (they need technical users)
- 60% lower cost for mid-market
Their Advantages:
- Better for 5000+ employee companies
- More compliance certifications
- Larger partner ecosystem
Handle Mentions: "Great for enterprise - we focus on mid-market where speed matters more than customization"
Landmine: Don't claim we can do enterprise-scale. We can't (yet).

COMPETITOR: QuickCharts
Their Positioning: Simple dashboards for small teams
Our Advantages:
- Real-time data (they batch overnight)
- More data source integrations
- Better for growing companies
Their Advantages:
- Cheaper for very small teams
- Simpler learning curve
Handle Mentions: "Perfect for startups - we're for when you've outgrown simple dashboards"
Landmine: Don't compete on price with them for <50 employee companies.

GENERAL RULES:
- Never badmouth competitors directly
- Acknowledge their strengths, pivot to our differentiators
- Focus on fit, not "better" - different companies need different things
- If they're deep in competitor eval, ask what criteria matter most
```

### System Prompt Assembly

After all 6 extractions complete, they are concatenated (no synthesis prompt):

```typescript
// From app/api/generate-prompt/route.ts
function assembleSystemPrompt(sections: ExtractedSections): string {
  const parts: string[] = [];

  if (sections.identity) {
    parts.push(`## Identity & Positioning\n${sections.identity}`);
  }
  if (sections.icp) {
    parts.push(`## Ideal Customer Profile\n${sections.icp}`);
  }
  if (sections.email_framework) {
    parts.push(`## Email Framework\n${sections.email_framework}`);
  }
  if (sections.tone) {
    parts.push(`## Tone & Communication\n${sections.tone}`);
  }
  if (sections.objections) {
    parts.push(`## Objection Handling\n${sections.objections}`);
  }
  if (sections.competitive) {
    parts.push(`## Competitive Positioning\n${sections.competitive}`);
  }

  return parts.join('\n\n---\n\n');
}
```

**Why no synthesis prompt?**
- Mechanical concatenation is deterministic and predictable
- Each section is already well-formatted by its extraction prompt
- Avoids another expensive Opus call
- Prevents synthesis from losing or altering extracted information

### Output of Phase 1

A system prompt structured like:

```
## Identity & Positioning
[Extracted identity content]

---

## Ideal Customer Profile
[Extracted ICP content]

---

## Email Framework
[Extracted email framework content]

---

## Tone & Communication
[Extracted tone rules content]

---

## Objection Handling
[Extracted objection playbook content]

---

## Competitive Positioning
[Extracted competitive intel content]
```

This system prompt is stored and used for every message in Phase 2.

---

## 3. Phase 2: Runtime Response Generation

### Overview

For each prospect message, the system runs a 3-step pipeline:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     RUNTIME PIPELINE (Per Message)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  STEP 1: HAIKU ANALYSIS                                                 │
│  ─────────────────────                                                  │
│  Input: Prospect message + conversation history                         │
│  Model: Claude Haiku (fast, cheap)                                      │
│  Output: Structured analysis (buying stage, warmth, search queries)     │
│  Cost: ~$0.002                                                          │
│  Latency: ~500ms                                                        │
│                                                                         │
│                              ↓                                          │
│                                                                         │
│  STEP 2: RAG RETRIEVAL                                                  │
│  ─────────────────────                                                  │
│  Input: Search queries from Haiku                                       │
│  Model: OpenAI text-embedding-3-small                                   │
│  Process: Embed queries → Vector search → Return top chunks             │
│  Output: Relevant knowledge chunks                                      │
│  Cost: ~$0.001                                                          │
│  Latency: ~300ms                                                        │
│                                                                         │
│                              ↓                                          │
│                                                                         │
│  STEP 3: SONNET GENERATION                                              │
│  ────────────────────────                                               │
│  Input: Everything assembled into final prompt                          │
│  Model: Claude Sonnet (balanced quality/cost)                           │
│  Output: Response to prospect                                           │
│  Cost: ~$0.015-0.02                                                     │
│  Latency: ~1-2s                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Step 1: Haiku Analysis

#### Purpose

Before responding, we need to understand:
- Where is this prospect in their buying journey?
- How engaged/warm are they?
- What are they really concerned about (even if not stated)?
- What information should we retrieve to help answer them?
- How should we approach this response?

#### Input

```typescript
// From app/api/analyze/route.ts
interface AnalyzeRequest {
  message: string;           // Current prospect message
  pageUrl?: string;          // What page they came from (if known)
  history?: Array<{          // Previous conversation
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

#### The Haiku Analysis Prompt

```
You are an expert sales analyst. Your job is to analyze a prospect's message and provide structured insights to help craft the perfect response.

Analyze the following message from a prospect who is replying to a cold outreach email.

<context>
Page URL they visited: {pageUrl || 'Unknown'}

Conversation history:
{history formatted as User:/Assistant: pairs}

Current message from prospect:
{message}
</context>

Provide your analysis in the following JSON format:
{
  "buying_stage": "curious|interested|evaluating|ready",
  "stage_evidence": "Quote or observation that supports your stage assessment",
  "warmth": "cold|warming|warm|hot",
  "warmth_evidence": "Quote or observation that supports your warmth assessment",
  "implicit_concerns": ["concern1", "concern2"],
  "intent": "What the prospect is really trying to accomplish",
  "rag_queries": ["search query 1", "search query 2"],
  "response_strategy": {
    "approach": "How to approach this response",
    "tone": "professional|casual|empathetic|enthusiastic|consultative",
    "length": "brief|moderate|detailed",
    "key_focus": "The single most important thing to address"
  }
}

Important guidelines:
- buying_stage: curious (just checking), interested (engaged but early), evaluating (comparing options), ready (close to decision)
- warmth: cold (skeptical/distant), warming (opening up), warm (engaged/positive), hot (very interested/urgent)
- implicit_concerns: What they might be worried about but didn't explicitly say
- rag_queries: 2-3 specific search queries to find relevant information in our knowledge base. Be specific.
- response_strategy: Tactical guidance for how to respond

Respond ONLY with valid JSON, no other text.
```

#### Output Structure

```typescript
interface HaikuAnalysis {
  buying_stage: 'curious' | 'interested' | 'evaluating' | 'ready';
  stage_evidence: string;
  warmth: 'cold' | 'warming' | 'warm' | 'hot';
  warmth_evidence: string;
  implicit_concerns: string[];
  intent: string;
  rag_queries: string[];
  response_strategy: {
    approach: string;
    tone: 'professional' | 'casual' | 'empathetic' | 'enthusiastic' | 'consultative';
    length: 'brief' | 'moderate' | 'detailed';
    key_focus: string;
  };
}
```

#### Example Analysis

**Prospect Message:** "This looks interesting but we're already using Salesforce. How would this integrate?"

**Haiku Output:**
```json
{
  "buying_stage": "evaluating",
  "stage_evidence": "Asking about integration specifics shows active consideration",
  "warmth": "warming",
  "warmth_evidence": "\"This looks interesting\" indicates positive initial impression",
  "implicit_concerns": [
    "Worried about disruption to existing workflow",
    "Concerned about implementation complexity",
    "May fear data migration issues"
  ],
  "intent": "Understand if switching/adding is worth the effort",
  "rag_queries": [
    "Salesforce integration capabilities",
    "CRM integration process",
    "data migration from Salesforce"
  ],
  "response_strategy": {
    "approach": "Acknowledge Salesforce, show integration is seamless, reduce friction concerns",
    "tone": "consultative",
    "length": "moderate",
    "key_focus": "Integration is easy and complements (not replaces) Salesforce"
  }
}
```

### Step 2: RAG Retrieval

#### Purpose

Retrieve relevant knowledge to help answer the prospect's specific question/concern.

#### Input

The `rag_queries` array from Haiku's analysis:
```json
["Salesforce integration capabilities", "CRM integration process", "data migration from Salesforce"]
```

#### Process

1. **Embed each query** using OpenAI text-embedding-3-small (1536 dimensions)
2. **Vector search** against Supabase pgvector database
3. **Return top chunks** across all queries (deduplicated)

```typescript
// From lib/vectorstore/index.ts
export async function query(
  queryText: string,
  limit: number = 5,
  filterTypes?: string[]
): Promise<RagChunk[]> {
  // 1. Generate embedding for query
  const embedding = await generateEmbedding(queryText);

  // 2. Call Supabase match_chunks function
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: embedding,
    match_count: limit,
    filter_types: filterTypes || null  // null = search all types
  });

  // 3. Return chunks with similarity scores
  return data.map(row => ({
    id: row.id,
    text: row.text,
    metadata: {
      type: row.type,
      topic: row.topic
    },
    similarity: row.similarity
  }));
}
```

#### Chunking Strategy

When content is vectorized, it's split into chunks:

```typescript
// From lib/vectorstore/chunk.ts
export function chunkContent(content: string, type: RagType): TextChunk[] {
  // Split by ## headers first
  const sections = content.split(/(?=^## )/gm);

  const chunks: TextChunk[] = [];

  for (const section of sections) {
    if (section.trim().length < 50) continue;

    // If section is too long, split by paragraphs
    if (section.length > 1500) {
      const paragraphs = section.split(/\n\n+/);
      let currentChunk = '';

      for (const para of paragraphs) {
        if (currentChunk.length + para.length > 1500) {
          if (currentChunk.trim()) {
            chunks.push({ text: currentChunk.trim(), type });
          }
          currentChunk = para;
        } else {
          currentChunk += '\n\n' + para;
        }
      }

      if (currentChunk.trim()) {
        chunks.push({ text: currentChunk.trim(), type });
      }
    } else {
      chunks.push({ text: section.trim(), type });
    }
  }

  return chunks;
}
```

**Chunk Size Target:** ~500-1500 characters per chunk
**Why this size?**
- Small enough to be specific and relevant
- Large enough to contain complete thoughts
- Fits well in context window when retrieving 5-8 chunks

#### Output Structure

```typescript
interface RagChunk {
  id: string;
  text: string;
  metadata: {
    type: 'transcripts' | 'tickets' | 'website' | 'research';
    topic?: string;
  };
  similarity: number;  // 0-1, higher = more relevant
}
```

#### Example Output

```json
[
  {
    "id": "chunk_abc123",
    "text": "## Salesforce Integration\n\nOur platform integrates natively with Salesforce via a managed package. Installation takes 5 minutes. Data syncs bi-directionally in real-time. No coding required.\n\nKey features:\n- Automatic contact sync\n- Opportunity data enrichment\n- Activity logging\n- Custom field mapping",
    "metadata": { "type": "website" },
    "similarity": 0.89
  },
  {
    "id": "chunk_def456",
    "text": "Customer ticket: \"How long does Salesforce integration take?\"\n\nResolution: Walked customer through managed package install. Completed in under 10 minutes including OAuth setup. Customer was surprised how easy it was compared to their previous tool which took 2 weeks.",
    "metadata": { "type": "tickets" },
    "similarity": 0.84
  },
  {
    "id": "chunk_ghi789",
    "text": "From sales call with Acme Corp:\n\n\"We were worried about the Salesforce integration because our last vendor's took forever. But yours was literally click-click-done. My team was using it the same afternoon.\"",
    "metadata": { "type": "transcripts" },
    "similarity": 0.81
  }
]
```

### Step 3: Sonnet Response Generation

#### Purpose

Generate the actual response to send to the prospect, using everything assembled.

#### Final Prompt Assembly

The system assembles everything into a single system prompt for Sonnet:

```typescript
// From app/api/generate/route.ts
function assemblePrompt({
  systemPrompt,      // From Phase 1 (extracted sections)
  templateRules,     // Static rules from Tab 2
  userRules,         // "Never Do" rules from Tab 2
  analysis,          // From Haiku
  knowledge,         // From RAG
  additionalContext, // User's optional instructions
}): string {
  const parts: string[] = [];

  // 0. Fixed role preamble (always present)
  parts.push(ROLE_PREAMBLE);

  // 1. Base system prompt (extracted from data in Tab 1)
  if (systemPrompt) {
    parts.push(systemPrompt);
  }

  // 2. Static rules (template rules)
  if (templateRules) {
    parts.push(`
<operating_rules>
${templateRules}
</operating_rules>`);
  }

  // 3. User-defined "Never Do" rules
  if (userRules && userRules.trim()) {
    parts.push(`
<never_do>
CRITICAL: You must NEVER do any of the following:
${userRules}
</never_do>`);
  }

  // 4. Additional context from user
  if (additionalContext) {
    parts.push(`
<additional_context>
${additionalContext}
</additional_context>`);
  }

  // 5. Analysis from Haiku
  parts.push(`
<prospect_analysis>
Current Buying Stage: ${analysis.buying_stage}
Evidence: ${analysis.stage_evidence}

Warmth Level: ${analysis.warmth}
Evidence: ${analysis.warmth_evidence}

Implicit Concerns: ${analysis.implicit_concerns.length > 0 ? analysis.implicit_concerns.join(', ') : 'None identified'}

Prospect Intent: ${analysis.intent}

Recommended Response Strategy:
- Approach: ${analysis.response_strategy.approach}
- Tone: ${analysis.response_strategy.tone}
- Length: ${analysis.response_strategy.length}
- Key Focus: ${analysis.response_strategy.key_focus}
</prospect_analysis>`);

  // 6. Retrieved knowledge (if any)
  if (knowledge.length > 0) {
    const knowledgeText = knowledge
      .map((chunk) => {
        const typeLabel = chunk.metadata.type.toUpperCase();
        return `[${typeLabel}] ${chunk.text}`;
      })
      .join('\n\n---\n\n');

    parts.push(`
<knowledge>
The following information was retrieved from our knowledge base. Use it to inform your response when relevant:

${knowledgeText}
</knowledge>`);
  }

  // 7. Response instructions
  parts.push(`
<response_instructions>
Based on the prospect analysis above, craft your response following the recommended strategy. Key reminders:
- Match the recommended tone and length
- Address the key focus area
- Use knowledge from <knowledge> tags when relevant (but don't cite the tags themselves)
- Be natural and conversational - you're having a real sales conversation
- If you don't have information to answer a question, be honest and offer to find out
</response_instructions>`);

  return parts.join('\n\n');
}
```

#### The Role Preamble

This fixed text always appears first:

```typescript
const ROLE_PREAMBLE = `You are a sales representative responding to a prospect who has replied to a cold outreach email you previously sent. Your goal is to continue this conversation naturally and move them toward a sale while being genuinely helpful - not pushy.

The prospect received an initial email from you and has now replied. You are continuing that conversation. Use the context below to understand who you represent, how to communicate, and what knowledge you have access to.`;
```

**Why is this hardcoded?**
- Ensures Sonnet always knows its fundamental role
- Can't be accidentally removed or modified
- Sets the right frame before any other context

#### Default Template Rules

```typescript
const DEFAULT_TEMPLATE_RULES = `## Response Guidelines

### Knowledge Handling
- Use information from <knowledge> tags when directly relevant
- Don't quote or reference the tags themselves
- If asked something not in your knowledge, say you'll find out
- Never make up features, pricing, or capabilities

### Buying Stage Behavior
- CURIOUS: Keep it light, focus on value, invite questions
- INTERESTED: Share more detail, use social proof
- EVALUATING: Address comparisons, offer specifics
- READY: Remove friction, guide to next step

### Response Format
- Match the length guidance in prospect_analysis
- Use short paragraphs and bullets for readability
- End with a clear but soft call-to-action
- Don't be pushy or use high-pressure tactics

### Conversation Flow
- Acknowledge what they said before responding
- Answer their question directly, then expand if appropriate
- Ask a relevant follow-up question when natural
- Keep the conversation moving forward`;
```

#### API Call to Sonnet

```typescript
// From app/api/generate/route.ts
const response = await anthropic.messages.create({
  model: MODELS.SONNET,           // claude-3-5-sonnet-20241022
  max_tokens: 2048,
  system: finalPrompt,            // Everything assembled above
  messages: messages,             // Conversation history + current message
});
```

#### Example Response

Given the Salesforce integration question, Sonnet might respond:

```
Great question! Integration is actually one of our strongest points.

Our Salesforce integration is a managed package - takes about 5 minutes to install, no coding needed. Data syncs both ways in real-time, so your team can work in whichever tool they prefer.

One of our customers mentioned they were worried about this too (previous vendor took weeks), but they were up and running the same afternoon.

Would it help if I walked you through what the setup looks like? Happy to do a quick screen share.
```

---

## 4. Data Structures

### Build Store State

```typescript
interface BuildState {
  // Input data (pre-cleaned markdown files)
  cleanedData: {
    transcripts: string | null;
    tickets: string | null;
    website: string | null;
    research: string | null;
  };

  // Output from Phase 1
  systemPrompt: string;

  // UI state
  generatingPrompt: boolean;
}
```

### Chat Store State

```typescript
interface ChatState {
  // From Tab 1 or manual input
  systemPrompt: string;

  // Editable in Tab 2
  templateRules: string;
  userRules: string;

  // Context inputs
  pageUrl: string;
  additionalContext: string;
  initialEmail: string;

  // Conversation
  messages: Message[];

  // Last analysis (for debug panel)
  lastAnalysis: HaikuAnalysis | null;
  lastRagResults: RagChunk[] | null;
  lastFinalPrompt: string | null;

  // UI state
  isAnalyzing: boolean;
  isGenerating: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  debug?: {
    analysis: HaikuAnalysis;
    ragResults: RagChunk[];
    finalPrompt: string;
  };
}
```

### RAG Store State

```typescript
interface RagState {
  // Files by type
  files: {
    transcripts: File[];
    tickets: File[];
    website: File[];
    research: File[];
  };

  // Status per type
  status: {
    transcripts: 'empty' | 'uploaded' | 'vectorizing' | 'ready';
    tickets: 'empty' | 'uploaded' | 'vectorizing' | 'ready';
    website: 'empty' | 'uploaded' | 'vectorizing' | 'ready';
    research: 'empty' | 'uploaded' | 'vectorizing' | 'ready';
  };

  // Chunk counts
  chunkCounts: {
    transcripts: number;
    tickets: number;
    website: number;
    research: number;
  };
}
```

---

## 5. Complete Prompt Reference

### All Prompts in One Place

#### Role Preamble (Fixed, Runtime)
```
You are a sales representative responding to a prospect who has replied to a cold outreach email you previously sent. Your goal is to continue this conversation naturally and move them toward a sale while being genuinely helpful - not pushy.

The prospect received an initial email from you and has now replied. You are continuing that conversation. Use the context below to understand who you represent, how to communicate, and what knowledge you have access to.
```

#### Identity Extraction (Opus, Build)
```
You are an expert at analyzing business data to extract company identity and positioning.

Given the following business data, extract and synthesize:
1. Company name and what they do
2. Core value proposition (1-2 sentences)
3. Key differentiators from competitors
4. Target market/industry focus
5. Brand voice characteristics

Format your response as clear, usable content for a sales AI's system prompt.
Focus on what makes this company unique and how they should present themselves.

<business_data>
{combinedData}
</business_data>

Extract the identity and positioning information:
```

#### ICP Extraction (Opus, Build)
```
You are an expert at analyzing business data to identify ideal customer profiles.

Given the following business data, extract and synthesize:
1. Primary ICP characteristics (company size, industry, role)
2. Common pain points these customers have
3. Triggers that cause them to seek solutions
4. Decision-making process and stakeholders
5. Budget expectations and buying timeline

Format your response as clear, usable content for a sales AI to understand who they're selling to.

<business_data>
{combinedData}
</business_data>

Extract the ideal customer profile:
```

#### Email Framework Extraction (Opus, Build)
```
You are an expert at analyzing sales communication patterns.

Given the following business data, extract and synthesize:
1. Effective email subject line patterns
2. Opening hook strategies that work
3. Value proposition framing that resonates
4. Call-to-action approaches
5. Follow-up cadence and messaging

Format your response as actionable guidelines for a sales AI writing emails.

<business_data>
{combinedData}
</business_data>

Extract the email framework:
```

#### Tone Extraction (Opus, Build)
```
You are an expert at analyzing communication style and tone.

Given the following business data, extract and synthesize:
1. Appropriate formality level
2. Industry-specific language to use/avoid
3. Humor and personality guidelines
4. Response length preferences
5. Communication dos and don'ts

Format your response as clear tone guidelines for a sales AI.

<business_data>
{combinedData}
</business_data>

Extract the tone and communication rules:
```

#### Objection Handling Extraction (Opus, Build)
```
You are an expert at analyzing sales objection patterns and responses.

Given the following business data, extract and synthesize:
1. Common objections prospects raise
2. Root causes behind each objection
3. Effective responses and reframes
4. Questions to ask when objections arise
5. When to push vs. when to back off

Format your response as an objection handling playbook for a sales AI.

<business_data>
{combinedData}
</business_data>

Extract the objection handling playbook:
```

#### Competitive Positioning Extraction (Opus, Build)
```
You are an expert at analyzing competitive landscapes.

Given the following business data, extract and synthesize:
1. Key competitors and their positioning
2. Our advantages over each competitor
3. Their advantages over us (be honest)
4. How to handle competitor mentions
5. Competitive landmines to avoid

Format your response as competitive intelligence for a sales AI.

<business_data>
{combinedData}
</business_data>

Extract the competitive positioning:
```

#### Haiku Analysis (Haiku, Runtime)
```
You are an expert sales analyst. Your job is to analyze a prospect's message and provide structured insights to help craft the perfect response.

Analyze the following message from a prospect who is replying to a cold outreach email.

<context>
Page URL they visited: {pageUrl}

Conversation history:
{history}

Current message from prospect:
{message}
</context>

Provide your analysis in the following JSON format:
{
  "buying_stage": "curious|interested|evaluating|ready",
  "stage_evidence": "Quote or observation that supports your stage assessment",
  "warmth": "cold|warming|warm|hot",
  "warmth_evidence": "Quote or observation that supports your warmth assessment",
  "implicit_concerns": ["concern1", "concern2"],
  "intent": "What the prospect is really trying to accomplish",
  "rag_queries": ["search query 1", "search query 2"],
  "response_strategy": {
    "approach": "How to approach this response",
    "tone": "professional|casual|empathetic|enthusiastic|consultative",
    "length": "brief|moderate|detailed",
    "key_focus": "The single most important thing to address"
  }
}

Important guidelines:
- buying_stage: curious (just checking), interested (engaged but early), evaluating (comparing options), ready (close to decision)
- warmth: cold (skeptical/distant), warming (opening up), warm (engaged/positive), hot (very interested/urgent)
- implicit_concerns: What they might be worried about but didn't explicitly say
- rag_queries: 2-3 specific search queries to find relevant information in our knowledge base. Be specific.
- response_strategy: Tactical guidance for how to respond

Respond ONLY with valid JSON, no other text.
```

#### Default Template Rules (Static, Runtime)
```
## Response Guidelines

### Knowledge Handling
- Use information from <knowledge> tags when directly relevant
- Don't quote or reference the tags themselves
- If asked something not in your knowledge, say you'll find out
- Never make up features, pricing, or capabilities

### Buying Stage Behavior
- CURIOUS: Keep it light, focus on value, invite questions
- INTERESTED: Share more detail, use social proof
- EVALUATING: Address comparisons, offer specifics
- READY: Remove friction, guide to next step

### Response Format
- Match the length guidance in prospect_analysis
- Use short paragraphs and bullets for readability
- End with a clear but soft call-to-action
- Don't be pushy or use high-pressure tactics

### Conversation Flow
- Acknowledge what they said before responding
- Answer their question directly, then expand if appropriate
- Ask a relevant follow-up question when natural
- Keep the conversation moving forward
```

#### Response Instructions (Appended, Runtime)
```
Based on the prospect analysis above, craft your response following the recommended strategy. Key reminders:
- Match the recommended tone and length
- Address the key focus area
- Use knowledge from <knowledge> tags when relevant (but don't cite the tags themselves)
- Be natural and conversational - you're having a real sales conversation
- If you don't have information to answer a question, be honest and offer to find out
```

---

## 6. RAG System Details

### Vector Database: Supabase pgvector

```sql
-- Table structure
create table rag_chunks (
  id text primary key,
  text text not null,
  type text not null,
  topic text,
  embedding vector(1536),
  created_at timestamp with time zone default now()
);

-- Vector similarity search function
create function match_chunks (
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
```

### Embedding Model

- **Model:** OpenAI text-embedding-3-small
- **Dimensions:** 1536
- **Cost:** ~$0.00002 per 1K tokens
- **Batch Size:** 100 texts per API call

```typescript
// From lib/vectorstore/embeddings.ts
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });

    allEmbeddings.push(...response.data.map(d => d.embedding));
  }

  return allEmbeddings;
}
```

### Search Configuration

- **Default Limit:** 8 chunks returned
- **Type Filtering:** Currently disabled (searches all types)
- **Similarity Threshold:** None (returns top N regardless of score)

### Why These Settings?

**8 chunks:** Enough context without overwhelming. Testing showed 5 sometimes missed relevant info, 10+ added noise.

**No type filtering:** Initially filtered by Haiku's content_types recommendation, but found that cross-type results were often valuable. A transcript might have the best answer to a pricing question.

**No similarity threshold:** Low-similarity chunks are filtered out by relevance in the final prompt anyway. Better to return and let Sonnet judge relevance.

---

## 7. Final Prompt Assembly

### Complete Structure

```
[ROLE PREAMBLE - Fixed]
You are a sales representative responding to a prospect who has replied
to a cold outreach email you previously sent...

[SYSTEM PROMPT - From Tab 1 extraction]
## Identity & Positioning
[Extracted content]

---

## Ideal Customer Profile
[Extracted content]

...etc for all 6 sections...

<operating_rules>
[TEMPLATE RULES - Editable in Tab 2]
## Response Guidelines
...
</operating_rules>

<never_do>
CRITICAL: You must NEVER do any of the following:
[USER'S NEVER DO RULES - Line items]
- Never mention pricing without checking first
- Never badmouth competitors by name
...
</never_do>

<additional_context>
[USER'S ADDITIONAL INSTRUCTIONS - Optional]
This prospect is a warm lead from the conference last week.
Focus on the enterprise features.
</additional_context>

<prospect_analysis>
Current Buying Stage: evaluating
Evidence: "Asking about integration specifics shows active consideration"

Warmth Level: warming
Evidence: "This looks interesting indicates positive initial impression"

Implicit Concerns: Worried about disruption to existing workflow, Concerned about implementation complexity

Prospect Intent: Understand if switching/adding is worth the effort

Recommended Response Strategy:
- Approach: Acknowledge Salesforce, show integration is seamless
- Tone: consultative
- Length: moderate
- Key Focus: Integration is easy and complements Salesforce
</prospect_analysis>

<knowledge>
The following information was retrieved from our knowledge base...

[WEBSITE] ## Salesforce Integration
Our platform integrates natively with Salesforce...

---

[TICKETS] Customer ticket: "How long does Salesforce integration take?"
Resolution: Walked customer through managed package install...

---

[TRANSCRIPTS] From sales call with Acme Corp:
"We were worried about the Salesforce integration..."
</knowledge>

<response_instructions>
Based on the prospect analysis above, craft your response following the recommended strategy. Key reminders:
- Match the recommended tone and length
- Address the key focus area
- Use knowledge from <knowledge> tags when relevant
- Be natural and conversational
- If you don't have information, be honest and offer to find out
</response_instructions>
```

### Token Estimates

| Component | Typical Size |
|-----------|-------------|
| Role Preamble | ~100 tokens |
| System Prompt (6 sections) | ~2000-4000 tokens |
| Template Rules | ~300 tokens |
| Never Do Rules | ~100-200 tokens |
| Additional Context | ~50-200 tokens |
| Prospect Analysis | ~150 tokens |
| Knowledge (8 chunks) | ~1500-3000 tokens |
| Response Instructions | ~100 tokens |
| **Total System Prompt** | **~4000-8000 tokens** |
| Conversation History | Varies |
| **Total Input** | **~5000-10000 tokens** |

### Why XML Tags?

XML tags (`<operating_rules>`, `<knowledge>`, etc.) are used because:
1. Claude models are trained to respect XML structure
2. Clear boundaries prevent context bleeding
3. Easy to reference in instructions ("Use info from <knowledge> tags")
4. Consistent parsing in debug views

---

## 8. Model Selection Rationale

### Opus for Build Phase

**Why Opus?**
- Highest quality extraction
- Best at understanding nuance in business data
- One-time cost is acceptable for quality
- ~$15/million input tokens, ~$75/million output tokens

**Why not Sonnet?**
- Extraction quality noticeably lower in testing
- Missed subtle patterns in competitive positioning
- Tone extraction was more generic

### Haiku for Analysis

**Why Haiku?**
- Fast (~500ms vs 1-2s for Sonnet)
- Cheap (~$0.25/million input tokens)
- Classification task doesn't need Sonnet's reasoning
- JSON output is structured and consistent

**Why not Sonnet?**
- Overkill for classification
- 10x more expensive
- Slower, hurts user experience

### Sonnet for Generation

**Why Sonnet?**
- Best quality/cost balance for generation
- Strong at following complex instructions
- Good at natural conversation
- ~$3/million input, ~$15/million output

**Why not Opus?**
- 5x more expensive
- Response quality difference is marginal for this task
- Latency is higher

**Why not Haiku?**
- Response quality noticeably lower
- Less nuanced in handling complex situations
- Tone matching is weaker

### OpenAI for Embeddings

**Why OpenAI instead of Anthropic?**
- Anthropic doesn't offer an embeddings API
- text-embedding-3-small is cheap and effective
- 1536 dimensions is good balance of quality/speed
- Well-supported by vector databases

---

## 9. Error Handling & Edge Cases

### Rate Limits

**Problem:** 6 parallel Opus calls exceed 30k tokens/minute limit

**Solution:** Sequential calls with 1-second delays
```typescript
for (const [section, prompt] of Object.entries(EXTRACTION_PROMPTS)) {
  const result = await callOpus(combinedData, prompt);
  sections[section] = result;
  await delay(1000);  // Rate limit protection
}
```

### Empty Data Types

**Problem:** Not all 4 data types will always be provided

**Solution:** Graceful fallbacks
```typescript
const combinedData = `
## Sales Transcripts
${cleanedData.transcripts || 'No transcripts provided.'}
...
`;
```

### Failed Haiku Parse

**Problem:** Haiku occasionally returns malformed JSON

**Solution:** Wrap in try/catch, return safe defaults
```typescript
try {
  return JSON.parse(response);
} catch {
  return {
    buying_stage: 'curious',
    warmth: 'warming',
    implicit_concerns: [],
    intent: 'Unknown',
    rag_queries: [message.slice(0, 100)],  // Use message itself as query
    response_strategy: {
      approach: 'Be helpful and answer directly',
      tone: 'professional',
      length: 'moderate',
      key_focus: 'Address their question'
    }
  };
}
```

### No RAG Results

**Problem:** Vector search returns no relevant chunks

**Solution:** Skip knowledge section, Sonnet responds with base knowledge
```typescript
if (knowledge.length > 0) {
  parts.push(`<knowledge>...</knowledge>`);
}
// If no knowledge, section is simply omitted
```

### Missing System Prompt

**Problem:** User starts chat without generating system prompt

**Solution:** Allow chat with just role preamble + rules
- Role preamble provides basic context
- Template rules guide behavior
- Response will be generic but functional

---

## 10. Configuration & Customization

### Adjustable Parameters

| Parameter | Location | Default | Notes |
|-----------|----------|---------|-------|
| RAG chunk limit | ChatContainer.tsx | 8 | More = more context, more tokens |
| Max tokens (Sonnet) | generate/route.ts | 2048 | Response length limit |
| Embedding batch size | embeddings.ts | 100 | OpenAI limit |
| Rate limit delay | generate-prompt/route.ts | 1000ms | Between Opus calls |

### Adding New Extraction Sections

To add a 7th extraction (e.g., "Pricing Strategy"):

1. Add prompt to `lib/prompts/extraction-prompts.ts`:
```typescript
export const EXTRACTION_PROMPTS = {
  // ...existing prompts...
  pricing: `You are an expert at analyzing pricing strategies...`
};
```

2. Update `ExtractedSections` interface in `generate-prompt/route.ts`

3. Add section to `assembleSystemPrompt` function

### Modifying Template Rules

Edit `DEFAULT_TEMPLATE_RULES` in `store/chatStore.ts` or modify in Tab 2 UI at runtime.

### Adding New RAG Types

To add a 5th RAG type (e.g., "case_studies"):

1. Update `RagType` in `lib/vectorstore/chunk.ts`
2. Add to `ragStore.ts` state
3. Add upload zone in Tab 2 UI
4. Update chunk labels in RAG display

### Custom Role Preambles

To change the role preamble for different use cases:

1. Edit `ROLE_PREAMBLE` in `app/api/generate/route.ts`
2. Or make it configurable via environment variable
3. Or add to chatStore as editable field

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MIND MODE QUICK REFERENCE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  MODELS                                                                 │
│  ──────                                                                 │
│  Build:    Claude Opus (claude-3-opus-20240229)                         │
│  Analysis: Claude Haiku (claude-3-5-haiku-20241022)                     │
│  Generate: Claude Sonnet (claude-3-5-sonnet-20241022)                   │
│  Embed:    OpenAI text-embedding-3-small                                │
│                                                                         │
│  DATA TYPES                                                             │
│  ──────────                                                             │
│  Tab 1 & Tab 2: transcripts, tickets, website, research                 │
│                                                                         │
│  EXTRACTION SECTIONS                                                    │
│  ───────────────────                                                    │
│  identity, icp, email_framework, tone, objections, competitive          │
│                                                                         │
│  HAIKU OUTPUT                                                           │
│  ─────────────                                                          │
│  buying_stage: curious | interested | evaluating | ready                │
│  warmth: cold | warming | warm | hot                                    │
│  tone: professional | casual | empathetic | enthusiastic | consultative │
│  length: brief | moderate | detailed                                    │
│                                                                         │
│  XML TAGS IN FINAL PROMPT                                               │
│  ────────────────────────                                               │
│  <operating_rules>    - Template/static rules                           │
│  <never_do>           - User's forbidden actions                        │
│  <additional_context> - Per-conversation instructions                   │
│  <prospect_analysis>  - Haiku's analysis                                │
│  <knowledge>          - RAG chunks                                      │
│  <response_instructions> - Final generation guidance                    │
│                                                                         │
│  KEY FILES                                                              │
│  ─────────                                                              │
│  app/api/generate-prompt/route.ts - Build phase (Opus extraction)       │
│  app/api/analyze/route.ts         - Haiku analysis                      │
│  app/api/generate/route.ts        - Sonnet generation + assembly        │
│  lib/vectorstore/index.ts         - RAG operations                      │
│  store/chatStore.ts               - Runtime state + default rules       │
│                                                                         │
│  COSTS (APPROXIMATE)                                                    │
│  ───────────────────                                                    │
│  Build (one-time):  $0.50 - $2.00                                       │
│  Per message:       $0.02 - $0.03                                       │
│    - Haiku:         ~$0.002                                             │
│    - Embeddings:    ~$0.001                                             │
│    - Sonnet:        ~$0.015-0.02                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix: File Locations

| Purpose | File Path |
|---------|-----------|
| Opus extraction | `app/api/generate-prompt/route.ts` |
| Extraction prompts | `lib/prompts/extraction-prompts.ts` |
| Haiku analysis | `app/api/analyze/route.ts` |
| Sonnet generation | `app/api/generate/route.ts` |
| Role preamble | `app/api/generate/route.ts` (ROLE_PREAMBLE const) |
| Default template rules | `store/chatStore.ts` (DEFAULT_TEMPLATE_RULES) |
| Vector operations | `lib/vectorstore/index.ts` |
| Chunking logic | `lib/vectorstore/chunk.ts` |
| Embeddings | `lib/vectorstore/embeddings.ts` |
| Build state | `store/buildStore.ts` |
| Chat state | `store/chatStore.ts` |
| RAG state | `store/ragStore.ts` |

---

*This document should be provided to Claude when asking detailed questions about the Mind Mode implementation. It contains all prompts, data structures, and architectural decisions needed to understand any part of the system.*
