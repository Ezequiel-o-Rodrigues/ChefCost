import express from 'express';
import cors from 'cors';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
  port: 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err));

// Create tables if not exist
const createTables = async () => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS materials (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      package_qty REAL NOT NULL,
      price_paid REAL NOT NULL,
      price_per_min_unit REAL NOT NULL,
      user_id TEXT NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      yield REAL NOT NULL,
      profit_margin REAL NOT NULL,
      packaging_cost REAL NOT NULL,
      labor_cost REAL NOT NULL,
      energy_cost REAL NOT NULL,
      waste_factor REAL NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS recipe_items (
      id SERIAL PRIMARY KEY,
      recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
      material_id INTEGER REFERENCES materials(id),
      qty REAL NOT NULL,
      unit TEXT NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS conversions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      grams REAL NOT NULL,
      user_id TEXT NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT PRIMARY KEY,
      hourly_rate REAL NOT NULL,
      energy_rate REAL NOT NULL
    );
  `);
};

createTables();

// API routes
app.get('/api/materials/:userId', async (req, res) => {
  const { userId } = req.params;
  const result = await client.query('SELECT * FROM materials WHERE user_id = $1', [userId]);
  res.json(result.rows);
});

app.post('/api/materials', async (req, res) => {
  const { name, unit, packageQty, pricePaid, pricePerMinUnit, userId } = req.body;
  const result = await client.query(
    'INSERT INTO materials (name, unit, package_qty, price_paid, price_per_min_unit, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, unit, packageQty, pricePaid, pricePerMinUnit, userId]
  );
  res.json(result.rows[0]);
});

// Similarly for update and delete
app.put('/api/materials/:id', async (req, res) => {
  const { id } = req.params;
  const { name, unit, packageQty, pricePaid, pricePerMinUnit } = req.body;
  await client.query(
    'UPDATE materials SET name = $1, unit = $2, package_qty = $3, price_paid = $4, price_per_min_unit = $5 WHERE id = $6',
    [name, unit, packageQty, pricePaid, pricePerMinUnit, id]
  );
  res.json({ success: true });
});

app.delete('/api/materials/:id', async (req, res) => {
  const { id } = req.params;
  await client.query('DELETE FROM materials WHERE id = $1', [id]);
  res.json({ success: true });
});

// Similar for recipes, conversions, settings
// For recipes, need to handle items

app.get('/api/recipes/:userId', async (req, res) => {
  const { userId } = req.params;
  const result = await client.query('SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  const recipes = [];
  for (const row of result.rows) {
    const itemsResult = await client.query('SELECT * FROM recipe_items WHERE recipe_id = $1', [row.id]);
    recipes.push({ ...row, items: itemsResult.rows });
  }
  res.json(recipes);
});

app.put('/api/recipes/:id', async (req, res) => {
  const { id } = req.params;
  const { name, yield: yieldVal, profitMargin, packagingCost, laborCost, energyCost, wasteFactor, items } = req.body;
  await client.query(
    'UPDATE recipes SET name = $1, yield = $2, profit_margin = $3, packaging_cost = $4, labor_cost = $5, energy_cost = $6, waste_factor = $7 WHERE id = $8',
    [name, yieldVal, profitMargin, packagingCost, laborCost, energyCost, wasteFactor, id]
  );
  // Update items: delete old and insert new
  await client.query('DELETE FROM recipe_items WHERE recipe_id = $1', [id]);
  for (const item of items) {
    await client.query(
      'INSERT INTO recipe_items (recipe_id, material_id, qty, unit) VALUES ($1, $2, $3, $4)',
      [id, item.materialId, item.qty, item.unit]
    );
  }
  res.json({ success: true });
});

app.delete('/api/recipes/:id', async (req, res) => {
  const { id } = req.params;
  await client.query('DELETE FROM recipes WHERE id = $1', [id]);
  res.json({ success: true });
});

// Add update and delete for recipes similarly

app.get('/api/conversions/:userId', async (req, res) => {
  const { userId } = req.params;
  const result = await client.query('SELECT * FROM conversions WHERE user_id = $1', [userId]);
  res.json(result.rows);
});

app.delete('/api/conversions/:id', async (req, res) => {
  const { id } = req.params;
  await client.query('DELETE FROM conversions WHERE id = $1', [id]);
  res.json({ success: true });
});

// Settings
app.get('/api/settings/:userId', async (req, res) => {
  const { userId } = req.params;
  const result = await client.query('SELECT * FROM settings WHERE user_id = $1', [userId]);
  if (result.rows.length > 0) {
    res.json(result.rows[0]);
  } else {
    res.json({ hourlyRate: 25, energyRate: 5 });
  }
});

app.post('/api/settings', async (req, res) => {
  const { userId, hourlyRate, energyRate } = req.body;
  await client.query(
    'INSERT INTO settings (user_id, hourly_rate, energy_rate) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET hourly_rate = $2, energy_rate = $3',
    [userId, hourlyRate, energyRate]
  );
  res.json({ success: true });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});