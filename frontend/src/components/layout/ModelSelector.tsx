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

  useEffect(() => {
    async function fetchModels() {
      try {
        setIsLoading(true);
        setError(null);
        const models = await getAvailableModels();
        setAvailableModels(models);

        if (models.length > 0) {
          const defaultModel = models.find(m => m.isDefault) || models[0];
          if (defaultModel && onModelInitialized) {
            onModelInitialized(defaultModel.id);
          } else if (defaultModel && !selectedModelId) {
            // If no model is selected yet by parent, and onModelInitialized is not provided,
            // we can select the default one directly.
            onModelSelect(defaultModel.id);
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onModelInitialized]); // Rerun if onModelInitialized changes, though unlikely. Parent controls selection via onModelSelect.

  const currentSelectedModel = useMemo(() => {
    return availableModels.find(m => m.id === selectedModelId);
  }, [availableModels, selectedModelId]);

  const handleSelectModelInternal = (model: ModelInfo) => {
    onModelSelect(model.id);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2 px-3 py-2 rounded-md bg-neutral-700 text-sm text-neutral-400", className)} >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading models...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("px-3 py-2 rounded-md bg-red-800 text-sm text-red-200", className)} >
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

  // Fallback display name if model somehow not found, though unlikely with above checks
  const displayName = currentSelectedModel?.name || selectedModelId || 'Select Model';

  return (
    <div className={cn("relative", className)} >
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={availableModels.length === 0 || isLoading}
        className="flex w-full items-center justify-between space-x-2 px-3 py-2 rounded-md bg-neutral-700 hover:bg-neutral-600 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">{displayName}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && availableModels.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 w-full max-h-60 overflow-y-auto bg-neutral-800 border border-neutral-700 rounded-md shadow-lg py-1 z-50">
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelectModelInternal(model)}
              className={cn(
                'block w-full text-left px-3 py-2 text-sm hover:bg-neutral-600 transition-colors',
                selectedModelId === model.id ? 'text-sky-400 font-semibold bg-neutral-700' : 'text-neutral-200'
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
