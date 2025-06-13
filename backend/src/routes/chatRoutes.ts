console.log('[DEBUG] src/routes/chatRoutes.ts: File loaded.');
import express, { Router } from 'express';
import { handleChatRequest } from '../controllers/chatController';

const router: Router = express.Router();

/**
 * @route   POST /
 * @desc    Handles chat requests, potentially serving static content for specific tools
 *          or forwarding to an LLM for general chat.
 * @access  Public (or authenticated, depending on your app's needs)
 */
console.log('[DEBUG] src/routes/chatRoutes.ts: Mounting POST / handler for chat...');
router.post('/', handleChatRequest);

export default router;
