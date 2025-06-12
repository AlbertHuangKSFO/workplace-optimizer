/**
 * Represents information about an available AI model.
 * This type should be kept in sync with the backend's ModelInfo type.
 */
export interface ModelInfo {
  id: string; // Unique identifier for the model, e.g., 'gpt-4-turbo', 'claude-3-opus-20240229'
  name: string; // User-friendly display name, e.g., "GPT-4 Turbo", "Claude 3 Opus"
  provider: string; // Name of the AI provider, e.g., 'openai', 'anthropic', 'google', 'alibaba'
  description?: string; // Optional description of the model
  contextWindow?: number; // Maximum context window in tokens
  inputModalities?: string[]; // Supported input types, e.g., ['text', 'image']
  outputModalities?: string[]; // Supported output types, e.g., ['text']
  isDefault?: boolean; // Whether this model is a default option for its provider or globally
  pricing?: {
    // Optional pricing information
    inputCostPer1MTokens?: number;
    outputCostPer1MTokens?: number;
    unit?: string; // e.g., 'USD'
  };
  // Provider-specific metadata can be added here if needed for frontend display
  [key: string]: any;
}

// You might also want a simplified type for the selected model state if not all info is needed everywhere
export interface SelectedModel {
  id: string;
  name: string;
  provider: string;
}
