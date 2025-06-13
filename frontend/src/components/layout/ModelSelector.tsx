'use client';

import { cn } from '@/lib/utils';
import { getAvailableModels } from '@/services/modelService'; // Adjusted path
import { ModelInfo } from '@/types/model'; // Adjusted path
import { ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface ModelSelectorProps {
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  onModelInitialized?: (defaultModelId: string) => void;
  className?: string; // Allow passing custom styling
}

export function ModelSelector({
  selectedModelId,
  onModelSelect,
  onModelInitialized,
  className
}: ModelSelectorProps) {
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('[ModelSelector] Props received: selectedModelId:', selectedModelId);

  useEffect(() => {
    console.log('[ModelSelector] useEffect running. About to call fetchModels');
    async function fetchModels() {
      console.log('[ModelSelector] fetchModels started.');
      try {
        setIsLoading(true);
        setError(null);
        const models = await getAvailableModels();
        console.log('[ModelSelector] Models fetched:', models);
        setAvailableModels(models);

        if (models.length > 0) {
          const defaultModel = models.find(m => m.isDefault) || models[0];
          console.log('[ModelSelector] Default model determined:', defaultModel);
          if (defaultModel) {
            console.log('[ModelSelector] Calling onModelInitialized with:', defaultModel.id);
            if (onModelInitialized) {
              onModelInitialized(defaultModel.id);
            } else {
              onModelSelect(defaultModel.id);
            }
          }
        } else {
          console.log('[ModelSelector] No models available after fetch.');
          setError('No models available.');
        }
      } catch (err) {
        console.error('[ModelSelector] Failed to fetch models:', err);
        setError('Failed to load models.');
      } finally {
        setIsLoading(false);
        console.log('[ModelSelector] fetchModels finished.');
      }
    }
    fetchModels();
  }, []); // Changed: Remove dependency on onModelInitialized to prevent infinite loops

  const currentSelectedModel = useMemo(() => {
    const model = availableModels.find(m => m.id === selectedModelId);
    console.log('[ModelSelector] currentSelectedModel computed:', model, 'based on selectedModelId:', selectedModelId);
    return model;
  }, [availableModels, selectedModelId]);

  const handleSelectModelInternal = (model: ModelInfo) => {
    console.log('[ModelSelector] handleSelectModelInternal called for model:', model.id, 'Current prop selectedModelId:', selectedModelId);
    onModelSelect(model.id);
    setIsOpen(false);
  };

  const displayName = currentSelectedModel?.name || selectedModelId || 'Select Model';
  console.log('[ModelSelector] Render: displayName:', displayName, 'isLoading:', isLoading, 'error:', error);

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2 px-4 py-2.5 rounded-md bg-neutral-700 text-sm text-neutral-400 min-w-[280px]", className)} >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading models...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("px-4 py-2.5 rounded-md bg-red-800 text-sm text-red-200 min-w-[280px]", className)} >
        Error: {error}
      </div>
    );
  }

  if (!currentSelectedModel && availableModels.length > 0) {
    // This case might happen briefly if parent hasn't updated selectedModelId after initialization
    // Or if the selectedModelId from parent is invalid.
    return (
      <div className={cn("px-3 py-2 rounded-md bg-neutral-700 text-sm text-neutral-400", className)} >
        Select a model...
      </div>
    );
  }
  if (!currentSelectedModel && availableModels.length === 0 && !isLoading) {
     return (
      <div className={cn("px-3 py-2 rounded-md bg-neutral-700 text-sm text-neutral-400", className)} >
        No models loaded.
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} >
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={availableModels.length === 0 || isLoading}
        className="flex w-full min-w-[280px] items-center justify-between space-x-2 px-4 py-2.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="truncate font-medium">{displayName}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform flex-shrink-0', isOpen && 'rotate-180')} />
      </button>
      {isOpen && availableModels.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 w-full min-w-[280px] max-h-60 overflow-y-auto bg-neutral-800 border border-neutral-700 rounded-md shadow-lg py-1 z-50">
          {availableModels.map((model) => (
                          <button
              key={model.id}
              onClick={() => handleSelectModelInternal(model)}
              className={cn(
                'block w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-600 transition-colors',
                selectedModelId === model.id ? 'text-sky-400 font-semibold bg-neutral-700' : 'text-neutral-200'
              )}
              title={`${model.name} (${model.provider}) - ${model.description || 'N/A'}`}
            >
              <div className="flex justify-between items-center gap-3">
                <span className="truncate font-medium">{model.name}</span>
                <span className="text-xs text-neutral-400 flex-shrink-0 bg-neutral-600 px-2 py-1 rounded">{model.provider}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
