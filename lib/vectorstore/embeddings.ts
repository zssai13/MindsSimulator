import OpenAI from 'openai';

// Lazy-initialized OpenAI client (avoids build-time initialization)
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Model for embeddings - text-embedding-3-small (1536 dimensions)
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate embeddings for a single text
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts
 * Processes sequentially to avoid token limit errors (8192 tokens per request)
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const allEmbeddings: number[][] = [];

  // Process texts one at a time to avoid token limit errors
  // OpenAI's limit is 8192 tokens per request - batching can exceed this
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];

    // Truncate very long texts to ~6000 chars (~1500 tokens) to stay under limit
    const truncatedText = text.length > 6000 ? text.substring(0, 6000) : text;

    const response = await getOpenAI().embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncatedText,
    });

    allEmbeddings.push(response.data[0].embedding);

    // Small delay every 10 texts to avoid rate limits
    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return allEmbeddings;
}
