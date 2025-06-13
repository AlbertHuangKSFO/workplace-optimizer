import axiosInstance from './axiosInstance'; // Assuming you have a preconfigured axios instance

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'; Removed this line

interface GenerateTextPayload {
  modelId: string;
  inputText: string;
  systemPrompt?: string;
}

interface GenerateTextResponse {
  generatedText: string;
  modelUsed: string;
  // Add any other fields the backend might return
}

/**
 * Calls the backend API to generate text using the specified model and input.
 * @param payload - The data needed for text generation.
 * @returns The AI-generated text and model information.
 */
export async function generateText(payload: GenerateTextPayload): Promise<GenerateTextResponse> {
  try {
    const response = await axiosInstance.post<GenerateTextResponse>(
      '/v1/generate', // Use relative path now that axiosInstance has baseURL
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error('Error calling generateText API:', error);
    // Enhance error handling to provide more specific messages to the UI
    let errorMessage = 'Failed to generate text. Please try again.';
    if (error.response?.data?.error) {
      errorMessage =
        typeof error.response.data.error === 'string'
          ? error.response.data.error
          : JSON.stringify(error.response.data.error);
    } else if (error.message) {
      errorMessage = error.message;
    }
    // It might be better to throw a custom error object or an object with a user-friendly message
    throw new Error(errorMessage);
  }
}
