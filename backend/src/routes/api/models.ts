import express, { Request, Response, Router } from 'express';
import { ModelManager } from '../../services/ai/ModelManager';

const router: Router = express.Router();

/**
 * @route   GET /api/models/available
 * @desc    Get all available AI models from configured providers
 * @access  Public
 */
router.get('/available', async (req: Request, res: Response) => {
  try {
    const modelManager = ModelManager.getInstance();
    const models = modelManager.getAvailableModels(); // Gets currently cached models

    // Optionally, you could force a refresh if the cache is empty or stale,
    // but the ModelManager already primes the cache on startup.
    // if (models.length === 0) {
    //   models = await modelManager.loadModels(true);
    // }

    if (models.length === 0 && process.env.NODE_ENV !== 'test') {
      // If still no models, it might indicate an issue with all providers or initial fetch
      console.warn(
        'API endpoint /api/models/available returning empty list. Check ModelManager logs.'
      );
      // Depending on desired behavior, could return 503 Service Unavailable or just empty list
    }

    res.json(models);
  } catch (error) {
    console.error('Error fetching available models:', error);
    res.status(500).json({ message: 'Failed to retrieve available models' });
  }
});

/**
 * @route   GET /api/models/health
 * @desc    Get health status of all configured AI providers
 * @access  Public (or protected, depending on needs)
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const modelManager = ModelManager.getInstance();
    const healthStatus = await modelManager.checkAllAdaptersHealth();
    res.json(healthStatus);
  } catch (error) {
    console.error('Error checking AI provider health:', error);
    res.status(500).json({ message: 'Failed to retrieve AI provider health status' });
  }
});

export default router;
