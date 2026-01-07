'use client';

import { useState } from 'react';
import { useBuildStore } from '@/store/buildStore';
import { ModelLabel } from '@/components/ui/ModelLabel';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const sectionLabels: Record<string, string> = {
  identity: 'Identity & Positioning',
  icp: 'Ideal Customer Profile',
  email_framework: 'Email Framework',
  tone: 'Tone & Voice',
  objections: 'Objection Handling',
  competitive: 'Competitive Positioning',
};

const sectionOrder = ['identity', 'icp', 'email_framework', 'tone', 'objections', 'competitive'];

export function SystemPromptGenerator() {
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const cleanedData = useBuildStore((s) => s.cleanedData);
  const templateRules = useBuildStore((s) => s.templateRules);
  const userRules = useBuildStore((s) => s.userRules);
  const extractedSections = useBuildStore((s) => s.extractedSections);
  const generatingPrompt = useBuildStore((s) => s.generatingPrompt);
  const setExtractedSection = useBuildStore((s) => s.setExtractedSection);
  const setSystemPrompt = useBuildStore((s) => s.setSystemPrompt);
  const setGeneratingPrompt = useBuildStore((s) => s.setGeneratingPrompt);

  const hasCleanedData = Object.values(cleanedData).some((v) => v !== null);
  const hasExtractedSections = Object.keys(extractedSections).length > 0;

  const handleGenerate = async () => {
    if (!hasCleanedData) return;

    setError(null);
    setGeneratingPrompt(true);

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cleanedData,
          staticRules: templateRules,
          userRules,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate prompt');
      }

      const data = await response.json();

      Object.entries(data.sections).forEach(([section, content]) => {
        setExtractedSection(section, content as string);
      });

      setSystemPrompt(data.systemPrompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
    } finally {
      setGeneratingPrompt(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Extract structured sections from your cleaned data using Opus.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!hasCleanedData || generatingPrompt}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generatingPrompt ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Extracting...</span>
            </>
          ) : (
            <>
              <span>Generate System Prompt</span>
              <ModelLabel model="opus" />
            </>
          )}
        </button>
      </div>

      {!hasCleanedData && (
        <div className="bg-yellow-50 text-yellow-800 rounded-lg p-3 text-sm">
          Upload and clean data first to generate the system prompt.
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {hasExtractedSections && (
        <div className="border rounded-lg divide-y">
          {sectionOrder.map((section) => {
            const content = extractedSections[section];
            if (!content) return null;

            const isExpanded = expandedSection === section;

            return (
              <div key={section} className="bg-white">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-green-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <span className="font-medium text-gray-900">
                      {sectionLabels[section] || section}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg font-mono">
                      {content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
