export const EXTRACTION_PROMPTS: Record<string, string> = {
  identity: `Extract a 2-3 sentence identity statement.

Include:
- Company name and what it does (simply)
- Core value proposition
- Who it's for

Keep it conversational, not corporate.

Output the identity statement directly, no JSON wrapper.`,

  icp: `Extract the Ideal Customer Profile.

Include:
- Primary buyer types
- Spend/size thresholds
- Common pain points (in their words)
- Disqualification criteria

Output as a structured section with clear bullet points.`,

  email_framework: `Distill email strategy into actionable rules.

Format:
- Structure (5 bullets)
- Opening lines (5 bullets)
- Subject lines (5 bullets)
- CTAs (3 bullets)
- Never do (5 bullets)

Max 300 words. Specific, not generic.

Output as a formatted section with headers and bullets.`,

  tone: `Extract tone and voice guidelines.

Include:
- How to sound (confident but not...)
- How to match prospect energy
- What to avoid (corporate speak, etc.)
- Formality guidance

Output as a formatted section with clear guidelines.`,

  objections: `Extract top 10-15 objections with responses.

Format each as:
**"[Objection in their words]"**
- Why they say this
- Response framework
- Key phrases that worked

Only include proven responses.

Output as a formatted playbook.`,

  competitive: `Extract competitive positioning.

Format:
vs [Competitor 1]:
- Key differentiator
- When we win
- What to say

Repeat for each major competitor mentioned in the data.

Output as a formatted competitive guide.`
};

export type ExtractionSection = keyof typeof EXTRACTION_PROMPTS;
