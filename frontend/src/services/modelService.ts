import { ModelInfo } from '../types/model'; // Assuming types are in ../types
import axiosInstance from './axiosInstance';

/**
 * Fetches the list of available AI models from the backend.
 */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  try {
    const response = await axiosInstance.get<ModelInfo[]>('/models/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available models:', error);
    // In a real app, you might want to throw a more specific error or handle it
    // For now, return an empty array or throw the original error
    // throw error;
    return []; // Return empty array on error to prevent UI breakage, log error for debugging
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
