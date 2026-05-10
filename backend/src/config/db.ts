import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('PostgreSQL ga ulandi ✅');
});

pool.on('error', (err) => {
  console.error('PostgreSQL xatosi:', err);
  process.exit(1);
});

export default pool;