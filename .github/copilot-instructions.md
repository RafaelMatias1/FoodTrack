<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# FoodTrack — Sistema de Gerenciamento para Food Truck

## Stack
- **React 18** + **TypeScript** com **Vite**
- **React Router DOM v6** para navegação SPA
- **Recharts** para gráficos
- **Lucide React** para ícones
- CSS puro com variáveis CSS (sem frameworks externos)

## Convenções
- Componentes funcionais com hooks
- Tipagem estrita (sem `any` exceto quando necessário para compatibilidade)
- Estado global via Context API (`src/context/AppContext.tsx`)
- Dados persistidos no `localStorage`
- Todos os textos em **Português Brasileiro**
- Paleta de cores: marrom escuro (`#3d1a00`), laranja (`#e07b20`), creme (`#fdf6ee`)
- Classes CSS no arquivo `src/index.css` (BEM simplificado)

## Estrutura
- `src/types/index.ts` — interfaces e tipos
- `src/context/AppContext.tsx` — estado global + localStorage
- `src/components/` — componentes reutilizáveis
- `src/pages/` — páginas (Dashboard, NovoPedido, Estoque, Historico, Clientes, Produtos)
