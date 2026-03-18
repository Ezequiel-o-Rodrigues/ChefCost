import express from 'express';
import cors from 'cors';
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || 'chefcost-secret-key-change-in-production';

const app = express();
app.use(cors());
app.use(express.json());

// Set proper MIME types for Vite build assets
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.type('application/javascript');
  } else if (req.url.endsWith('.css')) {
    res.type('text/css');
  }
  next();
});

// Serve the frontend build (Vite) if present
app.use(express.static(path.join(__dirname, 'dist'), { 
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Database configuration
const clientConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: { rejectUnauthorized: false },
    };

const client = new Client(clientConfig);

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => {
    console.error('Connection error', err);
    process.exit(1);
  });

// Create tables if not exist
const createTables = async () => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

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

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.email;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token inválido' });
  }
};

// === AUTH ENDPOINTS ===

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = jwt.sign({ email, userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, email });
  } catch (error) {
    console.error('Error on login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, adminToken } = req.body;

  const adminSecret = process.env.ADMIN_SECRET || 'admin-secret';

  if (adminToken !== adminSecret) {
    return res.status(403).json({ error: 'Não autorizado a criar usuários' });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );

    const token = jwt.sign({ email, userId: result.rows[0].id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, email, message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Error on register:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// === DATA ENDPOINTS (com autenticação) ===

// MATERIALS
app.get('/api/materials/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const result = await client.query('SELECT * FROM materials WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching materials:', error.message, error);
    res.status(500).json({ error: 'Erro ao buscar insumos', details: error.message });
  }
});

app.post('/api/materials', authenticateToken, async (req, res) => {
  try {
    const { name, unit, packageQty, pricePaid, pricePerMinUnit } = req.body;
    const userId = req.userId;
    const result = await client.query(
      'INSERT INTO materials (name, unit, package_qty, price_paid, price_per_min_unit, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, unit, packageQty, pricePaid, pricePerMinUnit, userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting material:', error.message, error);
    res.status(500).json({ error: 'Erro ao adicionar insumo', details: error.message });
  }
});

app.put('/api/materials/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, packageQty, pricePaid, pricePerMinUnit } = req.body;
    await client.query(
      'UPDATE materials SET name = $1, unit = $2, package_qty = $3, price_paid = $4, price_per_min_unit = $5 WHERE id = $6',
      [name, unit, packageQty, pricePaid, pricePerMinUnit, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating material:', error.message, error);
    res.status(500).json({ error: 'Erro ao atualizar insumo', details: error.message });
  }
});

app.delete('/api/materials/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await client.query('DELETE FROM materials WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error.message, error);
    res.status(500).json({ error: 'Erro ao deletar insumo', details: error.message });
  }
});

// RECIPES
app.get('/api/recipes/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const result = await client.query('SELECT * FROM recipes WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    const recipes = [];
    for (const row of result.rows) {
      const itemsResult = await client.query('SELECT * FROM recipe_items WHERE recipe_id = $1', [row.id]);
      recipes.push({ ...row, items: itemsResult.rows });
    }
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error.message, error);
    res.status(500).json({ error: 'Erro ao buscar receitas', details: error.message });
  }
});

app.post('/api/recipes', authenticateToken, async (req, res) => {
  try {
    const { name, yield: yieldVal, profitMargin, packagingCost, laborCost, energyCost, wasteFactor, items } = req.body;
    const userId = req.userId;
    const result = await client.query(
      'INSERT INTO recipes (name, yield, profit_margin, packaging_cost, labor_cost, energy_cost, waste_factor, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, yieldVal, profitMargin, packagingCost, laborCost, energyCost, wasteFactor, userId]
    );
    const recipe = result.rows[0];
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          'INSERT INTO recipe_items (recipe_id, material_id, qty, unit) VALUES ($1, $2, $3, $4)',
          [recipe.id, item.materialId, item.qty, item.unit]
        );
      }
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error.message, error);
    res.status(500).json({ error: 'Erro ao criar receita', details: error.message });
  }
});

app.put('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, yield: yieldVal, profitMargin, packagingCost, laborCost, energyCost, wasteFactor, items } = req.body;
    await client.query(
      'UPDATE recipes SET name = $1, yield = $2, profit_margin = $3, packaging_cost = $4, labor_cost = $5, energy_cost = $6, waste_factor = $7 WHERE id = $8',
      [name, yieldVal, profitMargin, packagingCost, laborCost, energyCost, wasteFactor, id]
    );
    await client.query('DELETE FROM recipe_items WHERE recipe_id = $1', [id]);
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          'INSERT INTO recipe_items (recipe_id, material_id, qty, unit) VALUES ($1, $2, $3, $4)',
          [id, item.materialId, item.qty, item.unit]
        );
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating recipe:', error.message, error);
    res.status(500).json({ error: 'Erro ao atualizar receita', details: error.message });
  }
});

app.delete('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await client.query('DELETE FROM recipes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error.message, error);
    res.status(500).json({ error: 'Erro ao deletar receita', details: error.message });
  }
});

// CONVERSIONS
app.get('/api/conversions/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const result = await client.query('SELECT * FROM conversions WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversions:', error.message, error);
    res.status(500).json({ error: 'Erro ao buscar conversões', details: error.message });
  }
});

app.post('/api/conversions', authenticateToken, async (req, res) => {
  try {
    const { name, grams } = req.body;
    const userId = req.userId;
    const result = await client.query(
      'INSERT INTO conversions (name, grams, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, grams, userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting conversion:', error.message, error);
    res.status(500).json({ error: 'Erro ao adicionar conversão', details: error.message });
  }
});

app.delete('/api/conversions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await client.query('DELETE FROM conversions WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversion:', error.message, error);
    res.status(500).json({ error: 'Erro ao deletar conversão', details: error.message });
  }
});

// SETTINGS
app.get('/api/settings/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    const result = await client.query('SELECT * FROM settings WHERE user_id = $1', [userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ hourlyRate: 25, energyRate: 5 });
    }
  } catch (error) {
    console.error('Error fetching settings:', error.message, error);
    res.status(500).json({ error: 'Erro ao buscar configurações', details: error.message });
  }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { hourlyRate, energyRate } = req.body;
    const userId = req.userId;
    await client.query(
      'INSERT INTO settings (user_id, hourly_rate, energy_rate) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET hourly_rate = $2, energy_rate = $3',
      [userId, hourlyRate, energyRate]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error.message, error);
    res.status(500).json({ error: 'Erro ao atualizar configurações', details: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});