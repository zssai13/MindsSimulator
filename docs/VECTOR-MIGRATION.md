# Vector Database Migration: LanceDB → Supabase pgvector

**Created:** January 2026
**Status:** Planning
**Goal:** Replace LanceDB with Supabase pgvector for Vercel-compatible deployment

---

## Why We're Migrating

### The Problem
LanceDB includes native binaries (~258MB) that exceed Vercel's 250MB serverless function limit:
```
node_modules/@lancedb/lancedb-linux-x64-musl   129.07 MB
node_modules/@lancedb/lancedb-linux-x64-gnu    128.87 MB
```

Additionally, LanceDB is an embedded database that stores data locally in `.lancedb/`. This doesn't work on serverless platforms where:
- File system is ephemeral (data lost between invocations)
- Functions are stateless
- No persistent local storage

### The Solution
Supabase with pgvector extension:
- Cloud-hosted PostgreSQL with vector support
- Lightweight client library (~few KB)
- Persistent storage across all function invocations
- Works perfectly with Vercel serverless
- Free tier available for development

---

## Current Architecture (LanceDB)

### Files to Modify

| File | Purpose | Changes Needed |
|------|---------|----------------|
| `lib/vectorstore/index.ts` | LanceDB operations | **Replace entirely** with Supabase client |
| `lib/vectorstore/embeddings.ts` | OpenAI embeddings | **Keep as-is** (still using OpenAI for embeddings) |
| `lib/vectorstore/chunk.ts` | Semantic chunking | **Keep as-is** (chunking logic unchanged) |
| `app/api/vectorize/route.ts` | Vectorization endpoint | **Minor updates** to use new vectorstore |
| `app/api/query/route.ts` | Query endpoint | **Minor updates** to use new vectorstore |
| `package.json` | Dependencies | **Remove** @lancedb/lancedb, **Add** @supabase/supabase-js |
| `next.config.mjs` | LanceDB externals config | **Remove** LanceDB-specific config |
| `.gitignore` | Ignore .lancedb | **Remove** .lancedb entry (no longer needed) |

### Current Data Flow
```
Chunks → getEmbeddings() → LanceDB.add()
Query → getEmbedding() → LanceDB.search() → Results
```

### New Data Flow (After Migration)
```
Chunks → getEmbeddings() → Supabase.insert()
Query → getEmbedding() → Supabase.rpc('match_chunks') → Results
```

---

## Supabase Setup (One-Time)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Note the following credentials:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIs...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIs...` (for server-side)

### Step 2: Enable pgvector Extension
Run in Supabase SQL Editor:
```sql
-- Enable the pgvector extension
create extension if not exists vector;
```

### Step 3: Create Chunks Table
```sql
-- Create the chunks table with vector column
create table rag_chunks (
  id text primary key,
  text text not null,
  type text not null,
  topic text,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create index for faster vector similarity search
create index on rag_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Create index for type filtering
create index on rag_chunks (type);
```

### Step 4: Create Search Function
```sql
-- Function to search for similar chunks
create or replace function match_chunks (
  query_embedding vector(1536),
  match_count int default 5,
  filter_types text[] default null
)
returns table (
  id text,
  text text,
  type text,
  topic text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    rag_chunks.id,
    rag_chunks.text,
    rag_chunks.type,
    rag_chunks.topic,
    1 - (rag_chunks.embedding <=> query_embedding) as similarity
  from rag_chunks
  where
    filter_types is null
    or rag_chunks.type = any(filter_types)
  order by rag_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### Step 5: Create Clear Function (Optional)
```sql
-- Function to clear all chunks (for re-indexing)
create or replace function clear_all_chunks()
returns void
language plpgsql
as $$
begin
  delete from rag_chunks;
end;
$$;

-- Function to clear chunks by type
create or replace function clear_chunks_by_type(chunk_type text)
returns void
language plpgsql
as $$
begin
  delete from rag_chunks where type = chunk_type;
end;
$$;
```

---

## Code Changes

### 1. Update Dependencies

**Remove:**
```bash
npm uninstall @lancedb/lancedb
```

**Add:**
```bash
npm install @supabase/supabase-js
```

### 2. Add Environment Variables

Add to `.env.local`:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
```

Add to `.env.example`:
```bash
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```

Add to Vercel Environment Variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### 3. Create Supabase Client

**New file: `lib/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

// Lazy-initialized Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}
```

### 4. Replace Vector Store Implementation

**Replace: `lib/vectorstore/index.ts`**

