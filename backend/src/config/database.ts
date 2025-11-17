import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://heating_user:heating_pass@localhost:5432/heating_cms',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});


