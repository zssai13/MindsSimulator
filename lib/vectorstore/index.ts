import * as lancedb from '@lancedb/lancedb';
import { getEmbedding, getEmbeddings, EMBEDDING_DIMENSIONS } from './embeddings';
import { Chunk, RagType } from './chunk';
import path from 'path';

// LanceDB storage path - in project root for persistence
const DB_PATH = path.join(process.cwd(), '.lancedb');
const TABLE_NAME = 'rag_chunks';

// Vector search result interface
export interface SearchResult {
  id: string;
  text: string;
  type: RagType;
  topic?: string;
  score: number;
}

// Database connection (cached)
let dbConnection: lancedb.Connection | null = null;

/**
 * Get or create the database connection
 */
async function getDb(): Promise<lancedb.Connection> {
  if (!dbConnection) {
    dbConnection = await lancedb.connect(DB_PATH);
  }
  return dbConnection;
}

/**
 * Check if the table exists
 */
async function tableExists(): Promise<boolean> {
  const db = await getDb();
  const tables = await db.tableNames();
  return tables.includes(TABLE_NAME);
}

/**
 * Initialize or get the table
 */
async function getOrCreateTable(): Promise<lancedb.Table> {
  const db = await getDb();

  if (await tableExists()) {
    return db.openTable(TABLE_NAME);
  }

  // Create new table with schema
  // LanceDB infers schema from the first data inserted
  // We'll create with a placeholder that gets replaced on first insert
  const initialData = [{
    id: '_init_',
    text: '_initialization_placeholder_',
    type: 'docs' as RagType,
    topic: '',
    vector: new Array(EMBEDDING_DIMENSIONS).fill(0),
  }];

  const table = await db.createTable(TABLE_NAME, initialData);

  // Delete the placeholder
  await table.delete('id = "_init_"');

  return table;
}

/**
 * Index chunks with their embeddings
 * Main function for adding documents to the vector store
 */
export async function indexChunks(chunks: Chunk[]): Promise<number> {
  if (chunks.length === 0) return 0;

  const table = await getOrCreateTable();

  // Get embeddings for all chunks in batch
  const texts = chunks.map(c => c.text);
  const embeddings = await getEmbeddings(texts);

  // Prepare records for insertion
  const records = chunks.map((chunk, i) => ({
    id: chunk.id,
    text: chunk.text,
    type: chunk.type,
    topic: chunk.topic || '',
    vector: embeddings[i],
  }));

  // Add to table
  await table.add(records);

  return records.length;
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

  if (!(await tableExists())) {
    return [];
  }

  const table = await getOrCreateTable();

  // Get embedding for the query
  const queryVector = await getEmbedding(query);

  // Build the search
  let search = table.search(queryVector).limit(limit);

  // Apply type filter if specified
  if (contentTypes && contentTypes.length > 0) {
    const typeFilter = contentTypes.map(t => `type = '${t}'`).join(' OR ');
    search = search.where(typeFilter);
  }

  // Execute search
  const results = await search.toArray();

  return results.map(row => ({
    id: row.id as string,
    text: row.text as string,
    type: row.type as RagType,
    topic: row.topic as string | undefined,
    score: row._distance as number,
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
 * Clear all chunks from the table
 * Useful for re-indexing
 */
export async function clearAll(): Promise<void> {
  const db = await getDb();

  if (await tableExists()) {
    await db.dropTable(TABLE_NAME);
  }
}

/**
 * Get count of indexed chunks
 */
export async function getChunkCount(): Promise<number> {
  if (!(await tableExists())) {
    return 0;
  }

  const table = await getOrCreateTable();
  return await table.countRows();
}

/**
 * Get count by type
 */
export async function getCountByType(): Promise<Record<RagType, number>> {
  const counts: Record<RagType, number> = {
    docs: 0,
    case_study: 0,
    pricing: 0,
    faq: 0,
    competitive: 0,
    website: 0,
  };

  if (!(await tableExists())) {
    return counts;
  }

  const table = await getOrCreateTable();

  for (const type of Object.keys(counts) as RagType[]) {
    const results = await table.search(new Array(EMBEDDING_DIMENSIONS).fill(0))
      .where(`type = '${type}'`)
      .limit(10000)
      .toArray();
    counts[type] = results.length;
  }

  return counts;
}
