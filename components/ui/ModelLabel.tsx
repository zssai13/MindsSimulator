'use client';

interface ModelLabelProps {
  model: 'opus' | 'sonnet' | 'haiku' | 'openai';
}

const modelConfig = {
  opus: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'opus' },
  sonnet: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'sonnet' },
  haiku: { bg: 'bg-green-100', text: 'text-green-700', label: 'haiku' },
  openai: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'openai' },
};

export function ModelLabel({ model }: ModelLabelProps) {
  const config = modelConfig[model];

  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
