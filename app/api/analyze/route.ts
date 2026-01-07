import { NextRequest, NextResponse } from 'next/server';
import { anthropic, MODELS } from '@/lib/anthropic';
import { HaikuAnalysis } from '@/store/chatStore';

interface AnalyzeRequest {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  pageContext: string;
}

const ANALYSIS_PROMPT = `You are an expert sales analyst. Analyze this prospect's message to help a sales AI craft the perfect response.

CONTEXT:
- Page they visited: {pageContext}
- Conversation history provided below

YOUR TASK:
Analyze the prospect's latest message and return a JSON analysis.

RETURN EXACTLY THIS JSON STRUCTURE (no markdown, no explanation, just valid JSON):
{
  "buying_stage": "curious|interested|evaluating|ready",
  "stage_evidence": "brief quote or observation supporting your stage assessment",
  "warmth": "cold|warming|warm|hot",
  "warmth_evidence": "brief quote or observation supporting your warmth assessment",
  "implicit_concerns": ["concern1", "concern2"],
  "intent": "What the prospect is really trying to accomplish with this message",
  "needs_search": true/false,
  "search_queries": ["query1", "query2"] or null if needs_search is false,
  "content_types": ["transcripts", "tickets", "website", "research"] or null,
  "response_strategy": {
    "approach": "How to approach the response (e.g., 'address concern directly', 'build curiosity', 'provide proof')",
    "tone": "professional|casual|empathetic|enthusiastic|consultative",
    "length": "brief|moderate|detailed",
    "key_focus": "The single most important thing to address"
  }
}

BUYING STAGE DEFINITIONS:
- curious: Just learning, no commitment signals
- interested: Engaged, asking questions, but not comparing options
- evaluating: Actively comparing, asking about specifics, pricing, competition
- ready: Showing intent to buy, asking about next steps, implementation

WARMTH DEFINITIONS:
- cold: Skeptical, short responses, resistance
- warming: Neutral, open to conversation
- warm: Positive engagement, multiple questions, showing interest
- hot: Enthusiastic, asking about next steps, ready to proceed

SEARCH QUERY GUIDELINES:
- Set needs_search to true if the prospect asks about features, pricing, capabilities, or anything that requires specific knowledge
- Set needs_search to false for greetings, simple acknowledgments, or emotional responses that don't need data
- search_queries should be specific semantic search phrases that would find relevant content
- content_types should filter to the most relevant types (e.g., ["pricing"] for pricing questions)

CONVERSATION HISTORY:`;

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { message, history, pageContext } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Build the conversation for analysis
    const systemPrompt = ANALYSIS_PROMPT.replace('{pageContext}', pageContext || 'Unknown');

    // Format history for the AI
    const historyText = history.length > 0
      ? history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n\n')
      : 'No previous messages';

    const userPrompt = `${historyText}

LATEST MESSAGE TO ANALYZE:
USER: ${message}

Respond with the JSON analysis only:`;

    const response = await anthropic.messages.create({
      model: MODELS.HAIKU,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\n${userPrompt}`,
        },
      ],
    });

    // Extract the text response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Haiku');
    }

    // Parse the JSON response
    let analysis: HaikuAnalysis;
    try {
      // Clean the response - sometimes models wrap in markdown
      let jsonText = textContent.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();

      analysis = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse Haiku response:', textContent.text);
      // Return a default analysis if parsing fails
      analysis = {
        buying_stage: 'curious',
        stage_evidence: 'Could not parse analysis',
        warmth: 'warming',
        warmth_evidence: 'Could not parse analysis',
        implicit_concerns: [],
        intent: 'Unknown',
        needs_search: true,
        search_queries: [message],
        content_types: null,
        response_strategy: {
          approach: 'be helpful',
          tone: 'professional',
          length: 'moderate',
          key_focus: 'address the question',
        },
      };
    }

    return NextResponse.json({
      analysis,
      model: 'haiku',
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
