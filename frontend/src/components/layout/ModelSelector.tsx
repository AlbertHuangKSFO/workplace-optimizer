'use client';

import { cn } from '@/lib/utils';
import { getAvailableModels } from '@/services/modelService';
import { ModelInfo } from '@/types/model';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface ModelSelectorProps {
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  onModelInitialized?: (defaultModelId: string) => void;
  className?: string;
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

  console.log('[ModelSelector] Component rendered. Props:', { selectedModelId, hasOnModelSelect: !!onModelSelect, hasOnModelInitialized: !!onModelInitialized });

  useEffect(() => {
    console.log('[ModelSelector] useEffect triggered!');

    let isMounted = true; // 防止组件卸载后的状态更新

    async function fetchModels() {
      console.log('[ModelSelector] fetchModels started');

      if (!isMounted) {
        console.log('[ModelSelector] Component unmounted, aborting fetch');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('[ModelSelector] About to call getAvailableModels()');
        const models = await getAvailableModels();
        console.log('[ModelSelector] getAvailableModels() returned:', models?.length || 0, 'models');

        if (!isMounted) {
          console.log('[ModelSelector] Component unmounted during fetch, ignoring result');
          return;
        }

        setAvailableModels(models || []);

        if (models && models.length > 0) {
          const defaultModel = models.find(m => m.isDefault) || models[0];
          console.log('[ModelSelector] Default model selected:', defaultModel?.id);

          if (defaultModel) {
            if (onModelInitialized) {
              console.log('[ModelSelector] Calling onModelInitialized with:', defaultModel.id);
              onModelInitialized(defaultModel.id);
            } else {
              console.log('[ModelSelector] Calling onModelSelect with:', defaultModel.id);
              onModelSelect(defaultModel.id);
            }
          }
        } else {
          console.log('[ModelSelector] No models available');
          setError('No models available.');
        }
      } catch (err: any) {
        console.error('[ModelSelector] Error in fetchModels:', err);
        console.error('[ModelSelector] Error details:', {
          message: err?.message,
          stack: err?.stack,
          response: err?.response
        });

        if (!isMounted) return;

        setError(`Failed to load models: ${err?.message || 'Unknown error'}`);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('[ModelSelector] fetchModels completed');
        }
      }
    }

    // 立即调用
    fetchModels();

    // 清理函数
    return () => {
      console.log('[ModelSelector] useEffect cleanup');
      isMounted = false;
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次

  const currentSelectedModel = useMemo(() => {
    const model = availableModels.find(m => m.id === selectedModelId);
    console.log('[ModelSelector] currentSelectedModel computed:', model?.id, 'from selectedModelId:', selectedModelId);
    return model;
  }, [availableModels, selectedModelId]);

  const handleSelectModelInternal = (model: ModelInfo) => {
    console.log('[ModelSelector] Model selected:', model.id);
    onModelSelect(model.id);
    setIsOpen(false);
  };

  const displayName = currentSelectedModel?.name || selectedModelId || 'Select Model';
  console.log('[ModelSelector] Rendering with state:', { displayName, isLoading, error: !!error, modelsCount: availableModels.length });

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2 px-4 py-2.5 rounded-md bg-neutral-700 text-sm text-neutral-400 min-w-[280px]", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading models...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("px-4 py-2.5 rounded-md bg-red-800 text-sm text-red-200 min-w-[280px]", className)}>
        Error: {error}
      </div>
    );
  }

  if (!currentSelectedModel && availableModels.length > 0) {
    return (
      <div className={cn("px-3 py-2 rounded-md bg-neutral-700 text-sm text-neutral-400", className)}>
        Select a model...
      </div>
    );
  }

  if (!currentSelectedModel && availableModels.length === 0 && !isLoading) {
    return (
      <div className={cn("px-3 py-2 rounded-md bg-neutral-700 text-sm text-neutral-400", className)}>
        No models loaded.
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
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
