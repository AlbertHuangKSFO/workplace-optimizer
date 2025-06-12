'use client';

import { cn } from '@/lib/utils';
import { getAvailableModels } from '@/services/modelService'; // Adjusted path
import { ModelInfo } from '@/types/model'; // Adjusted path
import { ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ModelSelector() {
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        setIsLoading(true);
        setError(null);
        const models = await getAvailableModels();
        setAvailableModels(models);
        if (models.length > 0) {
          // Try to set a default model, e.g., the first one or one marked as default
          const defaultModel = models.find(m => m.isDefault) || models[0];
          setSelectedModel(defaultModel);
        } else {
          setError('No models available.');
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
        setError('Failed to load models.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchModels();
  }, []);

  const handleSelectModel = (model: ModelInfo) => {
    setSelectedModel(model);
    setIsOpen(false);
    // TODO: Add logic to actually change the model in the application's state/context
    // This could involve calling a context update function or dispatching an action.
    console.log('Selected model:', model.name, 'from provider:', model.provider);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-neutral-700 text-sm text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading models...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-1.5 rounded-md bg-red-800 text-sm text-red-200">
        Error: {error}
      </div>
    );
  }

  if (!selectedModel) {
    return (
      <div className="px-3 py-1.5 rounded-md bg-neutral-700 text-sm text-neutral-400">
        No models loaded.
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={availableModels.length === 0}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>模型: {selectedModel.name}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && availableModels.length > 0 && (
        <div className="absolute right-0 mt-2 w-56 max-h-60 overflow-y-auto bg-neutral-750 border border-neutral-700 rounded-md shadow-lg py-1 z-50">
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelectModel(model)}
              className={cn(
                'block w-full text-left px-3 py-2 text-sm hover:bg-neutral-600 transition-colors',
                selectedModel?.id === model.id ? 'text-sky-400 font-semibold' : 'text-neutral-200'
              )}
              title={`${model.name} (${model.provider}) - ${model.description || 'N/A'}`}
            >
              <div className="flex justify-between items-center">
                <span className="truncate">{model.name}</span>
                <span className="text-xs text-neutral-400 ml-2 flex-shrink-0">{model.provider}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
