import axios, { AxiosError } from 'axios';
import { Request, Response } from 'express';

const MEIZU_WEATHER_API_URL = 'https://aider.meizu.com/app/weather/listWeather';

export async function getMeizuWeather(req: Request, res: Response): Promise<void> {
  const cityIds = req.query.cityIds as string;

  if (!cityIds) {
    res.status(400).json({ error: 'cityIds query parameter is required.' });
    return;
  }

  try {
    console.log(
      `[WeatherController] Proxying request to Meizu Weather API for cityIds: ${cityIds}`
    );
    const response = await axios.get(MEIZU_WEATHER_API_URL, {
      params: {
        cityIds: cityIds,
      },
      // It's good practice to set a timeout for external API calls
      timeout: 5000, // 5 seconds timeout
    });

    // Forward the successful response from Meizu API to the client
    console.log(`[WeatherController] Success from Meizu API. Status: ${response.status}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(
        `[WeatherController] Axios error when calling Meizu API: ${axiosError.message}`,
        axiosError.response?.status,
        axiosError.response?.data
      );
      if (axiosError.response) {
        // Forward the error response from Meizu API if available
        res.status(axiosError.response.status).json(axiosError.response.data);
      } else {
        // Generic error if Meizu API did not respond (e.g., network error, timeout)
        res.status(500).json({
          error: 'Failed to fetch weather data from Meizu API via proxy.',
          details: axiosError.message,
        });
      }
    } else {
      // Non-Axios error
      const unknownError = error as Error;
      console.error(
        '[WeatherController] Unknown error when calling Meizu API:',
        unknownError.message
      );
      res.status(500).json({
        error: 'An unexpected error occurred in the weather proxy.',
        details: unknownError.message,
      });
    }
  }
}
