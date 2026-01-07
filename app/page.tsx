'use client';

import { useState } from 'react';
import { Tab1BuildPhase } from '@/components/tabs/Tab1BuildPhase';
import { Tab2RuntimePhase } from '@/components/tabs/Tab2RuntimePhase';
import { SaveStateButton } from '@/components/state/SaveStateButton';
import { LoadStateModal } from '@/components/state/LoadStateModal';

type TabId = 'build' | 'runtime';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('build');
  const [loadModalOpen, setLoadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">RepSimulator Testing App</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setLoadModalOpen(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Load State
            </button>
            <SaveStateButton />
          </div>
        </div>
      </header>

      {/* Load State Modal */}
      <LoadStateModal isOpen={loadModalOpen} onClose={() => setLoadModalOpen(false)} />

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('build')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'build'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tab 1: Build Phase
            </button>
            <button
              onClick={() => setActiveTab('runtime')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'runtime'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tab 2: Runtime Phase
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'build' && <Tab1BuildPhase />}
        {activeTab === 'runtime' && <Tab2RuntimePhase />}
      </main>
    </div>
  );
}
