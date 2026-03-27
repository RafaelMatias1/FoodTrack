import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const vendaSimulada = [620, 480, 710, 950, 847, 320, 180];

const formasPgto = [
  { nome: 'Pix', pct: 52 },
  { nome: 'Crédito', pct: 28 },
  { nome: 'Débito', pct: 12 },
  { nome: 'Dinheiro', pct: 8 },
];

const dataGrafico = diasSemana.map((dia, i) => ({ dia, valor: vendaSimulada[i] }));
const hojeIdx = 4; // Sexta

export function Dashboard() {
  const { pedidos, produtos } = useApp();

  const hoje = new Date();
  const pedidosHoje = pedidos.filter(p => {
    const d = new Date(p.data);
    return d.getDate() === hoje.getDate() && d.getMonth() === hoje.getMonth();
  });

  const faturamentoHoje = pedidosHoje
    .filter(p => p.status !== 'Cancelado')
    .reduce((sum, p) => sum + p.total, 0);

  const totalItensVendidos = pedidosHoje
    .filter(p => p.status !== 'Cancelado')
    .reduce((sum, p) => sum + p.itens.reduce((s, i) => s + i.quantidade, 0), 0);

  const estoqueBaixo = produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo && p.estoqueAtual > 0).length;
  const ticketMedio = pedidosHoje.length > 0 ? (faturamentoHoje / pedidosHoje.filter(p => p.status !== 'Cancelado').length) : 0;

  const ultimosPedidos = pedidosHoje.slice(0, 5);

  const statusClass = (status: string) => {
    if (status === 'Concluído') return 'badge badge-verde';
    if (status === 'Cancelado') return 'badge badge-vermelho';
    return 'badge badge-amarelo';
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Visão geral do dia</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge badge-cinza">
            {hoje.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
          <span className="badge badge-verde">Aberto</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card destaque">
          <div className="stat-label">Faturamento Hoje</div>
          <div className="stat-value">R$ {faturamentoHoje.toLocaleString('pt-BR')}</div>
          <div className="stat-sub">+12% vs ontem</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pedidos Hoje</div>
          <div className="stat-value" style={{ color: 'var(--texto-escuro)' }}>{pedidosHoje.length}</div>
          <div className="stat-sub normal">Ticket médio R$ {ticketMedio.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Itens Vendidos</div>
          <div className="stat-value" style={{ color: 'var(--texto-escuro)' }}>{totalItensVendidos}</div>
          <div className="stat-sub normal">X-Burguer lidera</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Estoque Baixo</div>
          <div className="stat-value" style={{ color: estoqueBaixo > 0 ? 'var(--amarelo)' : 'var(--verde)' }}>{estoqueBaixo}</div>
          <div className="stat-sub normal">Produtos em alerta</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">
            Vendas da semana
            <span className="badge badge-laranja">R$</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dataGrafico} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`R$ ${v}`, 'Vendas']} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {dataGrafico.map((_, index) => (
                  <Cell key={index} fill={index === hojeIdx ? '#e07b20' : '#f4c896'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Formas de pagamento</div>
          {formasPgto.map(f => (
            <div key={f.nome} className="pgto-row">
              <span className="pgto-nome">{f.nome}</span>
              <div className="pgto-bar-bg">
                <div className="pgto-bar-fill" style={{ width: `${f.pct}%` }} />
              </div>
              <span className="pgto-pct">{f.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Últimos pedidos */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: 12 }}>
          Últimos pedidos
          <span className="badge badge-cinza">hoje</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ultimosPedidos.map(p => (
                <tr key={p.id}>
                  <td className="td-numero">{p.numero}</td>
                  <td>{p.cliente || '—'}</td>
                  <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.itens.map(i => `${i.produto.nome}${i.quantidade > 1 ? ` x${i.quantidade}` : ''}`).join(', ')}
                  </td>
                  <td className="td-valor">R$ {p.total.toFixed(2).replace('.', ',')}</td>
                  <td>{p.formaPagamento}</td>
                  <td><span className={statusClass(p.status)}>{p.status}</span></td>
                </tr>
              ))}
              {ultimosPedidos.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--texto-claro)', padding: 24 }}>Nenhum pedido hoje ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
