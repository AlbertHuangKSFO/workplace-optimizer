import { AxiosError } from 'axios'; // Import AxiosError
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
    // Check if error is an AxiosError and has a response property
    if (error instanceof AxiosError && error.response) {
      console.error('[modelService] Response status:', error.response.status);
      console.error('[modelService] Response data:', error.response.data);
    } else if (error instanceof Error && 'request' in error) {
      // Check for request property for non-Axios errors with request info
      // Type assertion needed for error.request as it's not standard on Error
      console.error('[modelService] Request details:', (error as any).request);
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
    // Similar check for getModelsHealth if accessing error.response or error.request
    if (error instanceof AxiosError && error.response) {
      // console.error('[modelService] Health check response status:', error.response.status);
      // console.error('[modelService] Health check response data:', error.response.data);
    }
    return {}; // Return empty object on error
  }
}
