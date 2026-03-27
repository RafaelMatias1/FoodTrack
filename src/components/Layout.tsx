import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Package, History, Users, ShoppingBag, Settings, Utensils } from 'lucide-react';

const navItems = [
  { to: '/', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/novo-pedido', icon: <PlusCircle size={16} />, label: 'Novo Pedido' },
  { to: '/estoque', icon: <Package size={16} />, label: 'Estoque' },
  { to: '/historico', icon: <History size={16} />, label: 'Histórico' },
  { to: '/clientes', icon: <Users size={16} />, label: 'Clientes' },
  { to: '/produtos', icon: <ShoppingBag size={16} />, label: 'Produtos' },
];

export function Layout() {
  return (
    <div className="app-wrapper">
      {/* Topbar */}
      <nav className="topbar">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Utensils size={20} />
            </div>
            <div className="sidebar-brand-text">
              <h2>FoodTrack</h2>
              <p>Food Truck do Elpidio</p>
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
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <a href="#">
              <Settings size={14} />
              Configurações
            </a>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
