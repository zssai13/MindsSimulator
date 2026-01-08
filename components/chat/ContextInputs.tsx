'use client';

import { useState } from 'react';
import { useChatStore, DEFAULT_TEMPLATE_RULES } from '@/store/chatStore';
import { useBuildStore } from '@/store/buildStore';
import { useEffect } from 'react';

export function ContextInputs() {
  const [rulesExpanded, setRulesExpanded] = useState(false);

  const systemPrompt = useChatStore((s) => s.systemPrompt);
  const setSystemPrompt = useChatStore((s) => s.setSystemPrompt);
  const templateRules = useChatStore((s) => s.templateRules);
  const setTemplateRules = useChatStore((s) => s.setTemplateRules);
  const userRules = useChatStore((s) => s.userRules);
  const setUserRules = useChatStore((s) => s.setUserRules);
  const pageUrl = useChatStore((s) => s.pageUrl);
  const setPageUrl = useChatStore((s) => s.setPageUrl);
  const additionalContext = useChatStore((s) => s.additionalContext);
  const setAdditionalContext = useChatStore((s) => s.setAdditionalContext);
  const initialEmail = useChatStore((s) => s.initialEmail);
  const setInitialEmail = useChatStore((s) => s.setInitialEmail);

  // Get system prompt from build store
  const buildSystemPrompt = useBuildStore((s) => s.systemPrompt);

  // Auto-load system prompt from Tab 1 if available and chat prompt is empty
  useEffect(() => {
    if (buildSystemPrompt && !systemPrompt) {
      setSystemPrompt(buildSystemPrompt);
    }
  }, [buildSystemPrompt, systemPrompt, setSystemPrompt]);

  const handleLoadFromTab1 = () => {
    if (buildSystemPrompt) {
      setSystemPrompt(buildSystemPrompt);
    }
  };

  return (
    <section className="border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold">Context Inputs</h3>

      {/* System Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            System Prompt
          </label>
          {buildSystemPrompt && (
            <button
              onClick={handleLoadFromTab1}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Load from Tab 1
            </button>
          )}
        </div>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Paste your system prompt here, or load from Tab 1..."
          className="w-full h-32 p-3 border rounded-lg text-sm font-mono resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {systemPrompt && (
          <p className="text-xs text-gray-500">
            {systemPrompt.length.toLocaleString()} characters
          </p>
        )}
      </div>

      {/* Static Rules (Collapsible) */}
      <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
        <button
          onClick={() => setRulesExpanded(!rulesExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <span className={`transform transition-transform ${rulesExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
            <label className="text-sm font-medium text-gray-700">
              Static Rules
            </label>
            {templateRules !== DEFAULT_TEMPLATE_RULES && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                Modified
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTemplateRules(DEFAULT_TEMPLATE_RULES);
            }}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Reset to Default
          </button>
        </button>

        {rulesExpanded && (
          <div className="pt-2">
            <p className="text-xs text-gray-500 mb-2">
              Operating instructions for the AI (knowledge handling, response format, boundaries).
            </p>
            <textarea
              value={templateRules}
              onChange={(e) => setTemplateRules(e.target.value)}
              className="w-full h-48 px-3 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-white"
              placeholder="Enter template rules..."
            />
          </div>
        )}
      </div>

      {/* Never Do Rules */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Never Do Rules
        </label>
        <p className="text-xs text-gray-500">
          Specific behaviors the AI should never exhibit. One rule per line.
        </p>
        <textarea
          value={userRules}
          onChange={(e) => setUserRules(e.target.value)}
          className="w-full h-20 px-3 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="- Never mention competitor X by name&#10;- Never offer discounts without approval&#10;- Never discuss feature Y until released"
        />
      </div>

      {/* Two column layout for URL and Additional Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Page URL */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Page URL
          </label>
          <input
            type="text"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            placeholder="e.g., /pricing, /features/analytics"
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500">
            Simulates which page the prospect visited
          </p>
        </div>

        {/* Additional Context */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Additional Context
          </label>
          <input
            type="text"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="e.g., Focus on ROI messaging"
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500">
            Extra instructions for this simulation
          </p>
        </div>
      </div>

      {/* Initial Email */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Initial Email (Optional)
        </label>
        <textarea
          value={initialEmail}
          onChange={(e) => setInitialEmail(e.target.value)}
          placeholder="Enter the cold email that started this conversation (if any)..."
          className="w-full h-24 p-3 border rounded-lg text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500">
          If set, this will appear as the first assistant message
        </p>
      </div>

      {/* Status indicators */}
      <div className="flex flex-wrap gap-2 pt-2">
        <StatusBadge label="System Prompt" active={!!systemPrompt} />
        <StatusBadge label="Static Rules" active={!!templateRules} />
        <StatusBadge label="Never Do Rules" active={!!userRules} />
        <StatusBadge label="Page URL" active={!!pageUrl} />
        <StatusBadge label="Additional Context" active={!!additionalContext} />
        <StatusBadge label="Initial Email" active={!!initialEmail} />
      </div>
    </section>
  );
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded ${
        active
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {label}: {active ? 'Set' : 'Empty'}
    </span>
  );
}
