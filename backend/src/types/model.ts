export interface ModelInfo {
  id: string; // Unique identifier for the model, e.g., 'gpt-4-turbo', 'claude-3-opus-20240229'
  name: string; // User-friendly display name, e.g., "GPT-4 Turbo", "Claude 3 Opus"
  provider: string; // Name of the AI provider, e.g., 'openai', 'anthropic', 'google', 'alibaba'
  description?: string; // Optional description of the model
  contextWindow?: number; // Maximum context window in tokens
  inputModalities?: string[]; // Supported input types, e.g., ['text', 'image']
  outputModalities?: string[]; // Supported output types, e.g., ['text']
  isDefault?: boolean; // Whether this model is a default option for its provider or globally
  // Pricing information (optional, can be complex and vary by region/use)
  pricing?: {
    inputCostPer1MTokens?: number; // Cost per 1 million input tokens
    outputCostPer1MTokens?: number; // Cost per 1 million output tokens
    unit?: string; // Currency unit, e.g., 'USD'
  };
  // Provider-specific metadata can be added here
  [key: string]: any;
}

export interface GenerateOptions {
  modelId?: string; // Specific model ID to use for this generation request
  maxTokens?: number; // Maximum number of tokens to generate
  temperature?: number; // Sampling temperature (0.0 - 2.0)
  topP?: number; // Nucleus sampling parameter
  stream?: boolean; // Whether to stream the response
  systemPrompt?: string; // System-level instructions for the model
  // Other common or provider-specific options can be added here
  [key: string]: any;
}

export interface AIAdapter {
  provider: string; // Identifier for the provider (e.g., 'openai', 'anthropic')

  /**
   * Generates text based on a given prompt and options.
   */
  generateText(prompt: string, options?: GenerateOptions): Promise<string>;

  /**
   * Retrieves a list of available models from the provider.
   */
  getModels(): Promise<ModelInfo[]>;

  /**
   * Checks the health or connectivity of the AI provider's service.
   * Should return true if healthy, false otherwise.
   */
  checkHealth(): Promise<boolean>;

  /**
   * Estimates the cost of generating text for a given prompt and model.
   * @param prompt The input prompt string.
   * @param modelId The ID of the model to be used.
   * @returns A promise that resolves to the estimated cost (e.g., in USD).
   */
  estimateCost(prompt: string, modelId: string): Promise<number>;
}
