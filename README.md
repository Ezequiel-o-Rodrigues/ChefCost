<div align="center">

# 🍳 ChefCost

### Sistema Inteligente de Precificação para Profissionais da Gastronomia

*Calcule custos, simule lucros e gerencie receitas com precisão — powered by IA*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![n8n](https://img.shields.io/badge/n8n-Automation-EA4B71?logo=n8n&logoColor=white)](https://n8n.io/)

</div>

---

## 📸 Screenshots

<div align="center">

<!-- Adicione suas screenshots aqui -->
<!-- <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="800"/> -->
<!-- <img src="docs/screenshots/receitas.png" alt="Gestão de Receitas" width="800"/> -->
<!-- <img src="docs/screenshots/simulador.png" alt="Simulador de Lucros" width="800"/> -->

*Screenshots em breve*

</div>

---

## 💡 O Problema

Todo profissional da gastronomia enfrenta o mesmo desafio: **como precificar corretamente?** Muitos chefs, confeiteiros e donos de restaurantes calculam preços "no olho", sem considerar custos reais de mão de obra, energia, desperdício e embalagem — e acabam **vendendo no prejuízo**.

## 🎯 A Solução

O **ChefCost** é uma plataforma completa que automatiza toda a cadeia de precificação:

```
📦 Cadastre ingredientes com preços reais
  → 🍰 Monte receitas com quantidades exatas
    → 🧮 Custos calculados automaticamente
      → 💰 Preço de venda sugerido com margem de lucro
        → 📊 Simule cenários de vendas e lucro
```

---

## 🚀 Funcionalidades

### 📦 Gestão de Ingredientes
- Cadastro completo com preço de compra, quantidade da embalagem e unidade (kg, g, L, ml, un)
- **Cálculo automático do preço por unidade mínima** — sabe exatamente quanto custa cada grama

### 🍰 Construtor de Receitas
- Monte receitas selecionando ingredientes e quantidades
- Configure: rendimento, margem de lucro (%), embalagem, fator de desperdício, tempo de preparo
- Suporte a fotos e instruções de preparo
- CRUD completo com interface intuitiva

### 🧮 Cálculo Automático de Custos
O sistema calcula automaticamente:

| Componente | Descrição |
|-----------|-----------|
| **Custo dos ingredientes** | Soma de todos os itens convertidos para unidade mínima |
| **Desperdício** | Ajuste pelo fator de perda configurado |
| **Mão de obra** | Tempo de preparo × valor/hora do profissional |
| **Energia** | Custo energético proporcional |
| **Preço sugerido** | Custo total × (1 + margem de lucro%) |

### 📊 Simulador de Lucros
- Selecione uma receita e defina quantidades de venda
- Visualize: custo/unidade, preço/unidade, investimento total, receita, **lucro líquido**
- Detalhamento completo dos ingredientes necessários

### 🤖 Assistente IA (Chef Assistant)
- Chat flutuante com **Google Gemini AI** via **n8n**
- Suporte a **texto, imagens e voz** (gravação via MediaRecorder API)
- Cadastre ingredientes e receitas por linguagem natural
- Processe notas fiscais por foto — a IA extrai os dados automaticamente

### 👨‍💼 Painel Administrativo
- Gestão de usuários com ativação/desativação
- Controle de acesso por roles (admin/user)
- Multi-tenant — cada usuário vê apenas seus dados

### ⚙️ Conversões Personalizadas
- Conversões padrão incluídas (xícara, colher de sopa, colher de chá, copo americano)
- Adicione conversões customizadas para suas medidas caseiras

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Finalidade |
|--------|-----------|------------|
| **Frontend** | React 19 + TypeScript | Interface reativa e tipada |
| **Build** | Vite 6.2 | Build ultrarrápido com HMR |
| **Estilização** | Tailwind CSS 4 | Design responsivo mobile-first |
| **Animações** | Framer Motion 12 | Transições e micro-interações |
| **Backend** | Node.js + Express.js | API RESTful |
| **Banco de Dados** | PostgreSQL (Neon) | Banco serverless com SSL |
| **Autenticação** | JWT + bcrypt | Tokens seguros com hash de senha |
| **IA** | Google Gemini AI | Assistente inteligente |
| **Automação** | n8n | Processamento de mensagens/imagens/voz |
| **Ícones** | Lucide React | Iconografia moderna |

---

## 📐 Arquitetura

```
┌─────────────────────────────────────────────┐
│              FRONTEND (React 19)            │
│     Tailwind CSS · Framer Motion · Vite    │
└──────────────────┬──────────────────────────┘
                   │ HTTP + JWT
┌──────────────────▼──────────────────────────┐
│           BACKEND (Express.js)              │
│     API RESTful · Auth · Proxy n8n         │
└────────┬──────────────────────┬─────────────┘
         │                      │
┌────────▼────────┐    ┌───────▼──────────┐
│   PostgreSQL    │    │      n8n         │
│    (Neon)       │    │   Workflow AI    │
│                 │    │      │           │
│  • users        │    │      ▼           │
│  • materials    │    │  Google Gemini   │
│  • recipes      │    │  (texto/img/voz) │
│  • recipe_items │    └──────────────────┘
│  • conversions  │
│  • settings     │
└─────────────────┘
```

---

## 🎨 Design

- **Mobile-first** com layout responsivo (max 448px mobile, 1152px desktop)
- **Paleta gastronômica**: Creme (`#FCF9F1`), Rosa Pastel (`#F4C2C2`), Bordô (`#800020`)
- Cards arredondados com visual acolhedor
- Navegação por barra flutuante inferior no mobile

---

## 📦 Estrutura do Projeto

```
ChefCost/
├── server.js                    # Backend Express (API completa)
├── vite.config.ts               # Configuração Vite + Tailwind
├── .env.example                 # Template de variáveis
├── create-user.js               # Script CLI para criar usuários
│
├── src/
│   ├── App.tsx                  # App principal com roteamento
│   ├── types.ts                 # Interfaces TypeScript
│   ├── constants.ts             # Conversões padrão e cores
│   │
│   ├── components/
│   │   ├── DashboardSummary.tsx # Dashboard com métricas
│   │   ├── IngredientForm.tsx   # Formulário de ingredientes
│   │   ├── IngredientList.tsx   # Lista de ingredientes
│   │   ├── RecipeForm.tsx       # Construtor de receitas
│   │   ├── RecipeList.tsx       # Galeria de receitas
│   │   ├── ProfitCalculator.tsx # Simulador de lucros
│   │   ├── ChefAssistant.tsx    # Chat IA flutuante
│   │   ├── ConversionForm.tsx   # Conversões customizadas
│   │   ├── SettingsForm.tsx     # Configurações do usuário
│   │   ├── AdminDashboard.tsx   # Painel administrativo
│   │   └── SimpleAuth.tsx       # Tela de login
│   │
│   ├── hooks/
│   │   ├── useAPI.ts            # Hook de CRUD universal
│   │   └── useAuth.ts           # Hook de autenticação
│   │
│   ├── services/
│   │   ├── apiService.ts        # Cliente HTTP
│   │   ├── assistantService.ts  # Cliente do assistente IA
│   │   └── authService.ts       # Gerenciamento de tokens
│   │
│   └── utils/
│       └── calculations.ts      # Motor de cálculos de custo
│
└── dist/                        # Build de produção
```

---

## ⚡ Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL (recomendado: [Neon](https://neon.tech/))

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Ezequiel-o-Rodrigues/ChefCost.git
cd ChefCost

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### Variáveis de Ambiente

```env
# PostgreSQL (Neon)
DATABASE_URL=postgresql://usuario:senha@host/database?sslmode=require

# Google AI (Assistente)
GEMINI_API_KEY=sua-chave-gemini

# n8n (Automação IA)
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/chef-assistant

# App
PORT=3001
```

### Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start
```

---

## 🔐 Segurança

- **JWT** com expiração de 30 dias
- **bcrypt** para hash de senhas (10 rounds)
- Dados isolados por usuário (**multi-tenant**)
- SSL habilitado no banco de dados
- Admin pode ativar/desativar contas

---

## 🤝 Autor

**Ezequiel Oliveira** — Full-Stack Developer

---

<div align="center">

*Feito com ❤️ para quem transforma ingredientes em arte — e quer lucrar com isso*

</div>
