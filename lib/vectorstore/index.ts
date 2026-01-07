import { getSupabase } from '@/lib/supabase';
import { getEmbedding, getEmbeddings } from './embeddings';
import { Chunk, RagType } from './chunk';

// Vector search result interface
export interface SearchResult {
  id: string;
  text: string;
  type: RagType;
  topic?: string;
  score: number;
}

/**
 * Index chunks with their embeddings
 * Main function for adding documents to the vector store
 */
export async function indexChunks(chunks: Chunk[]): Promise<number> {
  if (chunks.length === 0) return 0;

  const supabase = getSupabase();

  // Get embeddings for all chunks in batch
  const texts = chunks.map(c => c.text);
  const embeddings = await getEmbeddings(texts);

  // Prepare records for insertion
  const records = chunks.map((chunk, i) => ({
    id: chunk.id,
    text: chunk.text,
    type: chunk.type,
    topic: chunk.topic || null,
    embedding: embeddings[i],
  }));

  // Insert in batches of 100 (Supabase performs better with batches)
  const BATCH_SIZE = 100;
  let insertedCount = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('rag_chunks')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error('Error inserting chunks:', error);
      throw error;
    }
    insertedCount += batch.length;
  }

  return insertedCount;
}

/**
 * Query the vector store for similar chunks
 */
export async function queryChunks(
  query: string,
  options?: {
    limit?: number;
    contentTypes?: RagType[];
  }
): Promise<SearchResult[]> {
  const { limit = 5, contentTypes } = options || {};

  const supabase = getSupabase();

  // Get embedding for the query
  const queryEmbedding = await getEmbedding(query);

  // Call the match_chunks function
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_count: limit,
    filter_types: contentTypes || null,
  });

  if (error) {
    console.error('Error querying chunks:', error);
    return [];
  }

  // Convert similarity to distance score (lower is better for consistency with LanceDB)
  return (data || []).map((row: { id: string; text: string; type: string; topic: string | null; similarity: number }) => ({
    id: row.id,
    text: row.text,
    type: row.type as RagType,
    topic: row.topic || undefined,
    score: 1 - row.similarity, // Convert similarity to distance
  }));
}

/**
 * Query with multiple queries and combine results
 * Used when Haiku returns multiple search queries
 */
export async function queryMultiple(
  queries: string[],
  options?: {
    limitPerQuery?: number;
    contentTypes?: RagType[];
  }
): Promise<SearchResult[]> {
  const { limitPerQuery = 3, contentTypes } = options || {};

  const allResults: SearchResult[] = [];
  const seenIds = new Set<string>();

  for (const query of queries) {
    const results = await queryChunks(query, {
      limit: limitPerQuery,
      contentTypes,
    });

    // Deduplicate by ID
    for (const result of results) {
      if (!seenIds.has(result.id)) {
        seenIds.add(result.id);
        allResults.push(result);
      }
    }
  }

  // Sort by score (lower is better for distance)
  return allResults.sort((a, b) => a.score - b.score);
}

/**
 * Clear all chunks from the database
 * Useful for re-indexing
 */
export async function clearAll(): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('clear_all_chunks');

  if (error) {
    console.error('Error clearing chunks:', error);
    throw error;
  }
}

/**
 * Get count of indexed chunks
 */
export async function getChunkCount(): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('rag_chunks')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error counting chunks:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get count by type
 */
export async function getCountByType(): Promise<Record<RagType, number>> {
  const counts: Record<RagType, number> = {
    transcripts: 0,
    tickets: 0,
    website: 0,
    research: 0,
  };

  const supabase = getSupabase();

  for (const type of Object.keys(counts) as RagType[]) {
    const { count, error } = await supabase
      .from('rag_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('type', type);

    if (!error && count !== null) {
      counts[type] = count;
    }
  }

  return counts;
}
