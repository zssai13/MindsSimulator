import { NextRequest, NextResponse } from 'next/server';
import { queryChunks, queryMultiple, SearchResult } from '@/lib/vectorstore/index';
import { RagType } from '@/lib/vectorstore/chunk';

interface QueryRequest {
  queries: string[];
  contentTypes?: RagType[];
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: QueryRequest = await request.json();
    const { queries, contentTypes, limit = 5 } = body;

    if (!queries || queries.length === 0) {
      return NextResponse.json(
        { error: 'No queries provided' },
        { status: 400 }
      );
    }

    // Validate OpenAI API key (needed for query embedding)
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let chunks: SearchResult[];

    if (queries.length === 1) {
      // Single query
      chunks = await queryChunks(queries[0], {
        limit,
        contentTypes,
      });
    } else {
      // Multiple queries - combine results
      chunks = await queryMultiple(queries, {
        limitPerQuery: Math.ceil(limit / queries.length),
        contentTypes,
      });
      // Limit total results
      chunks = chunks.slice(0, limit);
    }

    return NextResponse.json({
      chunks: chunks.map(chunk => ({
        id: chunk.id,
        text: chunk.text,
        metadata: {
          type: chunk.type,
          topic: chunk.topic,
        },
        score: chunk.score,
      })),
      model: 'openai',
    });
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 }
    );
  }
}
