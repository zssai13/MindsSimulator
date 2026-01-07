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
 * Generate embeddings for multiple texts in a single API call
 * More efficient for batch processing
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  // OpenAI has a limit of ~8191 tokens per text input
  // Split into batches of 100 texts max to avoid rate limits
  const BATCH_SIZE = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await getOpenAI().embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    // Embeddings are returned in the same order as input
    const batchEmbeddings = response.data.map(d => d.embedding);
    allEmbeddings.push(...batchEmbeddings);
  }

  return allEmbeddings;
}
