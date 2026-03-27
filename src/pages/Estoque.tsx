import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, RefreshCw, Plus } from 'lucide-react';
import type { Produto } from '../types';

function getStatus(p: Produto) {
  if (p.estoqueAtual === 0) return { label: 'Sem estoque', cls: 'badge badge-vermelho', barCls: 'sem', pct: 0 };
  if (p.estoqueAtual <= p.estoqueMinimo) return { label: 'Baixo', cls: 'badge badge-amarelo', barCls: 'baixo', pct: (p.estoqueAtual / p.estoqueMinimo) * 60 };
  return { label: 'Normal', cls: 'badge badge-verde', barCls: 'normal', pct: Math.min(100, (p.estoqueAtual / (p.estoqueMinimo * 2)) * 100) };
}

export function Estoque() {
  const { produtos, reporEstoque, adicionarProduto } = useApp();
  const [busca, setBusca] = useState('');
  const [modalReporId, setModalReporId] = useState<number | null>(null);
  const [qtdRepor, setQtdRepor] = useState('');
  const [modalNovo, setModalNovo] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaQtd, setNovaQtd] = useState('');
  const [novoMin, setNovoMin] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('Lanche');

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const alertas = produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo).length;
  const normal = produtos.filter(p => p.estoqueAtual > p.estoqueMinimo).length;
  const baixo = produtos.filter(p => p.estoqueAtual > 0 && p.estoqueAtual <= p.estoqueMinimo).length;
  const semEstoque = produtos.filter(p => p.estoqueAtual === 0).length;

  const confirmarRepor = () => {
    if (!modalReporId || !qtdRepor) return;
    reporEstoque(modalReporId, parseInt(qtdRepor));
    setModalReporId(null);
    setQtdRepor('');
  };

  const confirmarNovo = () => {
    if (!novoNome || !novaQtd || !novoMin) return;
    adicionarProduto({
      nome: novoNome,
      categoria: novaCategoria as any,
      preco: 0,
      ativo: true,
      estoqueAtual: parseInt(novaQtd),
      estoqueMinimo: parseInt(novoMin),
    });
    setModalNovo(false);
    setNovoNome(''); setNovaQtd(''); setNovoMin('');
  };

  const produtoRepor = produtos.find(p => p.id === modalReporId);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 className="page-title">Controle de Estoque</h1>
          {alertas > 0 && (
            <span className="badge badge-amarelo">{alertas} alerta{alertas > 1 ? 's' : ''}</span>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => setModalNovo(true)}>
          <Plus size={15} /> Repor estoque
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total de Produtos</div>
          <div className="stat-value" style={{ fontSize: 24, color: 'var(--texto-escuro)' }}>{produtos.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Estoque Normal</div>
          <div className="stat-value" style={{ fontSize: 24, color: 'var(--verde)' }}>{normal}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Estoque Baixo</div>
          <div className="stat-value" style={{ fontSize: 24, color: 'var(--amarelo)' }}>{baixo}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sem Estoque</div>
          <div className="stat-value" style={{ fontSize: 24, color: 'var(--vermelho)' }}>{semEstoque}</div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Produtos em estoque</span>
          <div className="search-input">
            <Search size={14} />
            <input
              placeholder="Buscar produto..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Qtd. Atual</th>
                <th>Mín. Alerta</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => {
                const st = getStatus(p);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.nome}</td>
                    <td>{p.categoria}</td>
                    <td style={{ fontWeight: 700, color: p.estoqueAtual === 0 ? 'var(--vermelho)' : p.estoqueAtual <= p.estoqueMinimo ? 'var(--amarelo)' : 'var(--verde)' }}>
                      {p.estoqueAtual}
                    </td>
                    <td style={{ color: 'var(--texto-claro)' }}>{p.estoqueMinimo}</td>
                    <td>
                      <div className="estoque-status">
                        <span className={st.cls}>{st.label}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setModalReporId(p.id)}
                      >
                        <RefreshCw size={12} /> Repor
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--texto-claro)', padding: 24 }}>Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Repor */}
      {modalReporId && (
        <div className="modal-overlay" onClick={() => setModalReporId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Repor Estoque — {produtoRepor?.nome}</h2>
              <button className="modal-close" onClick={() => setModalReporId(null)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Estoque atual</label>
              <div style={{ padding: '8px 0', fontWeight: 700, fontSize: 16 }}>{produtoRepor?.estoqueAtual} unidades</div>
            </div>
            <div className="form-group">
              <label className="form-label">Quantidade a adicionar</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={qtdRepor}
                onChange={e => setQtdRepor(e.target.value)}
                placeholder="Ex: 20"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalReporId(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmarRepor} disabled={!qtdRepor}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo produto */}
      {modalNovo && (
        <div className="modal-overlay" onClick={() => setModalNovo(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Adicionar Produto ao Estoque</h2>
              <button className="modal-close" onClick={() => setModalNovo(false)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Nome do produto</label>
              <input className="form-control" value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Ex: Pão Brioche" />
            </div>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select className="form-control" value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)}>
                <option>Lanche</option><option>Acompanhamento</option><option>Bebida</option><option>Combo</option><option>Insumo</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Qtd. inicial</label>
                <input type="number" className="form-control" value={novaQtd} onChange={e => setNovaQtd(e.target.value)} placeholder="Ex: 30" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Qtd. mínima</label>
                <input type="number" className="form-control" value={novoMin} onChange={e => setNovoMin(e.target.value)} placeholder="Ex: 10" min="1" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalNovo(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmarNovo} disabled={!novoNome || !novaQtd || !novoMin}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
