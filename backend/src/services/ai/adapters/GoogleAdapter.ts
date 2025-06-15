import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import axios from 'axios';
import { AppConfig } from '../../../config/app';
import { AIAdapter, GenerateOptions, ModelInfo } from '../../../types/model';

const GOOGLE_PROVIDER_NAME = 'google';

// It's good practice to list some known/popular models,
// especially if the API's model list is extensive or includes non-relevant models.
const COMMON_GEMINI_MODELS_HINT: Partial<ModelInfo>[] = [
  { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', isDefault: true },
  { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
  // Older or more specific models can be added if needed, e.g., gemini-pro-vision
];

export class GoogleAdapter implements AIAdapter {
  public readonly provider = GOOGLE_PROVIDER_NAME;
  private genAI: GoogleGenerativeAI;
  private apiKey: string;
  // Google SDK typically does not require a base URL as it's embedded.

  constructor(apiKey?: string) {
    const providedApiKey = apiKey || AppConfig.googleApiKey;
    if (!providedApiKey) {
      throw new Error('Google API key is not configured.');
    }
    this.apiKey = providedApiKey;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const modelId = options?.modelId || 'gemini-1.5-pro-latest'; // Default model
      const systemPromptString = options?.systemPrompt;

      const modelInstance = this.genAI.getGenerativeModel({
        model: modelId,
        // Pass systemInstruction if provided in options
        ...(systemPromptString && { systemInstruction: systemPromptString }),
      });

      const generationConfig = {
        maxOutputTokens: options?.maxTokens || 1500,
        temperature: options?.temperature || 0.7,
        topP: options?.topP || 1,
      };

      // Safety settings can be configured if needed
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      if (options?.stream) {
        // const result = await modelInstance.generateContentStream(prompt);
        // let text = '';
        // for await (const chunk of result.stream) {
        //   text += chunk.text();
        // }
        // return text.trim();
        // Stream handling needs careful implementation based on SDK and desired return type.
        // For simplicity, we'll use non-streaming for now.
        const result = await modelInstance.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig,
          safetySettings,
        });
        return result.response.text().trim();
      } else {
        const result = await modelInstance.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig,
          safetySettings,
        });
        return result.response.text().trim();
      }
    } catch (error) {
      console.error('Error generating text with Google Gemini:', error);
      throw error;
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`
      );

      if (response.data && response.data.models) {
        let allGoogleModels = response.data.models;

        // --- Date Filtering Logic ---
        const currentYear = new Date().getFullYear();
        const oneYearAhead = currentYear + 1;

        allGoogleModels = allGoogleModels.filter((model: any) => {
          if (model.name) {
            const match = model.name.match(/(\d{4})(\d{2})?(\d{2})?$/); // Matches YYYYMMDD or YYYY at the end
            if (match && match[1]) {
              // ensure match[1] (year) exists
              const modelYear = parseInt(match[1], 10);
              if (modelYear > oneYearAhead) {
                return false;
              }
            }
          }
          return true;
        });
        // --- End Date Filtering Logic ---

        let filteredModels: ModelInfo[] = allGoogleModels
          .filter(
            (model: any) =>
              model.name &&
              model.name.startsWith('models/gemini-') &&
              model.supportedGenerationMethods &&
              model.supportedGenerationMethods.includes('generateContent') &&
              !(
                model.supportedGenerationMethods.includes('embedContent') &&
                model.supportedGenerationMethods.length === 1
              ) && // Exclude if ONLY embedContent
              !(model.name.includes('vision') && !model.name.includes('pro')) // Exclude gemini-pro-vision if not also pro text gen
          )
          .map((model: any) => {
            const modelId = model.name.replace('models/', '');
            return {
              id: modelId,
              name:
                model.displayName ||
                modelId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              provider: this.provider,
              description:
                model.description || `Google Gemini model: ${model.displayName || modelId}`,
              contextWindow: model.inputTokenLimit,
              isDefault: false, // Default will be set after sorting
            };
          });

        // Enhanced Sorting: Prioritize 2.x series, then 1.5, then 1.0. Within series, Pro then Flash/others.
        filteredModels.sort((a, b) => {
          const पकड़Series = (id: string): number => {
            if (id.includes('gemini-2.5')) return 5;
            if (id.includes('gemini-2.0')) return 4;
            if (id.includes('gemini-2.')) return 3; // General 2.x
            if (id.includes('gemini-1.5')) return 2;
            if (id.includes('gemini-1.0')) return 1;
            if (id.includes('gemini-')) return 0; // Other gemini
            return -1;
          };
          const seriesA = पकड़Series(a.id);
          const seriesB = पकड़Series(b.id);

          if (seriesA !== seriesB) {
            return seriesB - seriesA; // Higher series number first
          }

          // Within the same series, prioritize 'pro', then 'flash', then others
          const isProA = a.id.includes('-pro');
          const isProB = b.id.includes('-pro');
          const isFlashA = a.id.includes('-flash');
          const isFlashB = b.id.includes('-flash');

          if (isProA && !isProB) return -1;
          if (!isProA && isProB) return 1;
          if (isFlashA && !isFlashB) return -1;
          if (!isFlashA && isFlashB) return 1;

          // Fallback to name comparison if still tied (e.g. different dated versions)
          // Prefer 'latest' if IDs are otherwise similar
          if (a.id.includes('-latest') && !b.id.includes('-latest')) return -1;
          if (!a.id.includes('-latest') && b.id.includes('-latest')) return 1;

          return b.id.localeCompare(a.id); // Newer dated versions (if numbers used) might sort higher
        });

        // Set default after sorting
        if (filteredModels.length > 0) {
          // Try to set a 2.x pro or flash model as default if available
          let defaultSet = false;
          const preferredDefaults = [
            'gemini-2.5-pro-latest', // Ideal
            'gemini-2.5-pro-preview',
            'gemini-2.0-pro',
            'gemini-2.5-flash-latest',
            'gemini-2.5-flash-preview',
            'gemini-2.0-flash',
            'gemini-1.5-pro-latest', // Fallback
            'gemini-1.5-flash-latest', // Fallback
          ];

          for (const prefId of preferredDefaults) {
            const foundDefault = filteredModels.find((m) =>
              m.id.includes(prefId.replace('-latest', ''))
            ); // More robust match
            if (foundDefault) {
              foundDefault.isDefault = true;
              defaultSet = true;
              break;
            }
          }
          // If no preferred default found, set the first in the sorted list as default
          if (!defaultSet) {
            filteredModels[0].isDefault = true;
          }
        }

        if (filteredModels.length > 0) {
          return filteredModels.slice(0, 5); // Limit to top 5 relevant models
        }
      }
    } catch (error: any) {
      console.error(
        `Error fetching Google Gemini models dynamically (API key: ${
          this.apiKey ? 'provided' : 'MISSING'
        }):`,
        error.response?.data || error.message
      );
      // Fallback to a predefined list if API call fails or yields no suitable models
    }

    // Fallback to predefined list
    console.warn('GoogleAdapter: Falling back to predefined model list for Gemini.');
    return Promise.resolve(
      COMMON_GEMINI_MODELS_HINT.map((m) => ({
        ...m,
        id: m.id!,
        name: m.name!,
        provider: this.provider,
        description: m.description || `Google Gemini model: ${m.name}`,
      }))
    );
  }

  async checkHealth(): Promise<boolean> {
    try {
      // A simple health check could be to try generating a tiny amount of text from a fast model.
      const modelInstance = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      await modelInstance.generateContent('Health check');
      return true;
    } catch (error) {
      console.error('Google Gemini health check failed:', error);
      return false;
    }
  }

  async estimateCost(prompt: string, modelId: string): Promise<number> {
    console.warn(
      `[GoogleAdapter] estimateCost is a placeholder and not fully implemented for model ${modelId}. Returning 0.`
    );
    // TODO: Implement actual cost estimation based on Google's pricing and token counting.
    return 0;
  }
}
