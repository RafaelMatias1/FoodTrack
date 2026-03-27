import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NovoPedido } from './pages/NovoPedido';
import { Estoque } from './pages/Estoque';
import { Historico } from './pages/Historico';
import { Clientes } from './pages/Clientes';
import { Produtos } from './pages/Produtos';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="novo-pedido" element={<NovoPedido />} />
            <Route path="estoque" element={<Estoque />} />
            <Route path="historico" element={<Historico />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="produtos" element={<Produtos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
