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

const pool = new Pool(clientConfig);

async function inject() {
  try {
    // Find a recipe for the admin user
    const userRes = await pool.query("SELECT id FROM users WHERE email = 'ezequielrod2020@gmail.com'");
    if (userRes.rows.length === 0) {
      console.log('User not found');
      return;
    }
    const userId = userRes.rows[0].id;
    
    const recipeRes = await pool.query("SELECT id FROM recipes WHERE user_id = $1 LIMIT 1", [userId]);
    if (recipeRes.rows.length === 0) {
      console.log('No recipes found for this user');
      return;
    }
    const recipeId = recipeRes.rows[0].id;
    
    await pool.query("UPDATE recipes SET photo_url = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800' WHERE id = $1", [recipeId]);
    console.log(`Updated recipe ${recipeId} with a photo URL.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

inject();
