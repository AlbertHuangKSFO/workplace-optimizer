import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '../../../config/app';
import { AIAdapter, GenerateOptions, ModelInfo } from '../../../types/model';

const ALIBABA_PROVIDER_NAME = 'alibaba';

// Known Qwen models available on DashScope (this list might need to be updated from API/docs)
const PREDEFINED_QWEN_MODELS_HINT: Partial<ModelInfo>[] = [
  {
    id: 'qwen-turbo',
    name: 'Qwen Turbo',
    provider: ALIBABA_PROVIDER_NAME,
    description: 'Cost-effective and performant model.',
    isDefault: true,
  },
  {
    id: 'qwen-plus',
    name: 'Qwen Plus',
    provider: ALIBABA_PROVIDER_NAME,
    description: 'Enhanced model with better capabilities.',
  },
  {
    id: 'qwen-max',
    name: 'Qwen Max',
    provider: ALIBABA_PROVIDER_NAME,
    description: 'Largest model for complex tasks.',
  },
  {
    id: 'qwen-max-longcontext',
    name: 'Qwen Max Long Context',
    provider: ALIBABA_PROVIDER_NAME,
    description: 'Qwen Max with extended context window.',
  },
  // Specific versions like qwen-72b-chat, qwen-14b-chat might also be listed via API
];

export class AlibabaAdapter implements AIAdapter {
  public readonly provider = ALIBABA_PROVIDER_NAME;
  private apiClient: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string, baseUrl?: string) {
    console.log('AlibabaAdapter constructor invoked - VERSION_CHECK_POINT_07_JULY_B'); // Unique log

    this.apiKey = apiKey || AppConfig.alibabaApiKey;
    if (!this.apiKey) {
      throw new Error('Alibaba API key (DashScope) is not configured.');
    }

    const potentialBaseUrl = baseUrl || AppConfig.alibabaBaseUrl;
    if (!potentialBaseUrl) {
      throw new Error(
        'Alibaba API base URL (DashScope) is not configured and no fallback is available. Ensure ALIBABA_BASE_URL is set in .env.'
      );
    }
    // Explicitly confirm it's a string for TypeScript after the check
    const confirmedBaseUrl: string = potentialBaseUrl;

    this.apiClient = axios.create({
      baseURL: confirmedBaseUrl, // This should now be safe
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const modelId = options?.modelId || 'qwen-turbo'; // Default Qwen model

      // DashScope API structure for Qwen chat models
      const payload = {
        model: modelId,
        input: {
          messages: [
            // System prompt can be the first message if supported by the specific Qwen model endpoint
            // Or handled differently based on model documentation
            ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
        },
        parameters: {
          result_format: 'message', // To get content in message format
          max_tokens: options?.maxTokens || 1500,
          temperature: options?.temperature || 0.7,
          top_p: options?.topP || 1,
          // stream: options?.stream || false, // Streaming needs specific header (Accept: text/event-stream)
        },
      };

      // For streaming, the header 'Accept: text/event-stream' is needed, and response handling is different.
      // This example focuses on non-streaming.
      if (options?.stream) {
        // TODO: Implement streaming for DashScope if needed.
        // This would involve setting 'Accept': 'text/event-stream' and parsing Server-Sent Events.
        console.warn(
          'Streaming for AlibabaAdapter (DashScope) is not fully implemented in this example.'
        );
      }

      // The endpoint for text generation can vary. Common one is /services/aigc/text-generation/generation
      // However, some models might have model-specific endpoints or different paths.
      // Checking DashScope documentation for the specific model is important.
      // Assuming a common chat completion like endpoint for qwen models:
      const response = await this.apiClient.post(
        '/services/aigc/text-generation/generation',
        payload
      );

      // Response structure for DashScope can vary. Example assumes `output.choices[0].message.content`
      if (
        response.data &&
        response.data.output &&
        response.data.output.choices &&
        response.data.output.choices[0]
      ) {
        return response.data.output.choices[0].message.content.trim();
      }
      // Older or different Qwen endpoints might return `output.text` directly
      if (response.data && response.data.output && response.data.output.text) {
        return response.data.output.text.trim();
      }

      console.error('Unexpected response structure from Alibaba DashScope:', response.data);
      throw new Error('Failed to parse response from Alibaba DashScope.');
    } catch (error: any) {
      console.error(
        'Error generating text with Alibaba (DashScope):',
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      // DashScope provides a /models endpoint
      const response = await this.apiClient.get('/models');
      if (response.data && response.data.data) {
        return response.data.data
          .filter(
            (model: any) =>
              model.id &&
              (model.id.toLowerCase().includes('qwen') ||
                model.name?.toLowerCase().includes('qwen')) &&
              model.task_group === 'text-generation' && // Ensure it's for text generation
              model.type === 'model' // Ensure it's a base model, not an adapter or other type
          )
          .map((model: any) => ({
            id: model.id,
            name: model.name || model.id, // Use name if available, otherwise ID
            provider: this.provider,
            description: model.description || `Alibaba Qwen model: ${model.name || model.id}`,
            // Other details like contextWindow might be in model.attributes or need to be inferred
          }));
      }
      console.warn(
        'Could not parse model list from Alibaba DashScope, returning predefined hints.'
      );
      return PREDEFINED_QWEN_MODELS_HINT.map(
        (m) =>
          ({
            ...m,
            id: m.id!,
            name: m.name!,
            provider: this.provider,
          } as ModelInfo)
      );
    } catch (error: any) {
      console.error(
        'Error fetching Alibaba (DashScope) models:',
        error.response?.data || error.message
      );
      // Fallback to a predefined list if API call fails
      return PREDEFINED_QWEN_MODELS_HINT.map(
        (m) =>
          ({
            ...m,
            id: m.id!,
            name: m.name!,
            provider: this.provider,
          } as ModelInfo)
      );
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // A simple health check could be to list models.
      await this.getModels();
      return true;
    } catch (error) {
      console.error('Alibaba (DashScope) health check failed:', error);
      return false;
    }
  }

  async estimateCost(prompt: string, modelId: string): Promise<number> {
    console.warn(
      `[AlibabaAdapter] estimateCost is a placeholder and not fully implemented for model ${modelId}. Returning 0.`
    );
    // TODO: Implement actual cost estimation based on Alibaba Cloud DashScope's pricing and token counting.
    // This would involve:
    // 1. Getting the specific model's pricing.
    // 2. Using a tokenizer relevant for Qwen models to count input tokens.
    // 3. Estimating output tokens.
    // 4. Calculating cost.
    return 0;
  }
}
