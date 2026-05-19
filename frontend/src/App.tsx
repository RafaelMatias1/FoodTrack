import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NovoPedido } from './pages/NovoPedido';
import { Estoque } from './pages/Estoque';
import { Historico } from './pages/Historico';
import { Clientes } from './pages/Clientes';
import { Produtos } from './pages/Produtos';
import { Comandas } from './pages/Comandas';
import { Configuracoes } from './pages/Configuracoes';
import { Quiosque } from './pages/Quiosque';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';

function AppRoutes() {
  const { logado, primeiroAcesso } = useApp();

  if (primeiroAcesso) return <Cadastro />;
  if (!logado) return <Login />;

  return (
    <Routes>
      {/* Quiosque: tela cheia sem sidebar */}
      <Route path="/quiosque" element={<Quiosque />} />

      {/* Sistema principal */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="novo-pedido" element={<NovoPedido />} />
        <Route path="comandas" element={<Comandas />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="historico" element={<Historico />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
