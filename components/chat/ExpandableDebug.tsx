'use client';

import { useState } from 'react';
import { MessageDebug } from '@/store/chatStore';
import { ModelLabel } from '@/components/ui/ModelLabel';

interface ExpandableDebugProps {
  debug: MessageDebug;
}

export function ExpandableDebug({ debug }: ExpandableDebugProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'analysis' | 'rag' | 'prompt'>('analysis');

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Debug Info
        </span>
        <span className="flex gap-1">
          <ModelLabel model="haiku" />
          {debug.ragResults.length > 0 && <ModelLabel model="openai" />}
          <ModelLabel model="sonnet" />
        </span>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t">
          {/* Tab buttons */}
          <div className="flex border-b">
            <TabButton
              label="Analysis"
              active={activeSection === 'analysis'}
              onClick={() => setActiveSection('analysis')}
              model="haiku"
            />
            <TabButton
              label={`RAG Results (${debug.ragResults.length})`}
              active={activeSection === 'rag'}
              onClick={() => setActiveSection('rag')}
              model="openai"
            />
            <TabButton
              label="Final Prompt"
              active={activeSection === 'prompt'}
              onClick={() => setActiveSection('prompt')}
              model="sonnet"
            />
          </div>

          {/* Tab content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {activeSection === 'analysis' && <AnalysisPanel analysis={debug.analysis} />}
            {activeSection === 'rag' && <RagPanel results={debug.ragResults} />}
            {activeSection === 'prompt' && <PromptPanel prompt={debug.finalPrompt} />}
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
  model,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  model: 'haiku' | 'openai' | 'sonnet';
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <span>{label}</span>
      <ModelLabel model={model} />
    </button>
  );
}

function AnalysisPanel({ analysis }: { analysis: MessageDebug['analysis'] }) {
  if (!analysis) {
    return <p className="text-sm text-gray-500">No analysis available</p>;
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Buying Stage & Warmth */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Buying Stage</h4>
          <StageBadge stage={analysis.buying_stage} />
          <p className="text-gray-600 mt-1 text-xs">{analysis.stage_evidence}</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Warmth</h4>
          <WarmthBadge warmth={analysis.warmth} />
          <p className="text-gray-600 mt-1 text-xs">{analysis.warmth_evidence}</p>
        </div>
      </div>

      {/* Intent */}
      <div>
        <h4 className="font-medium text-gray-700 mb-1">Intent</h4>
        <p className="text-gray-600">{analysis.intent}</p>
      </div>

      {/* Implicit Concerns */}
      {analysis.implicit_concerns.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Implicit Concerns</h4>
          <ul className="list-disc list-inside text-gray-600">
            {analysis.implicit_concerns.map((concern, i) => (
              <li key={i}>{concern}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Search Info */}
      <div>
        <h4 className="font-medium text-gray-700 mb-1">RAG Search</h4>
        {analysis.needs_search ? (
          <div className="space-y-1">
            <p className="text-gray-600">
              Queries: {analysis.search_queries?.join(', ') || 'None'}
            </p>
            {analysis.content_types && (
              <p className="text-gray-600">
                Content types: {analysis.content_types.join(', ')}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No search needed</p>
        )}
      </div>

      {/* Response Strategy */}
      <div>
        <h4 className="font-medium text-gray-700 mb-1">Response Strategy</h4>
        <div className="grid grid-cols-2 gap-2 text-gray-600">
          <div>
            <span className="text-gray-500">Approach:</span> {analysis.response_strategy.approach}
          </div>
          <div>
            <span className="text-gray-500">Tone:</span> {analysis.response_strategy.tone}
          </div>
          <div>
            <span className="text-gray-500">Length:</span> {analysis.response_strategy.length}
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Key Focus:</span> {analysis.response_strategy.key_focus}
          </div>
        </div>
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    curious: 'bg-gray-100 text-gray-700',
    interested: 'bg-yellow-100 text-yellow-700',
    evaluating: 'bg-blue-100 text-blue-700',
    ready: 'bg-green-100 text-green-700',
  };

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors[stage] || colors.curious}`}>
      {stage}
    </span>
  );
}

function WarmthBadge({ warmth }: { warmth: string }) {
  const colors: Record<string, string> = {
    cold: 'bg-blue-100 text-blue-700',
    warming: 'bg-yellow-100 text-yellow-700',
    warm: 'bg-orange-100 text-orange-700',
    hot: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors[warmth] || colors.cold}`}>
      {warmth}
    </span>
  );
}

function RagPanel({ results }: { results: MessageDebug['ragResults'] }) {
  if (results.length === 0) {
    return <p className="text-sm text-gray-500">No knowledge retrieved for this response</p>;
  }

  return (
    <div className="space-y-3">
      {results.map((chunk) => (
        <div key={chunk.id} className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              {chunk.metadata.type.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500">
              Score: {chunk.score.toFixed(3)}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
            {chunk.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function PromptPanel({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </div>
      <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto whitespace-pre-wrap font-mono">
        {prompt}
      </pre>
    </div>
  );
}
