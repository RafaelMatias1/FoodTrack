import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function Dashboard() {
  const { pedidos, produtos } = useApp();

  const hoje = new Date();
  const hojeIdx = hoje.getDay(); // 0=Dom ... 6=Sab

  // Pedidos da semana atual (últimos 7 dias)
  const pedidosHoje = pedidos.filter(p => {
    const d = new Date(p.data);
    return d.getDate() === hoje.getDate() && d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  });

  // Vendas por dia da semana (últimos 7 dias)
  const vendaPorDia = Array(7).fill(0);
  const seteAtrás = new Date();
  seteAtrás.setDate(hoje.getDate() - 6);
  pedidos.forEach(p => {
    const d = new Date(p.data);
    if (p.status === 'Cancelado') return;
    if (d >= seteAtrás && d <= hoje) {
      vendaPorDia[d.getDay()] += p.total;
    }
  });

  const dataGrafico = diasSemana.map((dia, i) => ({ dia, valor: Math.round(vendaPorDia[i]) }));

  // Formas de pagamento dos pedidos de hoje (reais)
  const pgtoCount: Record<string, number> = {};
  const pedidosValidos = pedidosHoje.filter(p => p.status !== 'Cancelado');
  pedidosValidos.forEach(p => { pgtoCount[p.formaPagamento] = (pgtoCount[p.formaPagamento] || 0) + 1; });
  const totalPgto = pedidosValidos.length || 1;
  const formasPgto = Object.entries(pgtoCount).map(([nome, qtd]) => ({ nome, pct: Math.round((qtd / totalPgto) * 100) }));
  if (formasPgto.length === 0) {
    formasPgto.push({ nome: 'Pix', pct: 0 }, { nome: 'Crédito', pct: 0 }, { nome: 'Débito', pct: 0 }, { nome: 'Dinheiro', pct: 0 });
  }

  const faturamentoHoje = pedidosValidos.reduce((sum, p) => sum + p.total, 0);
  const totalItensVendidos = pedidosValidos.reduce((sum, p) => sum + p.itens.reduce((s, i) => s + i.quantidade, 0), 0);
  const estoqueBaixo = produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo && p.estoqueAtual > 0).length;
  const ticketMedio = pedidosValidos.length > 0 ? faturamentoHoje / pedidosValidos.length : 0;

  // Produto mais vendido hoje
  const vendasPorProduto: Record<string, number> = {};
  pedidosValidos.forEach(p => p.itens.forEach(i => {
    vendasPorProduto[i.produto.nome] = (vendasPorProduto[i.produto.nome] || 0) + i.quantidade;
  }));
  const maisVendido = Object.entries(vendasPorProduto).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const ultimosPedidos = [...pedidosHoje].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);

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
          <div className="stat-value">R$ {faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="stat-sub">{pedidosValidos.length} pedido{pedidosValidos.length !== 1 ? 's' : ''} válido{pedidosValidos.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pedidos Hoje</div>
          <div className="stat-value" style={{ color: 'var(--texto-escuro)' }}>{pedidosHoje.length}</div>
          <div className="stat-sub normal">Ticket médio R$ {ticketMedio.toFixed(2).replace('.', ',')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Itens Vendidos</div>
          <div className="stat-value" style={{ color: 'var(--texto-escuro)' }}>{totalItensVendidos}</div>
          <div className="stat-sub normal">{maisVendido} lidera</div>
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
            Vendas dos últimos 7 dias
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
          <div className="chart-title">Formas de pagamento (hoje)</div>
          {formasPgto.length > 0 && formasPgto.some(f => f.pct > 0) ? (
            formasPgto.map(f => (
              <div key={f.nome} className="pgto-row">
                <span className="pgto-nome">{f.nome}</span>
                <div className="pgto-bar-bg">
                  <div className="pgto-bar-fill" style={{ width: `${f.pct}%` }} />
                </div>
                <span className="pgto-pct">{f.pct}%</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--texto-claro)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nenhum pedido hoje ainda.</p>
          )}
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
