#!/usr/bin/env node

/**
 * Script para criar usuários admin no ChefCost
 * Use: node create-user.js
 */

import readline from 'readline';
import bcrypt from 'bcrypt';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

const main = async () => {
  console.log('🔐 ChefCost - Criar Usuário Admin\n');

  const email = await question('Email do usuário: ');
  const password = await question('Senha: ');
  const confirmPassword = await question('Confirmar senha: ');

  if (password !== confirmPassword) {
    console.error('❌ Senhas não conferem!');
    rl.close();
    process.exit(1);
  }

  try {
    const clientConfig = process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.PGHOST,
          database: process.env.PGDATABASE,
          user: process.env.PGUSER,
          password: process.env.PGPASSWORD,
          ssl: { rejectUnauthorized: false },
        };

    const client = new Client(clientConfig);
    await client.connect();

    // Verificar se usuário já existe
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.error('❌ Esse email já está cadastrado!');
      await client.end();
      rl.close();
      process.exit(1);
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Inserir usuário
    await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
      [email, passwordHash]
    );

    console.log('✅ Usuário criado com sucesso!');
    console.log(`   Email: ${email}`);
    
    await client.end();
    rl.close();
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    rl.close();
    process.exit(1);
  }
};

main();
