import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const clientConfig = {
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
};

console.log('Testing connection with config:', { ...clientConfig, password: '***' });

const pool = new Pool(clientConfig);

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Success!', res.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    pool.end();
  }
}

test();
