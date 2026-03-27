import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Pedido } from '../types';

function statusClass(status: string) {
  if (status === 'Concluído') return 'badge badge-verde';
  if (status === 'Cancelado') return 'badge badge-vermelho';
  return 'badge badge-amarelo';
}

function origemBadge(origem: string) {
  return origem === 'WhatsApp'
    ? <span className="origem-whatsapp">WhatsApp</span>
    : <span className="origem-presencial">Presencial</span>;
}

export function Historico() {
  const { pedidos, atualizarStatusPedido } = useApp();
  const [filtroStatus, setFiltroStatus] = useState<string>('Todos');
  const [filtroData, setFiltroData] = useState(() => new Date().toISOString().slice(0, 10));
  const [pedidoDetalhe, setPedidoDetalhe] = useState<Pedido | null>(null);

  const pedidosFiltrados = pedidos
    .filter(p => {
      const data = new Date(p.data);
      const dataFiltro = new Date(filtroData + 'T00:00:00');
      const mesmaData =
        data.getDate() === dataFiltro.getDate() &&
        data.getMonth() === dataFiltro.getMonth() &&
        data.getFullYear() === dataFiltro.getFullYear();
      const statusOk = filtroStatus === 'Todos' || p.status === filtroStatus;
      return mesmaData && statusOk;
    })
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const faturamento = pedidosFiltrados.filter(p => p.status !== 'Cancelado').reduce((s, p) => s + p.total, 0);
  const concluidos = pedidosFiltrados.filter(p => p.status === 'Concluído').length;
  const cancelados = pedidosFiltrados.filter(p => p.status === 'Cancelado').length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Histórico de Pedidos</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto' }}
            value={filtroData}
            onChange={e => setFiltroData(e.target.value)}
          />
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
          >
            <option>Todos</option>
            <option>Concluído</option>
            <option>Em preparo</option>
            <option>Cancelado</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <div className="stat-card destaque">
          <div className="stat-label">Faturamento do Dia</div>
          <div className="stat-value">R$ {faturamento.toLocaleString('pt-BR')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total de Pedidos</div>
          <div className="stat-value" style={{ color: 'var(--texto-escuro)', fontSize: 24 }}>{pedidosFiltrados.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Concluídos</div>
          <div className="stat-value" style={{ color: 'var(--verde)', fontSize: 24 }}>{concluidos}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cancelados</div>
          <div className="stat-value" style={{ color: 'var(--vermelho)', fontSize: 24 }}>{cancelados}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Pedidos de hoje</div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Origem</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Pgto.</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(p => {
                const hora = new Date(p.data);
                return (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setPedidoDetalhe(p)}>
                    <td className="td-numero">{p.numero}</td>
                    <td style={{ color: 'var(--texto-claro)', fontFamily: 'monospace' }}>
                      {hora.getHours().toString().padStart(2,'0')}:{hora.getMinutes().toString().padStart(2,'0')}
                    </td>
                    <td>{p.cliente || '—'}</td>
                    <td onClick={e => e.stopPropagation()}>{origemBadge(p.origem)}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.itens.map(i => `${i.produto.nome}${i.quantidade > 1 ? ` x${i.quantidade}` : ''}`).join(', ')}
                    </td>
                    <td className="td-valor">R$ {p.total.toFixed(2).replace('.', ',')}</td>
                    <td>{p.formaPagamento}</td>
                    <td><span className={statusClass(p.status)}>{p.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      {p.status === 'Em preparo' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => atualizarStatusPedido(p.id, 'Concluído')}
                        >
                          Concluir
                        </button>
                      )}
                      {p.status === 'Em preparo' && (
                        <button
                          className="btn btn-sm btn-danger"
                          style={{ marginLeft: 4 }}
                          onClick={() => atualizarStatusPedido(p.id, 'Cancelado')}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {pedidosFiltrados.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--texto-claro)', padding: 24 }}>Nenhum pedido encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalhe */}
      {pedidoDetalhe && (
        <div className="modal-overlay" onClick={() => setPedidoDetalhe(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Pedido {pedidoDetalhe.numero}</h2>
              <button className="modal-close" onClick={() => setPedidoDetalhe(null)}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div><div className="form-label">Cliente</div><div>{pedidoDetalhe.cliente || '—'}</div></div>
              <div><div className="form-label">Origem</div><div>{origemBadge(pedidoDetalhe.origem)}</div></div>
              <div><div className="form-label">Pagamento</div><div>{pedidoDetalhe.formaPagamento}</div></div>
              <div><div className="form-label">Status</div><div><span className={statusClass(pedidoDetalhe.status)}>{pedidoDetalhe.status}</span></div></div>
            </div>
            <div className="form-label" style={{ marginBottom: 8 }}>Itens</div>
            {pedidoDetalhe.itens.map(i => (
              <div key={i.produto.id}>
                <div className="resumo-item">
                  <span className="resumo-item-nome">{i.produto.nome}</span>
                  <span style={{ color: 'var(--texto-claro)' }}>x{i.quantidade}</span>
                  <span className="td-valor">R$ {i.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {i.observacao && (
                  <div style={{ fontSize: 12, color: 'var(--vermelho)', fontWeight: 600, paddingLeft: 8, marginBottom: 4 }}>
                    ⚠️ {i.observacao}
                  </div>
                )}
              </div>
            ))}
            <div className="resumo-total">
              <span>Total</span>
              <span style={{ color: 'var(--laranja)' }}>R$ {pedidoDetalhe.total.toFixed(2).replace('.', ',')}</span>
            </div>
            {pedidoDetalhe.observacoes && (
              <div style={{ marginTop: 12, padding: '8px 10px', background: 'var(--creme)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                <b>Obs:</b> {pedidoDetalhe.observacoes}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
