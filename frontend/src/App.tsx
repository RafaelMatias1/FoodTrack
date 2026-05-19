import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/Toast';
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
import { Utensils } from 'lucide-react';

function AppRoutes() {
  const { logado, inicializando } = useApp();

  // Aguarda a verificação do token antes de renderizar
  if (inicializando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, color: 'var(--laranja)' }}>
        <Utensils size={40} />
        <p style={{ fontSize: 16, color: 'var(--texto-claro)' }}>Carregando...</p>
      </div>
    );
  }

  if (!logado) {
    return (
      <Routes>
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/quiosque" element={<Quiosque />} />
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
    <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
}
