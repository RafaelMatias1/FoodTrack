# 🍔 FoodTruck — Sistema de Gerenciamento para Food Truck

> **Projeto Integrador** — Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas  
> SENAI SC · 2026

Sistema web completo para gerenciamento de vendas, pedidos, estoque e clientes de um food truck. Possui painel administrativo, tela de cozinha (comandas), modo quiosque para autoatendimento e histórico detalhado.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Tecnologias](#-tecnologias)
3. [Estrutura do Projeto](#-estrutura-do-projeto)
4. [Pré-requisitos](#-pré-requisitos)
5. [Instalação e Setup](#-instalação-e-setup)
6. [Variáveis de Ambiente](#-variáveis-de-ambiente)
7. [Rodando o Projeto](#-rodando-o-projeto)
8. [Primeiro Acesso](#-primeiro-acesso)
9. [Scripts Disponíveis](#-scripts-disponíveis)
10. [Funcionalidades](#-funcionalidades)
11. [Rotas da API](#-rotas-da-api)
12. [Solução de Problemas](#-solução-de-problemas)

---

## 🎯 Visão Geral

O FoodTruck é dividido em dois serviços que rodam juntos:

| Serviço | Endereço | Descrição |
|---|---|---|
| **Frontend** | http://localhost:5173 | Interface React (painel, quiosque, cozinha) |
| **Backend** | http://localhost:3001 | API REST (Node.js + Prisma + MySQL) |
| **Health check** | http://localhost:3001/health | Verifica se a API está no ar |

---

## 🛠 Tecnologias

**Frontend**
- React 18 + TypeScript + Vite
- React Router DOM v6
- Recharts (gráficos)
- Lucide React (ícones)
- CSS puro com variáveis CSS

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM
- MySQL 8
- JWT (autenticação)
- bcryptjs (hash de senha)
- Zod (validação)

---

## 📁 Estrutura do Projeto

```
FoodTrack/
├── frontend/                  → App React + Vite
│   ├── src/
│   │   ├── components/        → Componentes reutilizáveis (Layout, Toast)
│   │   ├── context/           → Estado global (AppContext)
│   │   ├── pages/             → Páginas da aplicação
│   │   ├── services/          → Cliente HTTP (api.ts)
│   │   └── types/             → Interfaces TypeScript
│   └── index.html
│
├── backend/                   → API REST Node.js
│   ├── src/
│   │   ├── routes/            → Endpoints (auth, produtos, pedidos, clientes)
│   │   ├── services/          → Lógica de negócio
│   │   ├── middleware/        → Auth JWT, tratamento de erros
│   │   └── lib/               → Utilitários (hash, jwt, validação)
│   ├── prisma/
│   │   ├── schema.prisma      → Modelos do banco de dados
│   │   └── seed.ts            → Dados iniciais (opcional)
│   └── .env                   → Variáveis de ambiente (NÃO sobe para o Git)
│
├── db/                        → Pasta reservada para arquivos locais do banco
├── package.json               → Orquestrador (roda tudo junto)
├── README.md
└── ROADMAP.md                 → Progresso e histórico do projeto
```

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado na sua máquina:

| Ferramenta | Versão mínima | Como verificar |
|---|---|---|
| **Node.js** | 18 ou superior | `node -v` |
| **npm** | 9 ou superior | `npm -v` |
| **MySQL** | 8.0 | `mysql --version` |
| **Git** | qualquer | `git --version` |

> 💡 **Dica para instalar o Node.js:** Acesse [nodejs.org](https://nodejs.org) e baixe a versão **LTS**.  
> 💡 **Dica para instalar o MySQL:** Acesse [mysql.com/downloads](https://dev.mysql.com/downloads/mysql/) ou use o [XAMPP](https://www.apachefriends.org/) / [MySQL Workbench](https://www.mysql.com/products/workbench/).

---

## 🚀 Instalação e Setup

### Passo 1 — Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/FoodTrack.git
cd FoodTrack
```

---

### Passo 2 — Criar o banco de dados no MySQL

Abra o MySQL (Workbench, terminal ou XAMPP) e execute:

```sql
CREATE DATABASE foodtruck CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> O nome do banco **deve ser exatamente** `foodtruck` (minúsculas).

---

### Passo 3 — Criar o arquivo `.env` do backend

Dentro da pasta `backend/`, crie um arquivo chamado `.env` com o seguinte conteúdo:

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/foodtruck"
JWT_SECRET="uma-chave-secreta-longa-e-aleatoria-aqui"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

> ⚠️ **Atenção:** Substitua `root` pelo seu usuário do MySQL e `SUA_SENHA` pela sua senha.  
> Se não tiver senha no MySQL, deixe assim: `mysql://root:@localhost:3306/foodtruck`  
> O arquivo `.env` **nunca deve ser commitado** (já está no `.gitignore`).

---

### Passo 4 — Instalar as dependências

Na **raiz** do projeto, execute:

```bash
npm run install:all
```

Isso instala as dependências do frontend e do backend de uma vez só.

---

### Passo 5 — Rodar as migrations do banco

```bash
npm run db:setup
```

Esse comando cria todas as tabelas no banco (`Usuario`, `Produto`, `Cliente`, `Pedido`, `ItemPedido`).

> ✅ Se tudo correr bem, você verá: `All migrations have been applied.`

---

### Passo 6 — (Opcional) Popular o banco com dados de exemplo

```bash
npm run db:seed
```

Cria alguns produtos e um usuário de demonstração no banco.

---

## 🔐 Variáveis de Ambiente

O arquivo `backend/.env` contém todas as configurações sensíveis:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | String de conexão com o MySQL | `mysql://root:senha@localhost:3306/foodtruck` |
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT | Qualquer string longa e aleatória |
| `PORT` | Porta em que a API vai rodar | `3001` |
| `CORS_ORIGIN` | Endereço do frontend permitido | `http://localhost:5173` |

> **Importante:** O arquivo `.env` **não está no repositório Git** por segurança. Cada desenvolvedor precisa criar o seu próprio.

---

## ▶️ Rodando o Projeto

Com tudo configurado, basta rodar na **raiz** do projeto:

```bash
npm run dev
```

Isso sobe o **frontend** e o **backend** ao mesmo tempo. Você verá os logs das duas aplicações no terminal, identificados por `[FRONT]` e `[BACK]`.

Acesse no navegador: **http://localhost:5173**

---

## 👤 Primeiro Acesso

Na primeira vez que abrir o sistema, você verá a tela de **Login**.

1. Clique em **"Criar conta"**
2. Preencha os dados do seu food truck (nome, proprietário, cidade, e-mail e senha)
3. Clique em **"Criar conta"** e você será logado automaticamente

> Cada conta é independente. Os dados (produtos, pedidos, clientes) ficam vinculados ao e-mail cadastrado.

---

## 📜 Scripts Disponíveis

Execute estes comandos na **raiz** do projeto:

| Comando | O que faz |
|---|---|
| `npm run dev` | 🚀 Sobe frontend + backend juntos (modo desenvolvimento) |
| `npm run install:all` | 📦 Instala todas as dependências (front e back) |
| `npm run db:setup` | 🗄️ Roda as migrations e cria as tabelas no banco |
| `npm run db:seed` | 🌱 Popula o banco com dados de exemplo |
| `npm run db:reset` | ⚠️ Apaga e recria o banco do zero (cuidado!) |
| `npm run build` | 🏗️ Gera o build de produção (front e back) |

---

## ✨ Funcionalidades

| Página | Rota | Descrição |
|---|---|---|
| **Dashboard** | `/` | Visão geral do dia: faturamento, pedidos, gráfico semanal |
| **Novo Pedido** | `/novo-pedido` | Registrar um pedido manualmente (presencial ou WhatsApp) |
| **Comandas** | `/comandas` | Tela de cozinha: ver pedidos em preparo e concluí-los |
| **Histórico** | `/historico` | Todos os pedidos com filtro por data e status |
| **Estoque** | `/estoque` | Controle de estoque com alertas de baixo estoque |
| **Produtos** | `/produtos` | Cadastrar, editar e excluir produtos do cardápio |
| **Clientes** | `/clientes` | Cadastro e histórico de clientes |
| **Quiosque** | `/quiosque` | Modo autoatendimento para o cliente fazer o pedido sozinho |
| **Configurações** | `/configuracoes` | Dados do food truck, código do quiosque e troca de senha |

---

## 🔌 Rotas da API

Base URL: `http://localhost:3001`

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Criar conta |
| `POST` | `/auth/login` | Fazer login (retorna JWT) |
| `GET` | `/auth/me` | Dados do usuário logado |
| `PATCH` | `/auth/me` | Atualizar perfil |
| `PATCH` | `/auth/me/senha` | Alterar senha |

### Produtos
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/produtos` | Listar todos os produtos |
| `POST` | `/produtos` | Criar produto |
| `PATCH` | `/produtos/:id` | Editar produto |
| `DELETE` | `/produtos/:id` | Excluir produto |
| `POST` | `/produtos/:id/repor-estoque` | Repor estoque |

### Pedidos
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/pedidos` | Listar pedidos |
| `POST` | `/pedidos` | Criar pedido |
| `PATCH` | `/pedidos/:id/status` | Atualizar status do pedido |

### Clientes
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/clientes` | Listar clientes |
| `POST` | `/clientes` | Cadastrar cliente |

> Todas as rotas (exceto `/auth/login` e `/auth/register`) exigem o header:  
> `Authorization: Bearer SEU_TOKEN_JWT`

---

## 🐛 Solução de Problemas

### ❌ Erro: `connect ECONNREFUSED 127.0.0.1:3306`
O MySQL não está rodando. Inicie o serviço do MySQL na sua máquina.

### ❌ Erro: `Access denied for user 'root'@'localhost'`
A senha no `DATABASE_URL` do `.env` está incorreta. Corrija com o usuário e senha corretos do seu MySQL.

### ❌ Erro: `Unknown database 'foodtruck'`
O banco não foi criado. Execute o SQL `CREATE DATABASE foodtruck;` no MySQL.

### ❌ Frontend abre mas diz "Erro ao conectar"
Verifique se o backend está rodando (`npm run dev` na raiz). Confira se `CORS_ORIGIN` no `.env` está apontando para `http://localhost:5173`.

### ❌ Erro de porta em uso (`EADDRINUSE`)
Algum processo já está usando a porta 3001 ou 5173. Encerre o processo ou altere a porta no `.env`.

### ❌ `npm run install:all` falha no backend
Pode ser incompatibilidade de versão do Node. Certifique-se de ter Node.js 18+. Rode `node -v` para verificar.

---

## 👥 Time

Projeto desenvolvido por alunos do curso de ADS — SENAI SC, 2026.

---

## 📄 Licença

Uso acadêmico. Todos os direitos reservados aos autores.
