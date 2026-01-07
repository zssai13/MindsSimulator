'use client';

import { DataUploadZone } from '@/components/upload/DataUploadZone';
import { CleanedFileDisplay } from '@/components/upload/CleanedFileDisplay';
import { StaticRulesEditor } from '@/components/prompt/StaticRulesEditor';
import { SystemPromptGenerator } from '@/components/prompt/SystemPromptGenerator';
import { FinalPromptDisplay } from '@/components/prompt/FinalPromptDisplay';
import { DataType } from '@/store/buildStore';

const uploadZones: Array<{ type: DataType; label: string; description: string }> = [
  {
    type: 'transcripts',
    label: 'Sales Call Transcripts',
    description: 'Pre-cleaned transcript insights and winning patterns.',
  },
  {
    type: 'tickets',
    label: 'Support Tickets',
    description: 'Pre-cleaned support ticket summaries and common issues.',
  },
  {
    type: 'website',
    label: 'Website Content',
    description: 'Pre-cleaned marketing and website copy.',
  },
  {
    type: 'research',
    label: 'Business Research',
    description: 'Pre-cleaned market research, ICP definitions, competitive analysis.',
  },
];

export function Tab1BuildPhase() {
  const handleSendToTab2 = () => {
    // This will be implemented when Tab 2 is built
    // For now, just show an alert
    alert('System prompt is ready! Tab 2 (Runtime Phase) will be available in Phase 2.');
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Build Phase</h2>
        <p className="text-gray-600 mt-1">
          Upload your pre-cleaned data and generate your AI sales rep&apos;s system prompt.
        </p>
      </div>

      {/* Section 1: Data Upload */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">1. Data Upload</h3>
          <p className="text-sm text-gray-500">
            Upload your pre-cleaned markdown files. These will be used to generate the system prompt.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploadZones.map((zone) => (
            <DataUploadZone
              key={zone.type}
              type={zone.type}
              label={zone.label}
              description={zone.description}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Uploaded Files */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">2. Uploaded Files</h3>
          <p className="text-sm text-gray-500">
            View and download uploaded files. These will be used to generate your system prompt.
          </p>
        </div>
        <CleanedFileDisplay />
      </section>

      {/* Section 3: Static Rules */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">3. Static Rules</h3>
          <p className="text-sm text-gray-500">
            Configure operational rules and constraints for the AI.
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <StaticRulesEditor />
        </div>
      </section>

      {/* Section 4: System Prompt Generation */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">4. System Prompt Generation</h3>
          <p className="text-sm text-gray-500">
            Extract structured sections from your data using Opus.
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <SystemPromptGenerator />
        </div>
      </section>

      {/* Section 5: Final System Prompt */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">5. Final System Prompt</h3>
          <p className="text-sm text-gray-500">
            The combined system prompt ready for use. Copy, download, or send to Tab 2.
          </p>
        </div>
        <FinalPromptDisplay onSendToTab2={handleSendToTab2} />
      </section>
    </div>
  );
}
