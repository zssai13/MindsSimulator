export const CLEANING_PROMPTS: Record<string, string> = {
  transcripts: `You are processing raw sales call transcripts.

Extract and structure:

## DISCOVERY QUESTIONS THAT WORKED
- Questions that got prospects talking
- Questions that uncovered real pain

## OBJECTIONS RAISED
For each objection:
- The objection (in customer's words)
- How the rep handled it
- Whether it worked

## WINNING TALK TRACKS
- Explanations that landed well
- Phrases with positive reactions

## COMPETITIVE MENTIONS
- Which competitors came up
- What was said

Discard: scheduling, small talk, filler words, anything not strategically useful.

Output as clean, structured JSON.`,

  tickets: `You are processing raw support tickets.

Group and structure into:

## COMMON ISSUES (by category)
For each:
- Problem description (generalized)
- Root cause
- Resolution
- Prevention tips

## FEATURE CONFUSION
- Misunderstood features
- Correct explanation

## INTEGRATION PROBLEMS
- Which integrations cause issues
- Common fixes

## PRODUCT GAPS
- What users ask for that doesn't exist

Discard: ticket metadata, internal notes, one-off edge cases.

Output as clean, structured JSON.`,

  website: `You are cleaning website content.

For each page, output:
- Page name/URL
- Purpose
- Key content (cleaned)

Remove: navigation, footers, "click here", cookie notices, boilerplate, marketing fluff.

Keep: value propositions, feature explanations, proof points, pricing info, differentiators.

Output as clean, structured JSON.`,

  docs: `You are cleaning product documentation.

For each section:
- Feature/concept name
- Clear explanation
- Key details
- Use cases

Remove: TOC, version history, navigation, redundant content.

Chunk by feature/concept, not by page.

Output as clean, structured JSON.`,

  research: `You are processing business research.

Extract:
- Company positioning (2-3 sentences)
- Target ICP (detailed)
- Key differentiators
- Competitive landscape
- Market context

Keep strategic insights, discard filler.

Output as clean, structured JSON.`,

  'email-guide': `You are processing cold email strategy guides.

Distill into actionable rules:

## STRUCTURE RULES (5-7 bullets)
## OPENING LINE RULES (5-7 bullets)
## SUBJECT LINE RULES (5-7 bullets)
## CTA RULES (3-5 bullets)
## ANTI-PATTERNS (5-7 bullets)

Maximum 300 words total. Specific and actionable.

Output as clean, structured JSON.`
};

export type CleaningType = keyof typeof CLEANING_PROMPTS;
