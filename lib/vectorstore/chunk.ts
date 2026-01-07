export type RagType = 'docs' | 'case_study' | 'pricing' | 'faq' | 'competitive' | 'website';

export interface Chunk {
  id: string;
  text: string;
  type: RagType;
  topic?: string;
}

/**
 * Semantic chunking strategies by content type
 * Each type is split by meaningful semantic units rather than character count
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
 * Split docs by feature/concept sections
 * Looks for markdown headers or section dividers
 */
function chunkDocs(content: string): string[] {
  const cleaned = cleanText(content);

  // Split by markdown headers (##, ###) or horizontal rules
  const sections = cleaned.split(/(?=^#{2,3}\s)|(?=^---$)/m);

  return sections
    .map(s => s.trim())
    .filter(s => s.length > 50); // Filter out empty or very short sections
}

/**
 * Split case studies by customer story
 * Each case study typically has a clear structure
 */
function chunkCaseStudy(content: string): string[] {
  const cleaned = cleanText(content);

  // Try to split by "Case Study:" or "Customer:" headers, or numbered items
  const patterns = [
    /(?=Case Study[:\s])/gi,
    /(?=Customer[:\s])/gi,
    /(?=^#{2,3}\s)/m,
    /(?=^\d+\.\s+[A-Z])/m,
  ];

  for (const pattern of patterns) {
    const sections = cleaned.split(pattern);
    if (sections.length > 1) {
      return sections.map(s => s.trim()).filter(s => s.length > 100);
    }
  }

  // Fallback: split by double newlines for paragraph-based chunks
  return splitByParagraphs(cleaned, 500);
}

/**
 * Split pricing by plan/tier
 * Looks for plan names or pricing tiers
 */
function chunkPricing(content: string): string[] {
  const cleaned = cleanText(content);

  // Common pricing tier patterns
  const patterns = [
    /(?=(?:Basic|Starter|Pro|Professional|Enterprise|Premium|Free|Team|Business)\s*(?:Plan|Tier)?[:\s])/gi,
    /(?=^#{2,3}\s)/m,
    /(?=^\$\d+)/m,
  ];

  for (const pattern of patterns) {
    const sections = cleaned.split(pattern);
    if (sections.length > 1) {
      return sections.map(s => s.trim()).filter(s => s.length > 50);
    }
  }

  // Fallback: keep as single chunk if no clear tiers
  return cleaned.length > 50 ? [cleaned] : [];
}

/**
 * Split FAQ by question/answer pairs
 * Each Q&A pair becomes a chunk
 */
function chunkFaq(content: string): string[] {
  const cleaned = cleanText(content);

  // Split by Q: pattern or numbered questions
  const patterns = [
    /(?=Q[:\s])/gi,
    /(?=Question[:\s])/gi,
    /(?=^\d+\.\s*(?:Q|What|How|Why|When|Where|Can|Is|Are|Do|Does|Will|Would|Should))/gim,
    /(?=^#{2,3}\s)/m,
  ];

  for (const pattern of patterns) {
    const sections = cleaned.split(pattern);
    if (sections.length > 1) {
      return sections.map(s => s.trim()).filter(s => s.length > 30);
    }
  }

  // Fallback: split by double newlines
  return splitByParagraphs(cleaned, 300);
}

/**
 * Split competitive intel by competitor
 */
function chunkCompetitive(content: string): string[] {
  const cleaned = cleanText(content);

  // Look for competitor names or vs patterns
  const patterns = [
    /(?=^#{2,3}\s)/m,
    /(?=vs\.?\s)/gi,
    /(?=Competitor[:\s])/gi,
  ];

  for (const pattern of patterns) {
    const sections = cleaned.split(pattern);
    if (sections.length > 1) {
      return sections.map(s => s.trim()).filter(s => s.length > 100);
    }
  }

  // Fallback: paragraph-based
  return splitByParagraphs(cleaned, 500);
}

/**
 * Split website content by page section
 */
function chunkWebsite(content: string): string[] {
  const cleaned = cleanText(content);

  // Split by headers or section markers
  const patterns = [
    /(?=^#{2,3}\s)/m,
    /(?=^---$)/m,
    /(?=<section|<div)/gi,
  ];

  for (const pattern of patterns) {
    const sections = cleaned.split(pattern);
    if (sections.length > 1) {
      return sections.map(s => s.trim()).filter(s => s.length > 100);
    }
  }

  // Fallback: paragraph-based
  return splitByParagraphs(cleaned, 600);
}

/**
 * Helper: Split by paragraphs with max size
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
 * Main chunking function - routes to type-specific chunker
 */
export function chunkContent(content: string, type: RagType): Chunk[] {
  let textChunks: string[];

  switch (type) {
    case 'docs':
      textChunks = chunkDocs(content);
      break;
    case 'case_study':
      textChunks = chunkCaseStudy(content);
      break;
    case 'pricing':
      textChunks = chunkPricing(content);
      break;
    case 'faq':
      textChunks = chunkFaq(content);
      break;
    case 'competitive':
      textChunks = chunkCompetitive(content);
      break;
    case 'website':
      textChunks = chunkWebsite(content);
      break;
    default:
      textChunks = splitByParagraphs(cleanText(content), 500);
  }

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
  docs: 'Product Documentation',
  case_study: 'Case Studies',
  pricing: 'Pricing Information',
  faq: 'FAQ',
  competitive: 'Competitive Intel',
  website: 'Website Content',
};
