import Anthropic from '@anthropic-ai/sdk';
import { AppConfig } from '../../../config/app';
import { AIAdapter, GenerateOptions, ModelInfo } from '../../../types/model';

const ANTHROPIC_PROVIDER_NAME = 'anthropic';

// Common Claude models (官方最新模型列表)
const PREDEFINED_CLAUDE_MODELS: ModelInfo[] = [
  // Claude 4 Models (Latest)
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude 4 Opus',
    provider: ANTHROPIC_PROVIDER_NAME,
    description: "Anthropic's most powerful and capable model for highly complex tasks.",
    contextWindow: 200000,
    isDefault: false,
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude 4 Sonnet',
    provider: ANTHROPIC_PROVIDER_NAME,
    description: 'High-performance model with exceptional reasoning capabilities.',
    contextWindow: 200000,
    isDefault: true, // 设为默认，因为它是最新的平衡模型
  },
  // Claude 3.7 Models
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    provider: ANTHROPIC_PROVIDER_NAME,
    description: 'High-performance model with early extended thinking capabilities.',
    contextWindow: 200000,
    isDefault: false,
  },
  // Claude 3.5 Models
  {
    id: 'claude-3-5-sonnet-20241022', // Latest 3.5 Sonnet
    name: 'Claude 3.5 Sonnet v2',
    provider: ANTHROPIC_PROVIDER_NAME,
    description: 'Latest Claude 3.5 Sonnet with enhanced capabilities.',
    contextWindow: 200000,
    isDefault: false,
  },
  {
    id: 'claude-3-5-sonnet-20240620', // Previous 3.5 Sonnet
    name: 'Claude 3.5 Sonnet',
    provider: ANTHROPIC_PROVIDER_NAME,
    description: 'Intelligent model balancing performance and cost.',
    contextWindow: 200000,
    isDefault: false,
  },
  {
    id: 'claude-3-5-haiku-20241022', // Latest 3.5 Haiku
    name: 'Claude 3.5 Haiku',
    provider: ANTHROPIC_PROVIDER_NAME,
    description: 'Fastest Claude model with blazing speed and accuracy.',
    contextWindow: 200000,
    isDefault: false,
  },
  // Claude 3 Models (Legacy but still supported)
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: ANTHROPIC_PROVIDER_NAME,
    description: 'Powerful model for complex tasks.',
    contextWindow: 200000,
    isDefault: false,
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: ANTHROPIC_PROVIDER_NAME,
    description: 'Balanced intelligence and speed.',
    contextWindow: 200000,
    isDefault: false,
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: ANTHROPIC_PROVIDER_NAME,
    description: 'Fast and compact model for near-instant responsiveness.',
    contextWindow: 200000,
    isDefault: false,
  },
];

export class AnthropicAdapter implements AIAdapter {
  public readonly provider = ANTHROPIC_PROVIDER_NAME;
  private client: Anthropic;
  private apiKey: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || AppConfig.anthropicApiKey;
    if (!this.apiKey) {
      throw new Error('Anthropic API key is not configured.');
    }

    const potentialBaseUrl = baseUrl || AppConfig.anthropicBaseUrl;
    let confirmedBaseUrl: string | undefined = undefined;
    if (potentialBaseUrl && potentialBaseUrl.trim() !== '') {
      confirmedBaseUrl = potentialBaseUrl;
    } else if (baseUrl === '' || (AppConfig.anthropicBaseUrl === '' && baseUrl === undefined)) {
      confirmedBaseUrl = undefined;
    }

    this.client = new Anthropic({
      apiKey: this.apiKey,
      baseURL: confirmedBaseUrl,
      defaultHeaders: {
        'anthropic-version': '2023-06-01',
      },
    });
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const modelId = options?.modelId || 'claude-sonnet-4-20250514';
      const messages: Anthropic.Messages.MessageParam[] = [{ role: 'user', content: prompt }];
      const systemPrompt = options?.systemPrompt;

      if (options?.stream) {
        // The SDK's .stream() helper method or iterating over client.messages.create({ stream: true })
        // would be used for actual streaming. This adapter isn't fully set up for that.
        console.warn(
          'AnthropicAdapter: Streaming is not fully implemented. Please use non-streaming mode.'
        );
        throw new Error('Streaming for AnthropicAdapter is not fully supported yet.');
      } else {
        // Non-streaming case
        const response: Anthropic.Message = await this.client.messages.create({
          model: modelId,
          messages: messages,
          system: systemPrompt,
          max_tokens: options?.maxTokens || 1500,
          temperature: options?.temperature || 0.7,
          top_p: options?.topP || 1,
          stream: false, // Explicitly false for this path
        });

        if (response.content && response.content.length > 0) {
          const firstBlock = response.content[0];
          if (firstBlock.type === 'text') {
            return firstBlock.text.trim();
          }
          // Handle cases where the first block might not be text, though for typical chat it should be.
          console.warn(
            `Anthropic response's first content block was type '${firstBlock.type}', not 'text'. Full content:`,
            response.content
          );
          return `[Received non-text content: ${firstBlock.type}]`;
        }
        console.warn('Anthropic response contained no content blocks.', response);
        return ''; // Or throw an error, depending on desired behavior for empty content
      }
    } catch (error) {
      console.error('Error generating text with Anthropic:', error);
      throw error;
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    const currentYear = new Date().getFullYear();
    const oneYearAhead = currentYear + 1;

    const filteredModels = PREDEFINED_CLAUDE_MODELS.filter((model) => {
      const match = model.id.match(/(\d{4})(\d{2})(\d{2})$/);
      if (match) {
        const modelYear = parseInt(match[1], 10);
        // const modelMonth = parseInt(match[2], 10); // Available if needed for finer control
        // const modelDay = parseInt(match[3], 10);   // Available if needed for finer control

        // Exclude if model year is more than one year ahead of current year
        if (modelYear > oneYearAhead) {
          return false;
        }
      }
      return true; // Keep models without a clear date string or within the acceptable range
    });

    return Promise.resolve(filteredModels.map((m) => ({ ...m, provider: this.provider })));
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'Health check' }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      console.error('Anthropic health check failed:', error);
      return false;
    }
  }

  async estimateCost(prompt: string, modelId: string): Promise<number> {
    console.warn(
      `[AnthropicAdapter] estimateCost is a placeholder and not fully implemented for model ${modelId}. Returning 0.`
    );
    // TODO: Implement actual cost estimation based on Anthropic's pricing and token counting.
    return 0;
  }
}
