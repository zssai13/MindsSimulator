export type RagType = 'transcripts' | 'tickets' | 'website' | 'research';

export interface Chunk {
  id: string;
  text: string;
  type: RagType;
  topic?: string;
}

/**
 * Simplified markdown-based chunking strategy
 * All content types use the same approach: split by markdown headers
 */

// Generate unique ID for a chunk
function generateChunkId(type: RagType, index: number): string {
  return `${type}_${Date.now()}_${index}`;
}

// Clean and normalize text
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Split content by markdown headers (##, ###)
 * This is the single chunking strategy for all content types
 */
function chunkMarkdown(content: string): string[] {
  const cleaned = cleanText(content);

  // Split by markdown headers (##, ###) or horizontal rules
  const sections = cleaned.split(/(?=^#{2,3}\s)|(?=^---$)/m);

  const chunks = sections
    .map(s => s.trim())
    .filter(s => s.length > 50); // Filter out empty or very short sections

  // If no headers found, fall back to paragraph-based chunking
  if (chunks.length <= 1 && cleaned.length > 500) {
    return splitByParagraphs(cleaned, 500);
  }

  return chunks;
}

/**
 * Helper: Split by paragraphs with max size (fallback)
 */
function splitByParagraphs(text: string, maxSize: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

  if (currentChunk.trim().length > 50) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Main chunking function - uses unified markdown strategy for all types
 */
export function chunkContent(content: string, type: RagType): Chunk[] {
  const textChunks = chunkMarkdown(content);

  // Convert to Chunk objects with IDs
  return textChunks.map((text, index) => ({
    id: generateChunkId(type, index),
    text,
    type,
  }));
}

/**
 * Chunk multiple files at once
 */
export function chunkFiles(files: Array<{ type: RagType; content: string }>): Chunk[] {
  const allChunks: Chunk[] = [];

  for (const file of files) {
    const chunks = chunkContent(file.content, file.type);
    allChunks.push(...chunks);
  }

  return allChunks;
}

// RAG type labels for UI
export const RAG_TYPE_LABELS: Record<RagType, string> = {
  transcripts: 'Sales Call Transcripts',
  tickets: 'Support Tickets',
  website: 'Website Content',
  research: 'Deep Research',
};
