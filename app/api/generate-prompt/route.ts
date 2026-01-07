import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODELS } from '@/lib/anthropic';
import { EXTRACTION_PROMPTS, ExtractionSection } from '@/lib/prompts/extraction-prompts';

interface CleanedData {
  transcripts: string | null;
  tickets: string | null;
  website: string | null;
  research: string | null;
}

interface GeneratePromptRequest {
  cleanedData: CleanedData;
  staticRules: string;
  userRules: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GeneratePromptRequest;
    const { cleanedData, staticRules, userRules } = body;

    if (!cleanedData) {
      return NextResponse.json(
        { error: 'Missing cleanedData' },
        { status: 400 }
      );
    }

    const allCleanedContent = Object.entries(cleanedData)
      .filter(([, value]) => value !== null)
      .map(([key, value]) => `## ${key.toUpperCase()}\n\n${value}`)
      .join('\n\n---\n\n');

    if (!allCleanedContent) {
      return NextResponse.json(
        { error: 'No cleaned data available to generate prompt from' },
        { status: 400 }
      );
    }

    const sectionTypes: ExtractionSection[] = [
      'identity',
      'icp',
      'email_framework',
      'tone',
      'objections',
      'competitive',
    ];

    const extractionPromises = sectionTypes.map(async (section) => {
      const prompt = EXTRACTION_PROMPTS[section];

      const message = await anthropic.messages.create({
        model: MODELS.OPUS,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\n---\n\nHere is the cleaned data to extract from:\n\n${allCleanedContent}`,
          },
        ],
      });

      const content = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      return { section, content };
    });

    const extractedResults = await Promise.all(extractionPromises);

    const sections: Record<string, string> = {};
    extractedResults.forEach(({ section, content }) => {
      sections[section] = content;
    });

    const systemPrompt = assembleSystemPrompt(sections, staticRules, userRules);

    return NextResponse.json({
      systemPrompt,
      sections,
      model: 'opus',
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}

function assembleSystemPrompt(
  sections: Record<string, string>,
  staticRules: string,
  userRules: string
): string {
  const parts: string[] = [];

  parts.push('# AI SALES REPRESENTATIVE SYSTEM PROMPT\n');

  if (sections.identity) {
    parts.push('## IDENTITY\n');
    parts.push(sections.identity);
    parts.push('\n');
  }

  if (sections.icp) {
    parts.push('## IDEAL CUSTOMER PROFILE\n');
    parts.push(sections.icp);
    parts.push('\n');
  }

  if (sections.email_framework) {
    parts.push('## EMAIL FRAMEWORK\n');
    parts.push(sections.email_framework);
    parts.push('\n');
  }

  if (sections.tone) {
    parts.push('## TONE & VOICE\n');
    parts.push(sections.tone);
    parts.push('\n');
  }

  if (sections.objections) {
    parts.push('## OBJECTION HANDLING\n');
    parts.push(sections.objections);
    parts.push('\n');
  }

  if (sections.competitive) {
    parts.push('## COMPETITIVE POSITIONING\n');
    parts.push(sections.competitive);
    parts.push('\n');
  }

  if (staticRules) {
    parts.push('## OPERATING RULES\n');
    parts.push(staticRules);
    parts.push('\n');
  }

  if (userRules) {
    parts.push('## CUSTOM CONSTRAINTS\n');
    parts.push('The following are absolute rules that must never be violated:\n');
    parts.push(userRules);
    parts.push('\n');
  }

  return parts.join('\n');
}
