// backend/src/index.ts
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppConfig } from './config/app'; // Import AppConfig to ensure it's loaded
import apiRoutes from './routes'; // Import the main API router
// Ensure ModelManager is initialized (it self-initializes on import, but good to have a clear dependency chain if needed later)
import { ModelManager } from './services/ai/ModelManager';

dotenv.config(); // AppConfig already does this, but doesn't hurt

const app = express();

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

// Simple root route (optional, can be removed or used for basic health check)
app.get('/', (req: Request, res: Response) => {
  res.send('Workplace Optimizer Backend is running!');
});

// Global error handler (basic example, can be expanded)
// This should be defined AFTER all other app.use() and routes calls
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {},
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
