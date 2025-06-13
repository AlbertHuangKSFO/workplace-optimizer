import { ModelInfo } from '../types/model'; // Assuming types are in ../types
import axiosInstance from './axiosInstance';

/**
 * Fetches the list of available AI models from the backend.
 */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  try {
    console.log('[modelService] Making request to /models/available');
    const response = await axiosInstance.get<ModelInfo[]>('/models/available');
    console.log(
      '[modelService] Response received:',
      response.status,
      response.data?.length || 0,
      'models'
    );
    return response.data;
  } catch (error) {
    console.error('[modelService] Error fetching available models:', error);
    if (error.response) {
      console.error('[modelService] Response status:', error.response.status);
      console.error('[modelService] Response data:', error.response.data);
    }
    if (error.request) {
      console.error('[modelService] Request details:', error.request);
    }
    // For debugging, let's throw the error so we can see it in ModelSelector
    throw error;
  }
}

/**
 * Fetches the health status of AI providers from the backend.
 */
export async function getModelsHealth(): Promise<Record<string, boolean>> {
  try {
    const response = await axiosInstance.get<Record<string, boolean>>('/models/health');
    return response.data;
  } catch (error) {
    console.error('Error fetching models health:', error);
    return {}; // Return empty object on error
  }
}
