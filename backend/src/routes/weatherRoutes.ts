import { Router } from 'express';
import { getMeizuWeather } from '../controllers/weatherController';

const router = Router();

// Route to proxy Meizu weather requests
// Example: GET /api/weather/meizu?cityIds=101010100
router.get('/meizu', getMeizuWeather);

export default router;
