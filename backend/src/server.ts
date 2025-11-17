import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database';
import { runMigrations } from './migrations/runMigrations';

// Routes
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import deviceRoutes from './routes/devices';
import taskRoutes from './routes/tasks';
import statisticsRoutes from './routes/statistics';
import settingsRoutes from './routes/settings';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Running database migrations...');
    await runMigrations();
    console.log('✅ Database ready');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

