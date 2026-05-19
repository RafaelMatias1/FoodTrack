# 🗺️ ROADMAP — FoodTruck

> Arquivo de progresso do projeto. Atualizado a cada etapa concluída.  
> **Última atualização:** 19/05/2026 (Etapa 5 concluída)

---

## ✅ ETAPA 1 — Reorganização do Repositório *(Concluída)*

- [x] Separar frontend e backend em pastas distintas (`frontend/`, `backend/`)
- [x] Criar pasta `db/` dedicada para o banco local
- [x] Criar `package.json` raiz como orquestrador (um único `npm run dev`)
- [x] Instalar `concurrently` para rodar front + back ao mesmo tempo
- [x] Atualizar `.gitignore` para cobrir as duas pastas
- [x] Criar `backend/.env` com variáveis de ambiente reais (MySQL)
- [x] Remover `.env.example` desnecessário

---

## ✅ ETAPA 2 — Banco de Dados MySQL *(Concluída)*

- [x] **2.1** — `.env` preenchido com credenciais do MySQL
- [x] **2.2** — Banco `foodtruck` criado no MySQL
- [x] **2.3** — `schema.prisma` migrado de SQLite → MySQL
- [x] **2.4** — Migrations antigas removidas e nova migration `init` rodada
- [x] **2.5** — Health check OK: `http://localhost:3001/health` retorna `{"ok":true}`
- [x] **2.6** — Tabelas criadas: `Usuario`, `Produto`, `Cliente`, `Pedido`, `ItemPedido`

---

## ✅ ETAPA 3 — Corrigir o Bug do Login no Frontend *(Concluída)*

- [x] **3.1** — Criado `frontend/src/services/api.ts` — cliente HTTP com JWT automático
- [x] **3.2** — `AppContext` refatorado: `login()` e `cadastrar()` agora são async e chamam a API real
- [x] **3.3** — Token JWT salvo no `localStorage` após login/cadastro
- [x] **3.4** — Removida dependência do `primeiroAcesso` com `localStorage`
- [x] **3.5** — `App.tsx` simplificado: deslogado → Login; `/cadastro` → tela de Cadastro
- [x] **3.6** — `Login.tsx` atualizado: async, exibe erros da API, link "Criar conta"
- [x] **3.7** — `Cadastro.tsx` atualizado: async, exibe erros da API, link "Fazer login"

---

## ✅ ETAPA 4 — Integrar Frontend com Backend *(Concluída)*

- [x] **4.1** — `services/api.ts` — cliente HTTP com JWT automático em toda requisição
- [x] **4.2** — Autenticação: `login` e `cadastrar` chamam a API, token salvo no localStorage
- [x] **4.3** — Produtos: `GET /produtos`, `POST`, `PATCH /:id`, `DELETE /:id` conectados
- [x] **4.4** — Pedidos: `GET /pedidos`, `POST /pedidos`, `PATCH /:id/status` conectados
- [x] **4.5** — Clientes: `GET /clientes`, `POST /clientes` conectados
- [x] **4.6** — Estoque: `POST /produtos/:id/repor-estoque` conectado
- [x] **4.7** — Inicialização: ao abrir o app com token salvo, carrega dados da API automaticamente
- [x] **4.8** — Tela de loading enquanto verifica o token na inicialização
- [x] **4.9** — Todas as páginas (NovoPedido, Produtos, Estoque, Clientes, Comandas, Histórico, Quiosque) atualizadas para `async/await` com tratamento de erro

---

## ⏳ ETAPA 5 — Correções Gerais do Frontend

- [ ] **5.1** — Revisar a página **Dashboard** (gráficos com dados reais da API)
- [ ] **5.2** — Revisar a página **Quiosque** (modo tela cheia para clientes)
- [ ] **5.3** — Revisar a página **Comandas** (gestão de pedidos em aberto)
- [ ] **5.4** — Revisar a página **Configurações** (salvar na API, não localStorage)
- [ ] **5.5** — Revisar a página **Histórico** (filtros por data funcionando)
- [ ] **5.6** — Tratamento de erros (mostrar mensagens amigáveis quando a API falha)
- [ ] **5.7** — Loading states (mostrar "carregando..." enquanto busca dados)

---

## ⏳ ETAPA 6 — Trocar o nome do app de FoodTrack → FoodTruck

- [ ] **6.1** — Renomear referências no código (`FoodTrack` → `FoodTruck`)
- [ ] **6.2** — Atualizar `package.json` dos dois projetos
- [ ] **6.3** — Atualizar título do HTML (`index.html`)
- [ ] **6.4** — Renomear a pasta raiz do repositório (se necessário)

---

## 📋 Resumo Geral do Estado Atual

| Componente | Status | Detalhe |
|---|---|---|
| Estrutura de pastas | ✅ OK | `frontend/`, `backend/`, `db/` separados |
| `npm run dev` único | ✅ OK | Roda os dois com concurrently |
| Backend (API) | ✅ OK | MySQL conectado, todos endpoints funcionando |
| Banco de dados | ✅ OK | MySQL `foodtruck`, tabelas criadas |
| Frontend (UI) | ✅ OK | 100% conectado à API |
| Login / Cadastro | ✅ OK | Conectado à API, JWT salvo |
| Integração front↔back | ✅ OK | Todos os endpoints conectados |

---

## 🔑 Credenciais e Acessos

| Item | Valor |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |
| Health check | http://localhost:3001/health |
| Banco MySQL | `foodtruck` (localhost:3306) |
| `.env` | `backend/.env` (não está no Git) |

---

> **Como usar este arquivo:**  
> A cada etapa que terminarmos, marcamos os checkboxes com `[x]` e atualizamos a data no topo.
