# Como Criar um Usuário Admin

## Opção 1: Usar a API de Registro (Local)

Se você está rodando localmente, pode fazer uma requisição POST assim:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@exemplo.com",
    "password": "sua-senha-segura",
    "adminToken": "admin-secret"
  }'
```

Vou devolver um token que salva no localStorage automaticamente.

## Opção 2: Adicionar Diretamente no PostgreSQL (Seguro)

Se você tem acesso ao banco via psql ou Neon console:

```sql
INSERT INTO users (email, password_hash) 
VALUES ('admin@chefcost.com', '$2b$10$...');
```

Para gerar um hash bcrypt de uma senha, use Node.js:

```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('sua-senha-aqui', 10).then(hash => console.log(hash));
```

## Opção 3: Criar um Script de Seed (Recomendado)

Na Render, você pode executar um comando one-off para criar usuários.

## Variáveis de Ambiente Necessárias

No seu `.env` ou painel da Render, adicione:

```
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
JWT_SECRET=seu-secret-key-bem-seguro-aqui
ADMIN_SECRET=admin-secret-para-criar-usuarios
PORT=10000
```

Pronto! Agora você controla completamente o acesso à aplicação. 🎯
