'use client';

import { Github, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ModelSelector } from './ModelSelector';

// Placeholder for ModelSelector, to be created later as per docs
// import ModelSelector from './ModelSelector';

export function Header() {
  const githubUrl = 'https://github.com/AlbertHuangKSFO/workplace-optimizer';
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  console.log('[Header] Current selectedModelId state:', selectedModelId);

  const handleModelSelect = useCallback((modelId: string) => {
    console.log('[Header] handleModelSelect called with:', modelId);
    setSelectedModelId(modelId);
  }, []);

  const handleModelInitialized = useCallback((defaultModelId: string) => {
    console.log('[Header] handleModelInitialized called with:', defaultModelId);
    setSelectedModelId(defaultModelId);
  }, []);

  return (
    <header className="h-14 flex items-center justify-between bg-neutral-800 px-6 border-b border-neutral-700 flex-shrink-0">
      <div>
        {/* This could be dynamically updated based on the selected tool */}
        <h1 className="text-md font-medium text-neutral-200">当前工具: 话术优化器</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ModelSelector
          selectedModelId={selectedModelId}
          onModelSelect={handleModelSelect}
          onModelInitialized={handleModelInitialized}
        />
        {/* Placeholder for ModelSelector */}
        {/* <ModelSelector /> */}
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-colors"
        >
          <Github size={20} />
        </a>
        <button
          title="User Profile"
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-colors"
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
