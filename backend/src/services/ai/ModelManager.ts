import NodeCache from 'node-cache';
import { AppConfig } from '../../config/app';
import { AIAdapter, ModelInfo } from '../../types/model';
import { AnthropicAdapter, GoogleAdapter, OpenAIAdapter } from './adapters';

const MODEL_CACHE_KEY = 'allAvailableModels';
const MODEL_CACHE_TTL_SECONDS = AppConfig.cacheTtlSeconds || 3600; // Default to 1 hour

export class ModelManager {
  private adapters: AIAdapter[] = [];
  private availableModels: ModelInfo[] = [];
  private cache: NodeCache;
  private static instance: ModelManager;

  private constructor() {
    this.cache = new NodeCache({ stdTTL: MODEL_CACHE_TTL_SECONDS });
    this.initializeAdapters();
  }

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  private initializeAdapters(): void {
    const adapterConstructors = [
      {
        key: 'openai',
        Adapter: OpenAIAdapter,
        apiKey: AppConfig.openaiApiKey,
        baseUrl: AppConfig.openaiBaseUrl,
      },
      {
        key: 'anthropic',
        Adapter: AnthropicAdapter,
        apiKey: AppConfig.anthropicApiKey,
        baseUrl: AppConfig.anthropicBaseUrl,
      },
      {
        key: 'google',
        Adapter: GoogleAdapter,
        apiKey: AppConfig.googleApiKey,
        baseUrl: AppConfig.googleGeminiBaseUrl,
      },
      // { key: 'alibaba', Adapter: AlibabaAdapter, apiKey: AppConfig.alibabaApiKey, baseUrl: AppConfig.alibabaBaseUrl }, // Temporarily removed
    ];
    adapterConstructors.forEach(({ key, Adapter, apiKey, baseUrl }) => {
      if (apiKey) {
        try {
          this.adapters.push(new Adapter(apiKey, baseUrl));
        } catch (error: any) {
          console.warn(`Failed to initialize ${key} Adapter:`, error.message);
        }
      }
    });
    console.log(`Initialized ${this.adapters.length} AI adapters.`);
  }

  public async loadModels(forceRefresh = false): Promise<ModelInfo[]> {
    if (!forceRefresh) {
      const cachedModels = this.cache.get<ModelInfo[]>(MODEL_CACHE_KEY);
      if (cachedModels) {
        this.availableModels = cachedModels;
        console.log(`Loaded ${cachedModels.length} models from cache.`);
        return cachedModels;
      }
    }

    console.log('Fetching models from all available adapters...');
    this.availableModels = [];
    const modelPromises = this.adapters.map((adapter) =>
      adapter.getModels().catch((error: any) => {
        console.error(`Error fetching models from ${adapter.provider}:`, error.message);
        return [] as ModelInfo[];
      })
    );

    const results = await Promise.all(modelPromises);
    results.forEach((modelsFromAdapter: ModelInfo[]) => {
      if (modelsFromAdapter) {
        this.availableModels.push(...modelsFromAdapter);
      }
    });

    const uniqueModelsMap = new Map<string, ModelInfo>();
    this.availableModels.forEach((model) => {
      if (!uniqueModelsMap.has(model.id)) {
        uniqueModelsMap.set(model.id, model);
      }
    });
    this.availableModels = Array.from(uniqueModelsMap.values());

    this.cache.set(MODEL_CACHE_KEY, this.availableModels);
    console.log(`Successfully fetched and cached ${this.availableModels.length} unique models.`);
    return this.availableModels;
  }

  public getAvailableModels(): ModelInfo[] {
    return this.availableModels.length > 0
      ? this.availableModels
      : this.cache.get<ModelInfo[]>(MODEL_CACHE_KEY) || [];
  }

  public getAdapter(providerName: string): AIAdapter | undefined {
    return this.adapters.find(
      (adapter) => adapter.provider.toLowerCase() === providerName.toLowerCase()
    );
  }

  public getAdapterForModel(modelId: string): AIAdapter | undefined {
    const modelInfo = this.getAvailableModels().find((m) => m.id === modelId);
    if (modelInfo && modelInfo.provider) {
      return this.getAdapter(modelInfo.provider);
    }
    // Fallback: try to infer provider from modelId prefix if not in availableModels (e.g. cache miss or new model)
    // This is a basic inference and might need to be more robust
    if (modelId.startsWith('gpt-') || modelId.includes('openai')) {
      // A bit broad for openai
      return this.getAdapter('openai');
    }
    if (modelId.startsWith('claude-')) {
      return this.getAdapter('anthropic');
    }
    if (modelId.startsWith('gemini-')) {
      return this.getAdapter('google');
    }
    // Add more specific inferences if needed or rely solely on availableModels lookup
    console.warn(
      `[ModelManager] Could not determine provider for modelId: ${modelId} from available models or direct inference.`
    );
    return undefined;
  }

  public async primeCache(): Promise<void> {
    await this.loadModels(true);
  }

  public async checkAllAdaptersHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};
    for (const adapter of this.adapters) {
      try {
        healthStatus[adapter.provider] = await adapter.checkHealth();
      } catch (e: any) {
        healthStatus[adapter.provider] = false;
        console.error(`Health check failed for ${adapter.provider}`, e.message);
      }
    }
    return healthStatus;
  }
}

(async () => {
  if (process.env.NODE_ENV !== 'test') {
    try {
      console.log('Priming AI model cache...');
      await ModelManager.getInstance().primeCache();
    } catch (error: any) {
      console.error('Failed to prime AI model cache on startup:', error.message);
    }
  }
})();
