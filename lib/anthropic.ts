import Anthropic from '@anthropic-ai/sdk';

// Lazy-initialized Anthropic client (avoids build-time initialization)
let anthropicClient: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

// Legacy export for backwards compatibility
export const anthropic = {
  get messages() {
    return getAnthropic().messages;
  }
};

// Model constants
export const MODELS = {
  OPUS: 'claude-opus-4-20250514',
  SONNET: 'claude-sonnet-4-20250514',
  HAIKU: 'claude-3-haiku-20240307',
} as const;
