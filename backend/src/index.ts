// backend/src/index.ts
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { AppConfig } from './config/app'; // Import AppConfig to ensure it's loaded
import apiRoutes from './routes'; // Import the main API router
import weatherRoutes from './routes/weatherRoutes'; // Import weather routes
// Ensure ModelManager is initialized (it self-initializes on import, but good to have a clear dependency chain if needed later)
import { ModelManager } from './services/ai/ModelManager';

// 使用绝对路径加载.env文件，确保在任何工作目录下都能正确加载
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

// SUPER EARLY DEBUG LOG MIDDLEWARE
app.use((req, res, next) => {
  console.log(`[SUPER DEBUG] Request received: ${req.method} ${req.originalUrl}`);
  next();
});

// Initialize and set ModelManager instance
const modelManagerInstance = ModelManager.getInstance();
app.set('modelManager', modelManagerInstance);

const port = AppConfig.backendPort || 8000;

// Middleware
app.use(morgan(AppConfig.logFormat)); // Use logFormat from AppConfig
app.use(cors()); // Enable CORS - consider more restrictive options for production
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount API routes
app.use('/api', apiRoutes);

// DEBUGGING LOG FOR WEATHER ROUTES
app.use('/api/weather', (req, res, next) => {
  console.log(
    `[DEBUG] Attempting to route for /api/weather path. Request: ${req.method} ${req.originalUrl}`
  );
  // 查看是否有 /api/weather/meizu 这样的子路径
  if (req.originalUrl.startsWith('/api/weather/meizu')) {
    console.log(`[DEBUG] Request IS for /api/weather/meizu. Continuing to weatherRoutes.`);
  } else {
    console.log(`[DEBUG] Request is for /api/weather but NOT /meizu. Path: ${req.path}`);
  }
  next(); // 重要：确保将请求传递给下一个中间件或路由处理器
});
// END DEBUGGING LOG

app.use('/api/weather', weatherRoutes); // Mount weather proxy routes

// Simple root route (optional, can be removed or used for basic health check)
app.get('/', (req: Request, res: Response) => {
  res.send('Workplace Optimizer Backend is running!');
});

// Health check route for Docker
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'workplace-optimizer-backend',
  });
});

// Global error handler (basic example, can be expanded)
// This should be defined AFTER all other app.use() and routes calls
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('[SUPER DEBUG] GLOBAL ERROR HANDLER CAUGHT AN ERROR:', err);
  console.error('[SUPER DEBUG] Error Name:', err.name);
  console.error('[SUPER DEBUG] Error Message:', err.message);
  console.error('[SUPER DEBUG] Error Stack:', err.stack);
  console.error('[SUPER DEBUG] Request URL that caused error:', req.originalUrl);

  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    error:
      process.env.NODE_ENV === 'development'
        ? { name: err.name, message: err.message, stack: err.stack }
        : {},
  });
});

app.listen(port, async () => {
  console.log(`Backend server is listening on port ${port}`);
  // Prime the ModelManager cache if not already done by its own IIFE, or if you want to ensure it's logged here.
  // The ModelManager already attempts to prime itself.
  try {
    console.log('Ensuring AI Model cache is primed (ModelManager may have already done this)...');
    await ModelManager.getInstance().primeCache(); // This will use existing cache if already primed
    console.log('AI Model cache is ready.');
  } catch (error) {
    console.error('Error during post-startup cache priming for AI Models:', error);
  }
});
