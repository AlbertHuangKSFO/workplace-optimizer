// backend/src/index.ts
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 8000;

// Middleware
app.use(morgan('dev')); // Logger
app.use(cors()); // Enable CORS
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Simple route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Workplace Optimizer Backend is running!');
});

app.listen(port, () => {
  console.log(`Backend server is listening on port ${port}`);
});
