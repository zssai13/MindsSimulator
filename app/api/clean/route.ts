import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODELS } from '@/lib/anthropic';
import { CLEANING_PROMPTS } from '@/lib/prompts/cleaning-prompts';
import { DataType } from '@/store/buildStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content } = body as { type: DataType; content: string };

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type and content' },
        { status: 400 }
      );
    }

    const cleaningPrompt = CLEANING_PROMPTS[type];
    if (!cleaningPrompt) {
      return NextResponse.json(
        { error: `Invalid data type: ${type}` },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: MODELS.OPUS,
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `${cleaningPrompt}\n\n---\n\nHere is the raw data to process:\n\n${content}`,
        },
      ],
    });

    const cleaned = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    return NextResponse.json({
      cleaned,
      model: 'opus',
    });
  } catch (error) {
    console.error('Error cleaning data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clean data' },
      { status: 500 }
    );
  }
}
