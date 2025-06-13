import OpenAI from 'openai';
import { AppConfig } from '../../../config/app'; // Assuming config loader
import { AIAdapter, GenerateOptions, ModelInfo } from '../../../types/model';

const OPENAI_PROVIDER_NAME = 'openai';

function getOpenAIModelDisplayName(modelId: string): string {
  const nameMap: Record<string, string> = {
    'gpt-4o': 'GPT-4 Omni',
    'gpt-4o-mini': 'GPT-4 Omni Mini',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4-turbo-preview': 'GPT-4 Turbo Preview',
    'gpt-4-0125-preview': 'GPT-4 Turbo (0125 Preview)',
    'gpt-4-vision-preview': 'GPT-4 Vision Preview',
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'gpt-3.5-turbo-0125': 'GPT-3.5 Turbo (0125)',
    'gpt-3.5-turbo-16k': 'GPT-3.5 Turbo (16K)',
    // Add more mappings as new models are supported or recognized
  };
  // Attempt to find a direct match
  if (nameMap[modelId]) {
    return nameMap[modelId];
  }
  // Handle dated versions like gpt-4o-2024-05-13
  const datedMatch = modelId.match(/^(gpt-4o|gpt-4-turbo)-(\d{4}-\d{2}-\d{2})$/);
  if (datedMatch && nameMap[datedMatch[1]]) {
    return `${nameMap[datedMatch[1]]} (${datedMatch[2]})`;
  }
  // Fallback for models not in the map or more complex IDs
  return modelId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export class OpenAIAdapter implements AIAdapter {
  public readonly provider = OPENAI_PROVIDER_NAME;
  private client: OpenAI;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || AppConfig.openaiApiKey;
    this.baseUrl = baseUrl || AppConfig.openaiBaseUrl;

    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }

    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const modelId = options?.modelId || 'gpt-3.5-turbo'; // Default model
      const systemPromptContent = options?.systemPrompt;

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      if (systemPromptContent) {
        messages.push({ role: 'system', content: systemPromptContent });
      }
      messages.push({ role: 'user', content: prompt });

      if (options?.stream) {
        const stream = await this.client.chat.completions.create({
          model: modelId,
          messages: messages, // Use the constructed messages array
          max_tokens: options?.maxTokens || 1500,
          temperature: options?.temperature || 0.7,
          top_p: options?.topP || 1,
          stream: true,
        });

        let streamedContent = '';
        for await (const chunk of stream) {
          streamedContent += chunk.choices[0]?.delta?.content || '';
        }
        return streamedContent.trim();
      } else {
        const completion = await this.client.chat.completions.create({
          model: modelId,
          messages: messages, // Use the constructed messages array
          max_tokens: options?.maxTokens || 1500,
          temperature: options?.temperature || 0.7,
          top_p: options?.topP || 1,
          stream: false,
        });
        // Explicitly cast to non-streaming type for safety, though technically covered by stream: false
        const chatCompletion = completion as OpenAI.Chat.Completions.ChatCompletion;
        return chatCompletion.choices[0]?.message?.content?.trim() || '';
      }
    } catch (error) {
      console.error('Error generating text with OpenAI:', error);
      throw error; // Rethrow or handle more gracefully
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.models.list();
      let allModels = response.data;

      // --- Date Filtering Logic ---
      const currentYear = new Date().getFullYear();
      const oneYearAhead = currentYear + 1;

      allModels = allModels.filter((model) => {
        // Try to match YYYYMMDD or YYYY-MM-DD in the model id
        const match = model.id.match(/(\d{4})-?(\d{2})-?(\d{2})/);
        if (match) {
          const modelYear = parseInt(match[1], 10);
          // Exclude if model year is more than one year ahead of current year
          if (modelYear > oneYearAhead) {
            return false;
          }
        }
        // Special handling for IDs like "gpt-4o" that don't have a date but are current
        // Or for models like "gpt-4o-mini" which might not always have full dates
        // These will be kept by default unless a date match specifically excludes them.
        return true; // Keep models without a clear future date string or within the acceptable range
      });
      // --- End Date Filtering Logic ---

      // More focused patterns for desired chat models
      const knownChatModelPatterns = [
        /^gpt-4o$/, // Exact match for the latest primary 'o' model
        /^gpt-4o-\\d{4}-\\d{2}-\\d{2}$/, // Dated versions of gpt-4o
        /^gpt-4o-mini/, // gpt-4o-mini and its dated versions
        /^gpt-4-turbo$/, // Exact match for the latest primary turbo model
        /^gpt-4-turbo-\\d{4}-\\d{2}-\\d{2}$/, // Dated versions of gpt-4-turbo
        /^gpt-4-turbo-preview$/, // Common preview alias
        /^gpt-4-\\d{4}-preview$/, // general gpt-4 previews like gpt-4-0125-preview
        /^gpt-4$/, // Base gpt-4 if still relevant
        /^gpt-3\\.5-turbo$/, // Exact match for the primary 3.5 turbo
        /^gpt-3\\.5-turbo-\\d{4}$/, // Dated versions like gpt-3.5-turbo-0125
        /^gpt-3\\.5-turbo-16k$/, // If 16k is still specifically desired
      ];

      // More comprehensive exclusion patterns
      const excludedModelPatterns = [
        /instruct$/,
        /completion$/,
        /text-davinci/,
        /text-curie/,
        /text-babbage/,
        /text-ada/,
        /davinci/,
        /curie/,
        /babbage/,
        /ada$/, // Exact match for older base models
        /code/,
        /edit/,
        /search/,
        /similarity/,
        /embedding/,
        /audio/,
        /whisper/,
        /tts/,
        /image/,
        /dall-e/,
        /vision(?!(.*-preview$))/, // Exclude vision unless it's a preview we might want (e.g. gpt-4-vision-preview) - but gpt-4o handles vision.
        /mini((?!-realtime-preview).)*$/, // Exclude mini variants unless it's a specific preview. gpt-4o-mini is handled by knownChatModelPatterns
        /-ft-/, // Fine-tuned models
        /deprecate/i, // Models marked for deprecation
      ];

      let chatModels = allModels.filter((model) => {
        const modelId = model.id;
        const isKnownChat = knownChatModelPatterns.some((pattern) => pattern.test(modelId));
        const isExcluded = excludedModelPatterns.some((pattern) => pattern.test(modelId));

        // Specific handling for vision preview if it's explicitly a chat model pattern
        if (modelId.includes('vision-preview') && isKnownChat) {
          return true; // Keep if it matches a known chat pattern and is vision-preview
        }

        return isKnownChat && !isExcluded;
      });

      // Preferred order for latest and most relevant models
      const preferredOrder = [
        'gpt-4o', // Absolute latest primary model
        // Specific dated gpt-4o if needed, but usually the alias is enough
        'gpt-4o-mini', // Latest mini variant
        'gpt-4-turbo', // Latest turbo
        // Specific dated gpt-4-turbo if needed
        'gpt-4-turbo-preview', // Common turbo preview alias
        'gpt-4-0125-preview', // Example of a recent specific preview if desired
        'gpt-4', // Base GPT-4
        'gpt-3.5-turbo', // Primary 3.5 turbo
        'gpt-3.5-turbo-0125', // A recent specific 3.5 turbo
        // 'gpt-4-vision-preview', // If explicitly needed, gpt-4o should cover vision
      ];

      // Sort based on preferred order, then by recency (implicit in OpenAI's list or by date in ID if available)
      chatModels.sort((a, b) => {
        let aIndex = preferredOrder.findIndex((id) => a.id === id || a.id.startsWith(id + '-'));
        let bIndex = preferredOrder.findIndex((id) => b.id === id || b.id.startsWith(id + '-'));

        aIndex = aIndex === -1 ? Infinity : aIndex;
        bIndex = bIndex === -1 ? Infinity : bIndex;

        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }
        // Fallback: sort more recent dated versions first if primary rank is the same
        const dateRegex = /-(\\d{4}-\\d{2}-\\d{2})$|(-\\d{4})$/; // Matches YYYY-MM-DD or YYYY (like in gpt-3.5-turbo-0125)
        const aDateMatch = a.id.match(dateRegex);
        const bDateMatch = b.id.match(dateRegex);

        if (aDateMatch && bDateMatch) {
          return bDateMatch[0].localeCompare(aDateMatch[0]); // Sort descending by date string
        }
        if (aDateMatch) return -1; // a has date, b does not, a is more specific/recent
        if (bDateMatch) return 1; // b has date, a does not, b is more specific/recent

        return b.id.localeCompare(a.id); // Default to reverse alphabetical for latest among same prefix
      });

      // Remove duplicates by ID that might arise from overlapping regexes or sorting preferences
      const uniqueModels = Array.from(
        new Map(chatModels.map((model) => [model.id, model])).values()
      );

      // Limit to a few latest/most relevant ones, e.g., top 5-7
      const limitedModels = uniqueModels.slice(0, 7);

      const defaultModelId = 'gpt-4o'; // Primary default

      // Filter out any models that didn't match primary chat patterns but slipped through
      let finalFilteredModels = limitedModels.filter((model) =>
        knownChatModelPatterns.some((pattern) => pattern.test(model.id))
      );

      // Limit to the top N models (e.g., 5-7)
      finalFilteredModels = finalFilteredModels.slice(0, 7);

      if (finalFilteredModels.length === 0 && limitedModels.length > 0) {
        // Fallback: if primary filters yield nothing but there were some models,
        // take the top 1-2 from sorted (which might be less ideal but better than nothing)
        console.warn(
          'OpenAIAdapter: Primary chat model filters yielded no results, falling back to top sorted models.'
        );
        finalFilteredModels = limitedModels.slice(0, 2);
      }

      return finalFilteredModels.map((model) => ({
        id: model.id,
        name: getOpenAIModelDisplayName(model.id), // Use helper function for display name
        provider: this.provider,
        description: `OpenAI model: ${getOpenAIModelDisplayName(model.id)}`, // Also use display name in description
        owned_by: model.owned_by, // Retain owned_by from OpenAI's response
        isDefault:
          model.id === defaultModelId ||
          (finalFilteredModels.length === 1 && model.id === 'gpt-3.5-turbo'),
      }));
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
      // Fallback to a predefined list if API call fails
      // Ensure fallback models also have user-friendly names
      const fallbackModels: Omit<ModelInfo, 'provider'>[] = [
        { id: 'gpt-4o', name: 'GPT-4 Omni', isDefault: true },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      ];
      return fallbackModels.map((m) => ({
        ...m,
        provider: this.provider,
        name: getOpenAIModelDisplayName(m.id), // Apply display name to fallbacks too
        description: `OpenAI model: ${getOpenAIModelDisplayName(m.id)}`,
      }));
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // A simple health check could be to list models or retrieve a specific model
      await this.client.models.retrieve('gpt-3.5-turbo'); // Check if a common model can be retrieved
      return true;
    } catch (error) {
      console.error('OpenAI health check failed:', error);
      return false;
    }
  }

  async estimateCost(prompt: string, modelId: string): Promise<number> {
    console.warn(
      `[OpenAIAdapter] estimateCost is a placeholder and not fully implemented for model ${modelId}. Returning 0.`
    );
    // TODO: Implement actual cost estimation based on OpenAI's pricing and token counting.
    // This would involve:
    // 1. Getting the specific model's pricing (input/output per token/1k tokens).
    // 2. Using a tokenizer (like tiktoken for OpenAI) to count input tokens.
    // 3. Estimating output tokens (this is tricky, might need a rough guess or be based on maxTokens).
    // 4. Calculating cost.
    return 0;
  }
}