```typescript
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

  // Insert in batches of 100 (Supabase limit)
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

  return (data || []).map((row: any) => ({
    id: row.id,
    text: row.text,
    type: row.type as RagType,
    topic: row.topic,
    score: 1 - row.similarity, // Convert similarity to distance for consistency
  }));
}

/**
 * Query with multiple queries and combine results
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
    docs: 0,
    case_study: 0,
    pricing: 0,
    faq: 0,
    competitive: 0,
    website: 0,
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
```

### 5. Update next.config.mjs

**Remove LanceDB-specific configuration:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the serverComponentsExternalPackages and webpack config
  // They were only needed for LanceDB
};

export default nextConfig;
```

### 6. Update .gitignore

**Remove:**
```
# LanceDB vector storage
/.lancedb/
```

### 7. Update API Routes (Minor Changes)

The API routes (`/api/vectorize` and `/api/query`) should work with minimal changes since they import from `lib/vectorstore/index.ts` which we're replacing.

However, review them to ensure:
- Error handling is appropriate for async database calls
- Any LanceDB-specific error messages are updated

---

## Migration Checklist

### Pre-Migration
- [ ] Create Supabase project
- [ ] Enable pgvector extension
- [ ] Create rag_chunks table
- [ ] Create match_chunks function
- [ ] Create clear functions
- [ ] Note Supabase credentials
- [ ] Add credentials to .env.local
- [ ] Add credentials to Vercel

### Code Migration
- [ ] Uninstall @lancedb/lancedb
- [ ] Install @supabase/supabase-js
- [ ] Create lib/supabase.ts
- [ ] Replace lib/vectorstore/index.ts
- [ ] Update next.config.mjs
- [ ] Update .gitignore
- [ ] Update .env.example

### Testing
- [ ] Run npm run build (verify no errors)
- [ ] Test vectorize endpoint locally
- [ ] Test query endpoint locally
- [ ] Verify chunk counts work
- [ ] Verify type filtering works
- [ ] Verify clear all works

### Deployment
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] Verify Vercel build succeeds
- [ ] Test deployed vectorize endpoint
- [ ] Test deployed query endpoint
- [ ] End-to-end chat test with RAG

---

## Rollback Plan

If issues arise, the original LanceDB code is preserved in git history:
```bash
git log --oneline  # Find commit before migration
git checkout <commit> -- lib/vectorstore/index.ts
git checkout <commit> -- next.config.mjs
npm install @lancedb/lancedb
```

---

## Performance Considerations

### Supabase Free Tier Limits
- 500 MB database storage
- 2 GB bandwidth/month
- Unlimited API requests

### Optimization Tips
1. **Batch inserts**: Already implemented (100 chunks per batch)
2. **Index on type**: Created for filtered queries
3. **IVFFlat index**: Created for vector similarity (lists=100)
4. **Connection pooling**: Supabase handles this automatically

### Estimated Storage Per Chunk
- id: ~50 bytes
- text: ~500 bytes average
- type: ~20 bytes
- topic: ~50 bytes
- embedding: 1536 floats × 4 bytes = 6,144 bytes
- **Total: ~7KB per chunk**

With 500MB limit: ~70,000 chunks on free tier

---

## Future Enhancements

1. **Row Level Security (RLS)**: Add user-based data isolation
2. **Realtime subscriptions**: Watch for chunk changes
3. **Edge Functions**: Move embedding to Supabase Edge for lower latency
4. **Hybrid search**: Combine vector + full-text search

---

## Files Summary

### Files to Create
- `lib/supabase.ts` - Supabase client

### Files to Replace
- `lib/vectorstore/index.ts` - New Supabase implementation

### Files to Modify
- `package.json` - Swap dependencies
- `next.config.mjs` - Remove LanceDB config
- `.gitignore` - Remove .lancedb
- `.env.local` - Add Supabase credentials
- `.env.example` - Add Supabase placeholders

### Files Unchanged
- `lib/vectorstore/embeddings.ts` - Still using OpenAI
- `lib/vectorstore/chunk.ts` - Chunking logic unchanged
- `app/api/vectorize/route.ts` - Uses vectorstore exports
- `app/api/query/route.ts` - Uses vectorstore exports
- All other files

---

## Estimated Effort

| Task | Time |
|------|------|
| Supabase project setup | 10 min |
| SQL schema creation | 10 min |
| Code changes | 30 min |
| Local testing | 20 min |
| Vercel deployment | 10 min |
| End-to-end testing | 15 min |
| **Total** | **~1.5 hours** |

---

## Next Steps

1. **Create Supabase project** and run SQL setup
2. **Implement code changes** following this plan
3. **Test locally** with real data
4. **Deploy to Vercel** and verify
5. **Update documentation** (ARCHITECTURE.md, HANDOFF.md)
