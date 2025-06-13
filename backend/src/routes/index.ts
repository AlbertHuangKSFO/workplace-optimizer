import express, { Router } from 'express';
import modelsRouter from './api/models';
import chatRoutes from './chatRoutes';
import generationRoutes from './generationRoutes';
// Import other API route modules here as they are created
// import communicationRouter from './api/communication';
// import translationRouter from './api/translation';
// ... etc.

const router: Router = express.Router();

// API Health Check (optional, or can be more sophisticated)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Mount model routes
router.use('/models', modelsRouter);

// Mount generation routes under /v1 prefix
router.use('/v1', generationRoutes);

console.log('[DEBUG] src/routes/index.ts: Mounting /chat routes...');
// Mount chat routes
router.use('/chat', chatRoutes);

// Mount other API routes
// router.use('/communication', communicationRouter);
// router.use('/translation', translationRouter);
// ... etc.

export default router;
