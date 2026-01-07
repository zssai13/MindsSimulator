'use client';

import { useEffect } from 'react';
import { useBuildStore } from '@/store/buildStore';

const DEFAULT_TEMPLATE_RULES = `## KNOWLEDGE HANDLING

When you receive information in <knowledge> tags:
- Use it naturally in your responses
- Never mention that you retrieved or looked up information
- Never reference the tags themselves
- Cite specific details when relevant

## BUYING STAGE RESPONSE RULES

### Curious Stage (Just exploring)
- Keep responses short (2-3 sentences max)
- Focus on value, not features
- One clear CTA

### Interested Stage (Engaged but uncertain)
- Share relevant proof points
- Address implicit concerns
- Suggest next step

### Evaluating Stage (Comparing options)
- Be specific about capabilities
- Acknowledge competitive landscape
- Offer concrete next steps

### Ready Stage (Decision mode)
- Remove friction
- Be direct about pricing/process
- Facilitate the decision

## RESPONSE FORMAT RULES

- Never use bullet points in cold emails
- Keep paragraphs to 2-3 sentences max
- Use "you" more than "we" or "I"
- End with a single, clear question or CTA
- Match the prospect's formality level

## BOUNDARIES

- Never discuss specific pricing without permission
- Never make guarantees about results
- Never disparage competitors by name
- If unsure, ask clarifying questions
- Suggest human handoff for complex technical questions`;

export function StaticRulesEditor() {
  const templateRules = useBuildStore((s) => s.templateRules);
  const userRules = useBuildStore((s) => s.userRules);
  const setTemplateRules = useBuildStore((s) => s.setTemplateRules);
  const setUserRules = useBuildStore((s) => s.setUserRules);

  useEffect(() => {
    if (!templateRules) {
      setTemplateRules(DEFAULT_TEMPLATE_RULES);
    }
  }, [templateRules, setTemplateRules]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Template Rules
          </label>
          <button
            onClick={() => setTemplateRules(DEFAULT_TEMPLATE_RULES)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Reset to Default
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          Standard operating instructions for the AI. Edit as needed.
        </p>
        <textarea
          value={templateRules}
          onChange={(e) => setTemplateRules(e.target.value)}
          className="w-full h-64 px-3 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="Enter template rules..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom &quot;Never Do&quot; Rules
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Add specific behaviors the AI should never exhibit. One rule per line.
        </p>
        <textarea
          value={userRules}
          onChange={(e) => setUserRules(e.target.value)}
          className="w-full h-32 px-3 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="- Never mention competitor X by name
- Never offer discounts without approval
- Never discuss feature Y until released"
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-500">
          <strong>Tip:</strong> Template rules define how the AI operates. Custom rules add specific constraints for your use case.
        </p>
      </div>
    </div>
  );
}
