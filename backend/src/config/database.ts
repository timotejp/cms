import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://heating_user:heating_pass@postgres:5432/heating_cms',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('connect', () => {
  console.log('Database connected');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

