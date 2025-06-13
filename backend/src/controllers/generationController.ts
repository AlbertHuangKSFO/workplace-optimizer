import { Request, Response } from 'express';
import { ModelManager } from '../services/ai/ModelManager';
import { GenerateOptions } from '../types/model'; // Import GenerateOptions
// We might need to adjust AIAdapter interface later for systemPrompt/options
// import { AIAdapter } from '../adapters/AIAdapter';

interface GenerationRequestBody {
  modelId: string;
  inputText: string;
  systemPrompt?: string;
  // We could add other generation parameters here from GenerateOptions if we want to expose them to the frontend
  // e.g., maxTokens?: number, temperature?: number;
}

export async function generateTextController(req: Request, res: Response): Promise<void> {
  const { modelId, inputText, systemPrompt } = req.body as GenerationRequestBody;

  if (!modelId || !inputText) {
    res.status(400).json({ error: 'Missing modelId or inputText in request body.' });
    return;
  }

  const modelManager = req.app.get('modelManager') as ModelManager;
  if (!modelManager) {
    console.error('[GenerationController] ModelManager not found in app context.');
    res.status(500).json({ error: 'Internal server error: ModelManager not configured.' });
    return;
  }

  try {
    const adapter = modelManager.getAdapterForModel(modelId);
    if (!adapter) {
      console.warn(
        `[GenerationController] No adapter found or model not available for modelId: ${modelId}`
      );
      res.status(400).json({ error: `Model not available or adapter not found: ${modelId}` });
      return;
    }

    // Prepare options for the adapter's generateText method.
    const finalOptions: GenerateOptions = {
      modelId, // Pass the specific modelId selected by the user
    };

    if (systemPrompt) {
      finalOptions.systemPrompt = systemPrompt;
    }

    // TODO: Consider if other parameters from GenerateOptions (like maxTokens, temperature)
    // should be passable from the frontend request body and added to finalOptions here.

    console.info(
      `[GenerationController] Generating text with model: ${modelId}, input length: ${
        inputText.length
      }, systemPrompt: ${systemPrompt ? 'present' : 'absent'}`
    );

    // Call adapter.generateText(prompt: string, options?: GenerateOptions)
    const generatedText = await adapter.generateText(inputText, finalOptions);

    res.status(200).json({ generatedText, modelUsed: modelId });
  } catch (error: any) {
    console.error(
      `[GenerationController] Error during text generation with model ${modelId}:`,
      error.message
    );
    if (error.stack) {
      console.error(error.stack);
    }
    // Try to extract a more specific error message if available (e.g., from an Axios error or AI provider SDK)
    const errorMessage =
      error.response?.data?.error?.message || error.message || 'Failed to generate text.';
    const statusCode = error.response?.status || 500;

    // Log the actual error object from the AI provider if present
    if (error.response?.data) {
      console.error(
        '[GenerationController] Error response data from AI Provider:',
        error.response.data
      );
    }

    res.status(statusCode).json({ error: errorMessage, modelId });
  }
}
