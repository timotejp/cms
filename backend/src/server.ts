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
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/settings', settingsRoutes);

// Initialize database and start server
async function startServer() {
  try {
    await runMigrations();
    console.log('Database migrations completed');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


