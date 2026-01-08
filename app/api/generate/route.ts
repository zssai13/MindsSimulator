import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODELS } from '@/lib/anthropic';
import { HaikuAnalysis, RagChunk } from '@/store/chatStore';

interface GenerateRequest {
  systemPrompt: string;
  templateRules: string;
  userRules: string;
  analysis: HaikuAnalysis;
  knowledge: RagChunk[];
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  message: string;
  additionalContext?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { systemPrompt, templateRules, userRules, analysis, knowledge, history, message, additionalContext } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Assemble the final prompt
    const finalPrompt = assemblePrompt({
      systemPrompt,
      templateRules,
      userRules,
      analysis,
      knowledge,
      additionalContext,
    });

    // Build conversation messages
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add history
    for (const msg of history) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call Sonnet
    const response = await anthropic.messages.create({
      model: MODELS.SONNET,
      max_tokens: 2048,
      system: finalPrompt,
      messages: messages,
    });

    // Extract the text response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Sonnet');
    }

    return NextResponse.json({
      response: textContent.text,
      finalPrompt,
      model: 'sonnet',
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}

/**
 * Assemble the complete system prompt with analysis and knowledge
 */
// Fixed role preamble - always present, not editable
const ROLE_PREAMBLE = `You are a sales representative responding to a prospect who has replied to a cold outreach email you previously sent. Your goal is to continue this conversation naturally and move them toward a sale while being genuinely helpful - not pushy.

The prospect received an initial email from you and has now replied. You are continuing that conversation. Use the context below to understand who you represent, how to communicate, and what knowledge you have access to.`;

function assemblePrompt({
  systemPrompt,
  templateRules,
  userRules,
  analysis,
  knowledge,
  additionalContext,
}: {
  systemPrompt: string;
  templateRules: string;
  userRules: string;
  analysis: HaikuAnalysis;
  knowledge: RagChunk[];
  additionalContext?: string;
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
