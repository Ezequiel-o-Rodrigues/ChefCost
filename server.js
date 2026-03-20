import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || 'chefcost-secret-key-change-in-production';

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.url.endsWith('.js')) res.type('application/javascript');
  else if (req.url.endsWith('.css')) res.type('text/css');
  next();
});

app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
    else if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
  }
}));

const clientConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : { host: process.env.PGHOST, database: process.env.PGDATABASE, user: process.env.PGUSER, password: process.env.PGPASSWORD, ssl: { rejectUnauthorized: false } };

const client = new Pool(clientConfig);

// === INIT DB ===
const initDB = async () => {
  // Migracoes na tabela users existente (id ja e TEXT no Neon)
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`);
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false`);
  await client.query(`UPDATE users SET is_active = false WHERE is_active IS NULL`);

  // Adiciona a nova coluna de prep_time_minutes se nao existir
  try {
    await client.query(`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS prep_time_minutes REAL DEFAULT 0`);
    await client.query(`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS photo_url TEXT`);
    await client.query(`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions TEXT`);
  } catch (err) {
    if (err.code !== '42701') console.error('Migration error:', err);
  }

  // Garante admin
  const adminEmail = 'ezequielrod2020@gmail.com';
  const existing = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash('ezequiel2014', 10);
    await client.query(
      `INSERT INTO users (id, email, password_hash, role, is_active) VALUES ($1, $2, $3, 'admin', true)`,
      [randomUUID(), adminEmail, hash]
    );
  } else {
    await client.query(`UPDATE users SET role = 'admin', is_active = true WHERE email = $1`, [adminEmail]);
  }

  // Demais tabelas (ja existem, CREATE IF NOT EXISTS e seguro)
  await client.query(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
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
      id TEXT PRIMARY KEY,
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
      id TEXT PRIMARY KEY,
      recipe_id TEXT REFERENCES recipes(id) ON DELETE CASCADE,
      material_id TEXT,
      qty REAL NOT NULL,
      unit TEXT NOT NULL
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS conversions (
      id TEXT PRIMARY KEY,
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

// === MAPPERS ===
const mapMaterial = (r) => ({
  id: String(r.id), name: r.name, unit: r.unit,
  packageQty: Number(r.package_qty), pricePaid: Number(r.price_paid),
  pricePerMinUnit: Number(r.price_per_min_unit), userId: String(r.user_id),
});

const mapRecipe = (r, items = []) => ({
  id: String(r.id), name: r.name,
  yield: Number(r.recipe_yield ?? r.yield ?? 1),
  profitMargin: Number(r.profit_margin ?? 0),
  packagingCost: Number(r.packaging_cost ?? 0),
  laborCost: Number(r.labor_cost ?? 0),
  energyCost: Number(r.energy_cost ?? 0),
  wasteFactor: Number(r.waste_factor ?? 0),
  prepTimeMinutes: Number(r.prep_time_minutes ?? 0),
  photoUrl: r.photo_url || '',
  instructions: r.instructions || '',
  userId: String(r.user_id),
  createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  items: items.map(i => ({ materialId: String(i.material_id), qty: Number(i.qty), unit: i.unit })),
});

const mapConversion = (r) => ({ id: String(r.id), name: r.name, grams: r.grams, userId: String(r.user_id) });
const mapSettings = (r) => ({ hourlyRate: r.hourly_rate, energyRate: r.energy_rate });

// === MIDDLEWARES ===
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Acesso restrito' });
  next();
};

// === AUTH ===
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Email ou senha incorretos' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Email ou senha incorretos' });
    if (!user.is_active) return res.status(403).json({ error: 'Acesso bloqueado. Entre em contato com o administrador.' });
    const token = jwt.sign({ email, userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, email, userId: user.id, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// === ADMIN ===
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await client.query(`SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios' });
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email já cadastrado' });
    const hash = await bcrypt.hash(password, 10);
    const newId = randomUUID();
    const result = await client.query(
      `INSERT INTO users (id, email, password_hash, role, is_active) VALUES ($1, $2, $3, 'user', true) RETURNING id, email, role, is_active, created_at`,
      [newId, email, hash]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client.query(
      `UPDATE users SET is_active = NOT is_active WHERE id = $1 AND role != 'admin' RETURNING id, email, role, is_active`,
      [id]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Não é possível alterar o admin' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await client.query(`DELETE FROM users WHERE id = $1 AND role != 'admin'`, [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === MATERIALS ===
app.get('/api/materials', authenticateToken, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM materials WHERE user_id = $1', [req.userId]);
    res.json(result.rows.map(mapMaterial));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/materials', authenticateToken, async (req, res) => {
  try {
    const { name, unit, packageQty, pricePaid, pricePerMinUnit } = req.body;
    const result = await client.query(
      'INSERT INTO materials (id, name, unit, package_qty, price_paid, price_per_min_unit, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [randomUUID(), name, unit, packageQty, pricePaid, pricePerMinUnit, req.userId]
    );
    res.json(mapMaterial(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/materials/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, packageQty, pricePaid, pricePerMinUnit } = req.body;
    await client.query(
      'UPDATE materials SET name=$1, unit=$2, package_qty=$3, price_paid=$4, price_per_min_unit=$5 WHERE id=$6',
      [name, unit, packageQty, pricePaid, pricePerMinUnit, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/materials/:id', authenticateToken, async (req, res) => {
  try {
    await client.query('DELETE FROM materials WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === RECIPES ===
app.get('/api/recipes', authenticateToken, async (req, res) => {
  try {
    const result = await client.query(
      'SELECT id, name, yield AS recipe_yield, profit_margin, packaging_cost, labor_cost, energy_cost, waste_factor, prep_time_minutes, photo_url, instructions, user_id, created_at FROM recipes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    const recipes = [];
    for (const row of result.rows) {
      const items = await client.query('SELECT * FROM recipe_items WHERE recipe_id = $1', [row.id]);
      recipes.push(mapRecipe(row, items.rows));
    }
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/recipes', authenticateToken, async (req, res) => {
  try {
    const { name, yield: yieldVal, profitMargin, packagingCost, laborCost, energyCost, wasteFactor, prepTimeMinutes, photoUrl, instructions, items } = req.body;
    const recipeId = randomUUID();
    const result = await client.query(
      'INSERT INTO recipes (id, name, yield, profit_margin, packaging_cost, labor_cost, energy_cost, waste_factor, prep_time_minutes, photo_url, instructions, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
      [recipeId, name, yieldVal, profitMargin, packagingCost, laborCost, energyCost, wasteFactor, prepTimeMinutes || 0, photoUrl || '', instructions || '', req.userId]
    );
    if (items?.length > 0) {
      for (const item of items) {
        await client.query(
          'INSERT INTO recipe_items (id, recipe_id, material_id, qty, unit) VALUES ($1,$2,$3,$4,$5)',
          [randomUUID(), recipeId, item.materialId, item.qty, item.unit]
        );
      }
    }
    res.json(mapRecipe(result.rows[0], items || []));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, yield: yieldVal, profitMargin, packagingCost, laborCost, energyCost, wasteFactor, prepTimeMinutes, photoUrl, instructions, items } = req.body;
    await client.query(
      'UPDATE recipes SET name=$1, yield=$2, profit_margin=$3, packaging_cost=$4, labor_cost=$5, energy_cost=$6, waste_factor=$7, prep_time_minutes=$8, photo_url=$9, instructions=$10 WHERE id=$11',
      [name, yieldVal, profitMargin, packagingCost, laborCost, energyCost, wasteFactor, prepTimeMinutes || 0, photoUrl || '', instructions || '', id]
    );
    await client.query('DELETE FROM recipe_items WHERE recipe_id = $1', [id]);
    if (items?.length > 0) {
      for (const item of items) {
        await client.query(
          'INSERT INTO recipe_items (id, recipe_id, material_id, qty, unit) VALUES ($1,$2,$3,$4,$5)',
          [randomUUID(), id, item.materialId, item.qty, item.unit]
        );
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    await client.query('DELETE FROM recipes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === CONVERSIONS ===
app.get('/api/conversions', authenticateToken, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM conversions WHERE user_id = $1', [req.userId]);
    res.json(result.rows.map(mapConversion));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/conversions', authenticateToken, async (req, res) => {
  try {
    const { name, grams } = req.body;
    const result = await client.query(
      'INSERT INTO conversions (id, name, grams, user_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [randomUUID(), name, grams, req.userId]
    );
    res.json(mapConversion(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/conversions/:id', authenticateToken, async (req, res) => {
  try {
    await client.query('DELETE FROM conversions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === SETTINGS ===
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM settings WHERE user_id = $1', [req.userId]);
    res.json(result.rows.length > 0 ? mapSettings(result.rows[0]) : { hourlyRate: 25, energyRate: 5 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { hourlyRate, energyRate } = req.body;
    await client.query(
      'INSERT INTO settings (user_id, hourly_rate, energy_rate) VALUES ($1,$2,$3) ON CONFLICT (user_id) DO UPDATE SET hourly_rate=$2, energy_rate=$3',
      [req.userId, hourlyRate, energyRate]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === FRONTEND ===
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// === START ===
initDB()
  .then(() => {
    const port = Number(process.env.PORT || 3001);
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
