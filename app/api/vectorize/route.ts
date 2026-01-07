import { NextRequest, NextResponse } from 'next/server';
import { chunkContent, RagType } from '@/lib/vectorstore/chunk';
import { indexChunks, clearAll } from '@/lib/vectorstore/index';

interface VectorizeRequest {
  files: Array<{
    type: RagType;
    content: string;
  }>;
  clearExisting?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: VectorizeRequest = await request.json();
    const { files, clearExisting = false } = body;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Clear existing vectors if requested
    if (clearExisting) {
      await clearAll();
    }

    // Process each file and track results per type
    const results: Record<string, number> = {};
    let totalChunks = 0;

    for (const file of files) {
      // Chunk the content based on type
      const chunks = chunkContent(file.content, file.type);

      if (chunks.length > 0) {
        // Index chunks with embeddings
        const indexed = await indexChunks(chunks);
        results[file.type] = indexed;
        totalChunks += indexed;
      } else {
        results[file.type] = 0;
      }
    }

    return NextResponse.json({
      success: true,
      chunksIndexed: totalChunks,
      byType: results,
      model: 'openai',
    });
  } catch (error) {
    console.error('Vectorize error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Vectorization failed' },
      { status: 500 }
    );
  }
}
