import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// helmet sets secure HTTP headers (XSS protection, no sniff, etc.)
app.use(helmet());

// Only allow requests from the configured frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());

// Health check — useful for verifying the server is reachable
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Routes are registered here in Phase 5+
// app.use('/api/auth', authRoutes);
// app.use('/api/vehicles', vehicleRoutes);

// Centralized error handler — must be registered after all routes
app.use(errorHandler);

export default app;
