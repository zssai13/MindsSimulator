import Anthropic from '@anthropic-ai/sdk';

// Server-side only - this will be used in API routes
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model constants
export const MODELS = {
  OPUS: 'claude-opus-4-20250514',
  SONNET: 'claude-sonnet-4-20250514',
  HAIKU: 'claude-3-haiku-20240307',
} as const;
