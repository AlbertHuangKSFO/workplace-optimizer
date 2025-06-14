import axios, { AxiosError } from 'axios';
import { Request, Response } from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { ModelManager } from '../services/ai/ModelManager';
import { AIAdapter, GenerateOptions } from '../types/model';

interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  toolId?: string;
  modelId?: string;
  language?: string;
}

// Path to the prompts directory
const PROMPTS_DIR = path.join(__dirname, '../../src/data/prompts');

// Added Meizu Weather API URL
const MEIZU_WEATHER_API_URL = 'https://aider.meizu.com/app/weather/listWeather';

function loadSystemPrompt(toolId: string, language: string = 'zh'): string | null {
  // Determine the category based on toolId
  let category = 'office-fun'; // default
  if (
    [
      'speech-optimizer',
      'email-polisher',
      'meeting-speech-generator',
      'meeting-nonsense-translator',
    ].includes(toolId)
  ) {
    category = 'communication';
  } else if (
    ['jargon-translator', 'cross-department-translator', 'eq-assistant'].includes(toolId)
  ) {
    category = 'translation';
  } else if (
    ['ppt-phrase-generator', 'professional-persona-generator', 'data-beautifier'].includes(toolId)
  ) {
    category = 'generation';
  } else if (
    ['blame-tactics', 'crisis-communication-templates', 'resignation-templates'].includes(toolId)
  ) {
    category = 'crisis';
  } else if (
    [
      'team-mood-detector',
      'meeting-notes-organizer',
      'workplace-meme-generator',
      'colleague-persona-analyzer',
      'weather-mood-link',
      'career-path-forecaster',
      'side-hustle-assessor',
    ].includes(toolId)
  ) {
    category = 'analysis';
  }

  const filePath = path.join(PROMPTS_DIR, language, category, `${toolId}.yaml`);
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Prompt file not found: ${filePath}`);
      return null;
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const parsedYaml = yaml.load(fileContents) as { default_system_prompt?: string };
    return parsedYaml?.default_system_prompt || null;
  } catch (error) {
    console.error(`Error loading system prompt for ${toolId} from ${filePath}:`, error);
    return null;
  }
}

export async function handleChatRequest(req: Request, res: Response): Promise<void> {
  console.log('[DEBUG] src/controllers/chatController.ts: handleChatRequest INVOKED.');
  const {
    toolId,
    messages,
    modelId: requestedModelId,
    language = 'zh',
  } = req.body as ChatRequestBody;
  const modelManager = req.app.get('modelManager') as ModelManager;

  if (!modelManager) {
    console.error('[ChatController] ModelManager not found in app context.');
    res.status(500).json({ error: 'Internal server error: ModelManager not configured.' });
    return;
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
    return;
  }

  const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content;
  if (!lastUserMessage) {
    res.status(400).json({ error: 'No user message found in the messages array.' });
    return;
  }

  if (toolId === 'weather-mood-link') {
    console.log(`[ChatController] Handling toolId: ${toolId}`);
    const cityId = lastUserMessage; // Assuming lastUserMessage IS the cityId

    if (!cityId) {
      console.error('[ChatController][weather-mood-link] CityId not found in user message.');
      return res.status(400).json({ error: 'CityId is required for weather-mood link analysis.' });
    }
    console.log(`[ChatController][weather-mood-link] Processing for cityId: ${cityId}`);

    try {
      let weatherData;
      try {
        console.log(`[ChatController][weather-mood-link] Fetching weather for cityId: ${cityId}`);
        const weatherApiResponse = await axios.get(MEIZU_WEATHER_API_URL, {
          params: { cityIds: cityId },
          timeout: 7000, // Increased timeout slightly
        });
        weatherData = weatherApiResponse.data;
        console.log(
          '[ChatController][weather-mood-link] Weather data fetched successfully.',
          weatherData
        );
      } catch (error) {
        console.error(
          `[ChatController][weather-mood-link] Error fetching weather data for cityId ${cityId}:`,
          error
        );
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          return res.status(axiosError.response?.status || 502).json({
            error: 'Failed to fetch weather data from Meizu API.',
            details: axiosError.message,
            upstreamError: axiosError.response?.data,
          });
        }
        return res
          .status(502)
          .json({ error: 'Failed to fetch weather data due to an unexpected error.' });
      }

      const systemPrompt = loadSystemPrompt(toolId, language);
      if (!systemPrompt) {
        console.error(
          `[ChatController][weather-mood-link] System prompt for tool '${toolId}' could not be loaded.`
        );
        return res
          .status(500)
          .json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      }

      const aiUserMessage = `The weather data for city ID ${cityId} is: ${JSON.stringify(
        weatherData
      )}. Based on this weather information, please provide an analysis of the potential link between the current weather and general mood. Consider common psychological responses to different weather conditions.`;
      console.log(
        `[ChatController][weather-mood-link] AI User Message: ${aiUserMessage.substring(0, 200)}...`
      );

      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error('[ChatController][weather-mood-link] No available/default models found.');
          return res.status(500).json({ error: 'No AI models available to handle the request.' });
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController][weather-mood-link] Could not find adapter or model ID. Attempted model: ${finalModelId}`
        );
        return res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
      }

      console.info(`[ChatController][weather-mood-link] Using model '${finalModelId}'.`);

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
        // You might want to adjust maxTokens or temperature for this specific task if needed
      };

      const assistantResponse = await adapter.generateText(aiUserMessage, options);
      console.log('[ChatController][weather-mood-link] AI response generated.');
      return res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(
        `[ChatController][weather-mood-link] Error processing tool '${toolId}':`,
        error.message
      );
      if (error.stack) console.error(error.stack);
      return res.status(500).json({
        error: `Failed to generate content for '${toolId}': ${error.message}`,
      });
    }
  } else if (toolId === 'introduction-to-slacking') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (systemPrompt) {
      res.status(200).json({ assistantMessage: systemPrompt });
    } else {
      res.status(404).json({ error: `Content for tool '${toolId}' not found or failed to load.` });
    }
    return;
  }

  if (toolId === 'bullshit-fortune-telling' || toolId === 'daily-slacking-almanac') {
    const systemPrompt = loadSystemPrompt('daily-slacking-almanac', language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error('[ChatController] No available/default models found.');
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(`[ChatController] Using model '${finalModelId}' for tool '${toolId}'.`);

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'awesome-compliment-generator') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(
            '[ChatController] No available/default models found for awesome-compliment-generator.'
          );
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'weekly-report-sparkle-enhancer') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(
            '[ChatController] No available/default models found for weekly-report-sparkle-enhancer.'
          );
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage?.substring(
          0,
          100
        )}...`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'universal-excuse-generator') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(
            '[ChatController] No available/default models found for universal-excuse-generator.'
          );
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage?.substring(
          0,
          100
        )}...`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'lunch-decision-overlord') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(
            '[ChatController] No available/default models found for lunch-decision-overlord.'
          );
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage?.substring(
          0,
          100
        )}...`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'meeting-doodle-buddy') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(
            '[ChatController] No available/default models found for meeting-doodle-buddy.'
          );
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage?.substring(
          0,
          100
        )}...`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'daily-grind-affirmations') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(
            '[ChatController] No available/default models found for daily-grind-affirmations.'
          );
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage?.substring(
          0,
          100
        )}...`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'meeting-bingo-generator') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(
            '[ChatController] No available/default models found for meeting-bingo-generator.'
          );
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage?.substring(
          0,
          100
        )}...`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'office-outfit-advisor') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'anti-pua-assistant') {
    console.log(
      `[APA_DEBUG] Entered block. Lang: ${language}, User msg length: ${lastUserMessage?.length}`
    );
    const systemPrompt = loadSystemPrompt(toolId, language);
    console.log(`[APA_DEBUG] SystemPrompt loaded: ${systemPrompt ? 'OK' : 'null'}`);

    if (!systemPrompt) {
      console.error('[APA_ERROR] System prompt could not be loaded for anti-pua-assistant.');
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      console.log(`[APA_DEBUG] Getting adapter. Requested modelId: ${requestedModelId}`);
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
        console.log(
          `[APA_DEBUG] Adapter for requested modelId '${finalModelId}': ${
            adapter ? adapter.provider : 'not found'
          }`
        );
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
          console.log(
            `[APA_DEBUG] Using default model '${finalModelId}'. Adapter: ${
              adapter ? adapter.provider : 'not found'
            }`
          );
        } else {
          console.error('[APA_ERROR] No available/default models found for anti-pua-assistant.');
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[APA_ERROR] Could not find adapter or finalModelId. ModelID: ${finalModelId}, Adapter: ${!!adapter}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.log(
        `[APA_DEBUG] Using model '${finalModelId}' with adapter '${adapter.provider}'. Calling generateText for anti-pua-assistant.`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      console.log(`[APA_DEBUG] Response from adapter for anti-pua-assistant: OK`);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[APA_ERROR] Error in anti-pua-assistant tool: ${error.message}`);
      if (error.stack)
        console.error('[APA_ERROR] STACK TRACE for anti-pua-assistant: ', error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for tool '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'sanity-check-meter') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'office-fengshui-detector') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  if (toolId === 'impressive-meeting-phrases') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  // Communication tools
  if (
    toolId === 'speech-optimizer' ||
    toolId === 'email-polisher' ||
    toolId === 'meeting-speech-generator'
  ) {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  // Translation tools
  if (
    toolId === 'jargon-translator' ||
    toolId === 'cross-department-translator' ||
    toolId === 'eq-assistant'
  ) {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  // Generation tools
  if (
    toolId === 'ppt-phrase-generator' ||
    toolId === 'professional-persona-generator' ||
    toolId === 'data-beautifier'
  ) {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  // Crisis tools
  if (
    toolId === 'blame-tactics' ||
    toolId === 'crisis-communication-templates' ||
    toolId === 'resignation-templates'
  ) {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  // Analysis tools
  if (
    toolId === 'team-mood-detector' ||
    toolId === 'meeting-notes-organizer' ||
    toolId === 'workplace-meme-generator'
  ) {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  // Handler for Soup Switcher
  if (toolId === 'soup-switcher') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  // Handler for Meeting Nonsense Translator
  if (toolId === 'meeting-nonsense-translator') {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input length: ${lastUserMessage?.length}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  // ADDING HANDLER FOR CAREER PATH FORECASTER
  // This should be placed before the generic analysis tools handler if it exists,
  // or alongside other specific tool handlers.
  else if (toolId === 'career-path-forecaster') {
    console.log(`[ChatController] Handling toolId: ${toolId}`);
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      console.error(`[ChatController][${toolId}] System prompt could not be loaded.`);
      return res
        .status(500)
        .json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController][${toolId}] No available/default models found.`);
          return res.status(500).json({ error: 'No AI models available to handle the request.' });
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController][${toolId}] Could not find adapter or model ID. Attempted model: ${finalModelId}`
        );
        return res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
      }

      console.info(
        `[ChatController][${toolId}] Using model '${finalModelId}'. User input: ${lastUserMessage?.substring(
          0,
          100
        )}...`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      console.log(`[ChatController][${toolId}] AI response generated.`);
      return res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController][${toolId}] Error processing tool:`, error.message);
      if (error.stack) console.error(error.stack);
      return res.status(500).json({
        error: `Failed to generate content for '${toolId}': ${error.message}`,
      });
    }
  }

  // ADDING HANDLER FOR SIDE HUSTLE ASSESSOR
  else if (toolId === 'side-hustle-assessor') {
    console.log(`[ChatController] Handling toolId: ${toolId}`);
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      console.error(`[ChatController][${toolId}] System prompt could not be loaded.`);
      return res
        .status(500)
        .json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController][${toolId}] No available/default models found.`);
          return res.status(500).json({ error: 'No AI models available to handle the request.' });
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController][${toolId}] Could not find adapter or model ID. Attempted model: ${finalModelId}`
        );
        return res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
      }

      console.info(
        `[ChatController][${toolId}] Using model '${finalModelId}'. User input: ${lastUserMessage?.substring(
          0,
          100
        )}...`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      console.log(`[ChatController][${toolId}] AI response generated.`);
      return res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController][${toolId}] Error processing tool:`, error.message);
      if (error.stack) console.error(error.stack);
      return res.status(500).json({
        error: `Failed to generate content for '${toolId}': ${error.message}`,
      });
    }
  }

  // Generic handler for some analysis tools (and potentially others if not caught earlier)
  // Ensure 'side-hustle-assessor' is handled before this or this group is adjusted
  else if (
    toolId === 'data-beautifier' ||
    toolId === 'team-mood-detector' ||
    toolId === 'meeting-notes-organizer' ||
    toolId === 'workplace-meme-generator'
  ) {
    const systemPrompt = loadSystemPrompt(toolId, language);
    if (!systemPrompt) {
      res.status(500).json({ error: `System prompt for tool '${toolId}' could not be loaded.` });
      return;
    }

    try {
      let adapter: AIAdapter | undefined;
      let finalModelId = requestedModelId;

      if (finalModelId) {
        adapter = modelManager.getAdapterForModel(finalModelId);
      }

      if (!adapter) {
        const availableModels = modelManager.getAvailableModels();
        const defaultModel = availableModels.find((m) => m.isDefault) || availableModels[0];
        if (defaultModel) {
          finalModelId = defaultModel.id;
          adapter = modelManager.getAdapterForModel(finalModelId);
        } else {
          console.error(`[ChatController] No available/default models found for ${toolId}.`);
          res.status(500).json({ error: 'No AI models available to handle the request.' });
          return;
        }
      }

      if (!adapter || !finalModelId) {
        console.error(
          `[ChatController] Could not find adapter or model ID for tool '${toolId}'. Attempted model: ${finalModelId}`
        );
        res.status(500).json({ error: 'Failed to find a suitable AI model or adapter.' });
        return;
      }

      console.info(
        `[ChatController] Using model '${finalModelId}' for tool '${toolId}'. User input: ${lastUserMessage}`
      );

      const options: GenerateOptions = {
        modelId: finalModelId,
        systemPrompt: systemPrompt,
      };

      const assistantResponse = await adapter.generateText(lastUserMessage, options);
      res.status(200).json({ assistantMessage: assistantResponse, modelUsed: finalModelId });
    } catch (error: any) {
      console.error(`[ChatController] Error processing tool '${toolId}' with LLM:`, error.message);
      if (error.stack) console.error(error.stack);
      res
        .status(500)
        .json({ error: `Failed to generate content for '${toolId}': ${error.message}` });
    }
    return;
  }

  // Definitive fallback for unhandled toolIds or missing toolId
  // This code is reached ONLY if no specific toolId handler above was matched and returned.
  console.log(`[ChatController] Entering fallback logic for toolId: '${toolId}'.`);

  if (toolId) {
    // A toolId was provided, but it wasn't one of the recognized/implemented ones.
    console.warn(`[ChatController] Unhandled toolId: '${toolId}'. Returning 501.`);
    res.status(501).json({ error: `Tool with id '${toolId}' is not implemented.` });
  } else {
    // No toolId was provided in the request at all.
    console.warn('[ChatController] Chat request received without a toolId. Returning 501.');
    res.status(501).json({ error: 'Chat requests must include a toolId.' });
  }
  return; // Explicitly return to ensure no further code in this function is executed.
}
