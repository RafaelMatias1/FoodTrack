import { useApp } from '../context/AppContext';
import { CheckCircle, Clock, Utensils } from 'lucide-react';

export function Comandas() {
  const { pedidos, atualizarStatusPedido } = useApp();

  const emPreparo = pedidos
    .filter(p => p.status === 'Em preparo')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const recemConcluidos = pedidos
    .filter(p => {
      if (p.status !== 'Concluído') return false;
      const diff = Date.now() - new Date(p.data).getTime();
      return diff < 30 * 60 * 1000; // últimos 30 min
    })
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  const tempoEspera = (data: Date) => {
    const diff = Math.floor((Date.now() - new Date(data).getTime()) / 1000 / 60);
    if (diff < 1) return 'agora';
    return `${diff} min`;
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 className="page-title">Comandas — Cozinha</h1>
          {emPreparo.length > 0 && (
            <span className="badge badge-amarelo" style={{ fontSize: 13, padding: '4px 10px' }}>
              {emPreparo.length} em preparo
            </span>
          )}
        </div>
        <span className="badge badge-cinza">
          {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {emPreparo.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--texto-claro)' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
          <p style={{ fontSize: 16, fontWeight: 700 }}>Nenhum pedido em preparo</p>
          <p style={{ fontSize: 13 }}>Todos os pedidos foram entregues!</p>
        </div>
      )}

      <div className="comandas-grid">
        {emPreparo.map(pedido => {
          const minutos = Math.floor((Date.now() - new Date(pedido.data).getTime()) / 1000 / 60);
          const urgente = minutos >= 15;

          return (
            <div key={pedido.id} className={`comanda-card ${urgente ? 'urgente' : ''}`}>
              <div className="comanda-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="comanda-numero">{pedido.numero}</span>
                  {pedido.origem === 'WhatsApp' && <span className="origem-whatsapp">WhatsApp</span>}
                  {pedido.origem === 'Quiosque' && <span className="badge badge-azul" style={{ fontSize: 11 }}>Quiosque</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: urgente ? 'var(--vermelho)' : 'var(--texto-claro)', fontSize: 12 }}>
                  <Clock size={12} />
                  {tempoEspera(pedido.data)}
                </div>
              </div>

              {pedido.cliente && (
                <div className="comanda-cliente">
                  👤 {pedido.cliente}
                </div>
              )}

              <div className="comanda-itens">
                {pedido.itens.map((item, idx) => (
                  <div key={idx} className="comanda-item">
                    <div className="comanda-item-principal">
                      <span className="comanda-qty">{item.quantidade}×</span>
                      <span className="comanda-nome">{item.produto.nome}</span>
                    </div>
                    {item.observacao && (
                      <div className="comanda-obs">
                        ⚠️ {item.observacao}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {pedido.observacoes && (
                <div className="comanda-obs-geral">
                  📝 {pedido.observacoes}
                </div>
              )}

              <button
                className="btn btn-primary btn-block"
                style={{ marginTop: 12 }}
                onClick={() => atualizarStatusPedido(pedido.id, 'Concluído')}
              >
                <CheckCircle size={15} />
                Marcar como pronto
              </button>
            </div>
          );
        })}
      </div>

      {/* Recém concluídos */}
      {recemConcluidos.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--texto-claro)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Utensils size={14} />
            Recém concluídos (últimos 30 min)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {recemConcluidos.map(p => (
              <div key={p.id} className="comanda-concluido">
                <span style={{ fontWeight: 700, color: 'var(--verde)' }}>{p.numero}</span>
                <span style={{ fontSize: 12, color: 'var(--texto-claro)' }}>{p.cliente || '—'}</span>
                <span className="badge badge-verde">✓ Pronto</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
