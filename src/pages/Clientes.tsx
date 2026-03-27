import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Cliente } from '../types';
import { Search, UserPlus } from 'lucide-react';

function getIniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function tipoBadge(tipo: Cliente['tipo']) {
  const map: Record<Cliente['tipo'], string> = {
    frequente: 'badge badge-laranja',
    recorrente: 'badge badge-azul',
    familiar: 'badge badge-verde',
    WhatsApp: 'badge badge-verde',
    novo: 'badge badge-cinza',
  };
  return <span className={map[tipo]}>{tipo}</span>;
}

export function Clientes() {
  const { clientes, adicionarCliente } = useApp();
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [tipo, setTipo] = useState<Cliente['tipo']>('novo');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.contato && c.contato.includes(busca))
  );

  const confirmar = () => {
    if (!nome.trim()) return;
    adicionarCliente({ nome: nome.trim(), contato: contato.trim() || undefined, tipo, preferencia: undefined });
    setModal(false);
    setNome(''); setContato('');
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-input">
            <Search size={14} />
            <input
              placeholder="Buscar cliente..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <UserPlus size={15} /> Novo cliente
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Pedidos</th>
                <th>Total Gasto</th>
                <th>Último Pedido</th>
                <th>Preferência</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setClienteSelecionado(c)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{getIniciais(c.nome)}</div>
                      <span style={{ fontWeight: 600 }}>{c.nome}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--texto-claro)' }}>{c.contato || '—'}</td>
                  <td style={{ fontWeight: 700 }}>{c.totalPedidos}</td>
                  <td className="td-valor">R$ {c.totalGasto.toFixed(2).replace('.', ',')}</td>
                  <td style={{ color: 'var(--texto-claro)' }}>
                    {c.ultimoPedido
                      ? (() => {
                          const hoje = new Date();
                          const d = new Date(c.ultimoPedido);
                          return d.toDateString() === hoje.toDateString()
                            ? 'hoje'
                            : d.toLocaleDateString('pt-BR');
                        })()
                      : '—'}
                  </td>
                  <td>
                    {c.preferencia
                      ? <span className="badge badge-laranja">{c.preferencia}</span>
                      : <span style={{ color: 'var(--texto-claro)' }}>—</span>
                    }
                  </td>
                  <td>{tipoBadge(c.tipo)}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--texto-claro)', padding: 24 }}>Nenhum cliente encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo cliente */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Cliente</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Contato (WhatsApp / telefone)</label>
              <input className="form-control" value={contato} onChange={e => setContato(e.target.value)} placeholder="(47) 99999-9999" />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-control" value={tipo} onChange={e => setTipo(e.target.value as Cliente['tipo'])}>
                <option value="novo">Novo</option>
                <option value="recorrente">Recorrente</option>
                <option value="frequente">Frequente</option>
                <option value="familiar">Familiar</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmar} disabled={!nome.trim()}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhe cliente */}
      {clienteSelecionado && (
        <div className="modal-overlay" onClick={() => setClienteSelecionado(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ width: 48, height: 48, fontSize: 16 }}>{getIniciais(clienteSelecionado.nome)}</div>
                <div>
                  <div className="modal-title">{clienteSelecionado.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--texto-claro)' }}>{clienteSelecionado.contato || 'Sem contato'}</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setClienteSelecionado(null)}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="stat-card">
                <div className="stat-label">Total de Pedidos</div>
                <div className="stat-value" style={{ fontSize: 22, color: 'var(--texto-escuro)' }}>{clienteSelecionado.totalPedidos}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Gasto</div>
                <div className="stat-value" style={{ fontSize: 22 }}>R$ {clienteSelecionado.totalGasto.toFixed(2).replace('.', ',')}</div>
              </div>
            </div>
            {clienteSelecionado.preferencia && (
              <div style={{ marginTop: 14 }}>
                <div className="form-label">Produto favorito</div>
                <span className="badge badge-laranja">{clienteSelecionado.preferencia}</span>
              </div>
            )}
            <div style={{ marginTop: 14 }}>
              <div className="form-label">Classificação</div>
              {tipoBadge(clienteSelecionado.tipo)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
