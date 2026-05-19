import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Clock, Utensils, XCircle, History } from 'lucide-react';

type AbaComandas = 'preparo' | 'encerradas';

export function Comandas() {
  const { pedidos, atualizarStatusPedido } = useApp();
  const [aba, setAba] = useState<AbaComandas>('preparo');
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null);

  const emPreparo = pedidos
    .filter(p => p.status === 'Em preparo')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const encerradas = pedidos
    .filter(p => p.status === 'Concluído' || p.status === 'Cancelado')
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const tempoEspera = (data: Date) => {
    const diff = Math.floor((Date.now() - new Date(data).getTime()) / 1000 / 60);
    if (diff < 1) return 'agora';
    return `${diff} min`;
  };

  const cancelarPedido = (id: number) => {
    atualizarStatusPedido(id, 'Cancelado');
    setConfirmCancel(null);
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

      {/* Tabs */}
      <div className="comandas-tabs" style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--creme-escuro)', borderRadius: 'var(--radius)', padding: 4 }}>
        <button
          className={`comandas-tab-btn ${aba === 'preparo' ? 'ativo' : ''}`}
          onClick={() => setAba('preparo')}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            background: aba === 'preparo' ? 'var(--laranja)' : 'transparent',
            color: aba === 'preparo' ? 'white' : 'var(--texto-medio)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
          }}
        >
          <Utensils size={16} />
          Em Preparo ({emPreparo.length})
        </button>
        <button
          className={`comandas-tab-btn ${aba === 'encerradas' ? 'ativo' : ''}`}
          onClick={() => setAba('encerradas')}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
            background: aba === 'encerradas' ? 'var(--marrom-escuro)' : 'transparent',
            color: aba === 'encerradas' ? 'white' : 'var(--texto-medio)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
          }}
        >
          <History size={16} />
          Encerradas ({encerradas.length})
        </button>
      </div>

      {/* Aba Em Preparo */}
      {aba === 'preparo' && (
        <>
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

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => atualizarStatusPedido(pedido.id, 'Concluído')}
                    >
                      <CheckCircle size={15} />
                      Pronto
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ flex: 'none' }}
                      onClick={() => setConfirmCancel(pedido.id)}
                    >
                      <XCircle size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Aba Encerradas */}
      {aba === 'encerradas' && (
        <>
          {encerradas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--texto-claro)' }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>📋</div>
              <p style={{ fontSize: 16, fontWeight: 700 }}>Nenhuma comanda encerrada</p>
              <p style={{ fontSize: 13 }}>As comandas concluídas e canceladas aparecerão aqui.</p>
            </div>
          )}

          <div className="comandas-grid">
            {encerradas.map(pedido => {
              const hora = new Date(pedido.data);
              const cancelado = pedido.status === 'Cancelado';
              return (
                <div key={pedido.id} className={`comanda-card ${cancelado ? 'cancelado' : 'concluido'}`} style={{ opacity: cancelado ? 0.7 : 1 }}>
                  <div className="comanda-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="comanda-numero">{pedido.numero}</span>
                      {pedido.origem === 'WhatsApp' && <span className="origem-whatsapp">WhatsApp</span>}
                      {pedido.origem === 'Quiosque' && <span className="badge badge-azul" style={{ fontSize: 11 }}>Quiosque</span>}
                    </div>
                    <span className={cancelado ? 'badge badge-vermelho' : 'badge badge-verde'}>
                      {cancelado ? 'Cancelado' : 'Concluído'}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--texto-claro)', margin: '4px 0 8px' }}>
                    {hora.toLocaleDateString('pt-BR')} às {hora.getHours().toString().padStart(2, '0')}:{hora.getMinutes().toString().padStart(2, '0')}
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

                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--cinza-borda)', paddingTop: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--texto-claro)' }}>{pedido.formaPagamento}</span>
                    <span style={{ fontWeight: 800, color: cancelado ? 'var(--vermelho)' : 'var(--laranja)' }}>
                      R$ {pedido.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal confirmar cancelamento */}
      {confirmCancel && (
        <div className="modal-overlay" onClick={() => setConfirmCancel(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Cancelar Pedido</h2>
              <button className="modal-close" onClick={() => setConfirmCancel(null)}>×</button>
            </div>
            <p style={{ color: 'var(--texto-medio)', marginBottom: 4 }}>
              Tem certeza que deseja cancelar o pedido <strong>{pedidos.find(p => p.id === confirmCancel)?.numero}</strong>?
            </p>
            <p style={{ color: 'var(--vermelho)', fontSize: 12 }}>Esta ação não pode ser desfeita.</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmCancel(null)}>Voltar</button>
              <button className="btn btn-danger" onClick={() => cancelarPedido(confirmCancel)}>Cancelar Pedido</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
