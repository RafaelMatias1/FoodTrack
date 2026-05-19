# 🍔 FoodTruck — Sistema de Gerenciamento

> Projeto Integrador — Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas — SENAI SC, 2026.

Sistema web para gerenciamento de vendas, estoque, pedidos e clientes de um food truck.

---

## 📁 Estrutura do Repositório

```
FoodTrack/
├── frontend/       → App React + Vite (interface do usuário)
├── backend/        → API REST Node.js + Express + Prisma
├── db/             → Pasta reservada para arquivos locais do banco
├── package.json    → Orquestrador (roda tudo junto)
├── README.md       → Instruções de setup
└── ROADMAP.md      → Progresso do projeto etapa por etapa
```

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- Node.js 18+
- MySQL rodando localmente
- Banco `foodtruck` criado no MySQL

### 1. Instalar dependências
```bash
npm run install:all
```

### 2. Configurar o banco (só na primeira vez)
```bash
# Edite backend/.env com suas credenciais do MySQL
# Depois rode:
npm run db:setup
```

### 3. Rodar tudo junto
```bash
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:3001  
- **Health check:** http://localhost:3001/health  

---

## 🗃️ Variáveis de ambiente

Arquivo: `backend/.env` *(não sobe para o Git)*

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/foodtruck"
JWT_SECRET="chave-secreta-longa"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

---

## 📜 Scripts disponíveis (raiz)

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe frontend + backend juntos |
| `npm run install:all` | Instala deps do front e do back |
| `npm run db:setup` | Roda as migrations do banco |
| `npm run db:seed` | Popula o banco com dados iniciais |
| `npm run db:reset` | Apaga e recria o banco (cuidado!) |
| `npm run build` | Build de produção dos dois |

---

## 🗺️ Acompanhe o progresso em [ROADMAP.md](./ROADMAP.md)
