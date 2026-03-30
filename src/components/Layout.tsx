import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Package, History, Users, ShoppingBag, Settings, Utensils, ClipboardList, Monitor } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/novo-pedido', icon: <PlusCircle size={16} />, label: 'Novo Pedido' },
  { to: '/comandas', icon: <ClipboardList size={16} />, label: 'Comandas' },
  { to: '/estoque', icon: <Package size={16} />, label: 'Estoque' },
  { to: '/historico', icon: <History size={16} />, label: 'Histórico' },
  { to: '/clientes', icon: <Users size={16} />, label: 'Clientes' },
  { to: '/produtos', icon: <ShoppingBag size={16} />, label: 'Produtos' },
];

// Itens que aparecem na barra inferior mobile (os mais usados)
const mobileNavItems = [
  { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/novo-pedido', icon: <PlusCircle size={20} />, label: 'Pedido' },
  { to: '/comandas', icon: <ClipboardList size={20} />, label: 'Comandas' },
  { to: '/historico', icon: <History size={20} />, label: 'Histórico' },
  { to: '/estoque', icon: <Package size={20} />, label: 'Estoque' },
];

export function Layout() {
  const { configuracoes, pedidos } = useApp();
  const emPreparo = pedidos.filter(p => p.status === 'Em preparo').length;

  return (
    <div className="app-wrapper">
      {/* Topbar (mobile: navegação principal / desktop: apenas branding) */}
      <nav className="topbar">
        <div className="topbar-brand">
          <Utensils size={15} />
          <span>{configuracoes.nomeFoodTruck}</span>
        </div>
        <div className="topbar-nav-mobile">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {item.label}
              {item.to === '/comandas' && emPreparo > 0 && (
                <span className="topbar-badge">{emPreparo}</span>
              )}
            </NavLink>
          ))}
        </div>
        <div className="topbar-actions">
          <NavLink to="/quiosque" title="Quiosque">
            <Monitor size={14} />
          </NavLink>
          <NavLink to="/configuracoes" title="Configurações">
            <Settings size={14} />
          </NavLink>
        </div>
      </nav>

      <div className="main-layout">
        {/* Sidebar desktop */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Utensils size={20} />
            </div>
            <div className="sidebar-brand-text">
              <h2>FoodTrack</h2>
              <p>{configuracoes.nomeFoodTruck}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {item.icon}
                {item.label}
                {item.to === '/comandas' && emPreparo > 0 && (
                  <span className="sidebar-badge">{emPreparo}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <NavLink to="/quiosque" className={({ isActive }) => `sidebar-footer-link ${isActive ? 'active' : ''}`}>
              <Monitor size={14} />
              Quiosque
            </NavLink>
            <NavLink to="/configuracoes" className={({ isActive }) => `sidebar-footer-link ${isActive ? 'active' : ''}`}>
              <Settings size={14} />
              Configurações
            </NavLink>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Barra de navegação mobile (inferior) */}
      <nav className="mobile-nav">
        {mobileNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">
              {item.icon}
              {item.to === '/comandas' && emPreparo > 0 && (
                <span className="mobile-nav-badge">{emPreparo}</span>
              )}
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/configuracoes"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="mobile-nav-icon"><Settings size={20} /></span>
          <span className="mobile-nav-label">Config.</span>
        </NavLink>
      </nav>
    </div>
  );
}
