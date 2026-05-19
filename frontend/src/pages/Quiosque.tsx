import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ItemPedido, FormaPagamento, Produto } from '../types';
import { ShoppingCart, X, ChevronRight, Lock, ChevronLeft, MessageSquare } from 'lucide-react';

type Passo = 'cardapio' | 'personalizar' | 'carrinho' | 'pagamento' | 'confirmado';

const categoriasOrdem = ['Lanche', 'Acompanhamento', 'Bebida', 'Combo'];

const personalizacoesComuns: Record<string, { remover: string[]; adicionar: string[] }> = {
  Lanche: {
    remover: ['Sem cebola', 'Sem tomate', 'Sem alface', 'Sem maionese', 'Sem ketchup', 'Sem mostarda', 'Sem picles'],
    adicionar: ['Bacon extra', 'Queijo extra', 'Ovo', 'Cheddar', 'Catupiry'],
  },
  Combo: {
    remover: ['Sem cebola', 'Sem tomate', 'Sem alface', 'Sem maionese'],
    adicionar: ['Bacon extra', 'Queijo extra', 'Cheddar', 'Catupiry'],
  },
  Acompanhamento: {
    remover: ['Sem sal'],
    adicionar: ['Cheddar', 'Bacon', 'Catupiry'],
  },
  Bebida: {
    remover: ['Sem gelo', 'Sem açúcar'],
    adicionar: ['Gelo extra', 'Limão'],
  },
};

export function Quiosque() {
  const { produtos, criarPedido, configuracoes } = useApp();
  const navigate = useNavigate();
  const [passo, setPasso] = useState<Passo>('cardapio');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Lanche');
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('Pix');
  const [nomeCliente, setNomeCliente] = useState('');
  const [pedidoConfirmado, setPedidoConfirmado] = useState<string>('');
  const [mostrarSair, setMostrarSair] = useState(false);
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [erroCodigo, setErroCodigo] = useState(false);

  // Personalização
  const [produtoPersonalizando, setProdutoPersonalizando] = useState<number | null>(null);
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>([]);
  const [obsTexto, setObsTexto] = useState('');

  const produtosAtivos = produtos.filter(p => p.ativo && p.estoqueAtual > 0);
  const categorias = categoriasOrdem.filter(cat => produtosAtivos.some(p => p.categoria === cat));
  const produtosFiltrados = produtosAtivos.filter(p => p.categoria === categoriaSelecionada);

  const total = itens.reduce((s, i) => s + i.subtotal, 0);
  const qtdTotal = itens.reduce((s, i) => s + i.quantidade, 0);

  const adicionarItem = (produto: Produto) => {
    // Abre tela de personalização
    setProdutoPersonalizando(produto.id);
    setTagsSelecionadas([]);
    setObsTexto('');
    setPasso('personalizar');
  };

  const confirmarPersonalizacao = () => {
    const produto = produtosAtivos.find(p => p.id === produtoPersonalizando);
    if (!produto) return;

    const observacaoFinal = [...tagsSelecionadas, obsTexto.trim()].filter(Boolean).join(', ');

    setItens(prev => {
      // Se já existe sem observação e a nova também é sem observação, incrementa
      const existe = prev.find(i => i.produto.id === produto.id && !i.observacao && !observacaoFinal);
      if (existe) {
        if (existe.quantidade >= produto.estoqueAtual) return prev;
        return prev.map(i =>
          i.produto.id === produto.id && !i.observacao
            ? { ...i, quantidade: i.quantidade + 1, subtotal: (i.quantidade + 1) * produto.preco }
            : i
        );
      }
      // Se tem observação, adiciona como item separado
      return [...prev, { produto, quantidade: 1, subtotal: produto.preco, observacao: observacaoFinal || undefined }];
    });

    setProdutoPersonalizando(null);
    setPasso('cardapio');
  };

  const adicionarRapido = (produto: Produto) => {
    setItens(prev => {
      const existe = prev.find(i => i.produto.id === produto.id && !i.observacao);
      if (existe) {
        if (existe.quantidade >= produto.estoqueAtual) return prev;
        return prev.map(i =>
          i.produto.id === produto.id && !i.observacao
            ? { ...i, quantidade: i.quantidade + 1, subtotal: (i.quantidade + 1) * produto.preco }
            : i
        );
      }
      return [...prev, { produto, quantidade: 1, subtotal: produto.preco }];
    });
  };

  const removerItem = (idx: number) => {
    setItens(prev => {
      const item = prev[idx];
      if (!item) return prev;
      if (item.quantidade === 1) return prev.filter((_, i) => i !== idx);
      return prev.map((it, i) =>
        i === idx
          ? { ...it, quantidade: it.quantidade - 1, subtotal: (it.quantidade - 1) * it.produto.preco }
          : it
      );
    });
  };

  const adicionarItemIdx = (idx: number) => {
    setItens(prev => {
      const item = prev[idx];
      if (!item || item.quantidade >= item.produto.estoqueAtual) return prev;
      return prev.map((it, i) =>
        i === idx
          ? { ...it, quantidade: it.quantidade + 1, subtotal: (it.quantidade + 1) * it.produto.preco }
          : it
      );
    });
  };

  const excluirItem = (idx: number) => {
    setItens(prev => prev.filter((_, i) => i !== idx));
  };

  const confirmarPedido = () => {
    const pedido = criarPedido({
      cliente: nomeCliente.trim() || undefined,
      origem: 'Quiosque',
      itens,
      formaPagamento,
    });
    setPedidoConfirmado(pedido.numero);
    setPasso('confirmado');
  };

  const reiniciar = () => {
    setItens([]);
    setNomeCliente('');
    setPasso('cardapio');
    setCategoriaSelecionada('Lanche');
  };

  const tentarSair = () => {
    setMostrarSair(true);
    setCodigoDigitado('');
    setErroCodigo(false);
  };

  const confirmarSaida = () => {
    if (codigoDigitado === configuracoes.codigoQuiosque) {
      navigate('/');
    } else {
      setErroCodigo(true);
    }
  };

  const toggleTag = (tag: string) => {
    setTagsSelecionadas(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Tela de confirmação
  if (passo === 'confirmado') {
    return (
      <div className="quiosque-confirmado">
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 32, color: 'var(--verde)', marginBottom: 8 }}>Pedido realizado!</h1>
        <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--laranja)', margin: '16px 0' }}>
          {pedidoConfirmado}
        </div>
        <p style={{ fontSize: 18, color: 'var(--texto-medio)', marginBottom: 8 }}>
          Aguarde ser chamado quando seu pedido ficar pronto.
        </p>
        <p style={{ fontSize: 14, color: 'var(--texto-claro)', marginBottom: 32 }}>
          Pagamento: <strong>{formaPagamento}</strong> · Total: <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
        </p>
        <button className="btn btn-primary btn-lg" onClick={reiniciar}>
          Fazer outro pedido
        </button>
      </div>
    );
  }

  return (
    <div className="quiosque-wrapper">
      {/* Header do Quiosque */}
      <div className="quiosque-header">
        <div className="quiosque-brand">
          <span style={{ fontSize: 28 }}>🍔</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, color: 'white' }}>{configuracoes.nomeFoodTruck}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Faça seu pedido</div>
          </div>
        </div>
        <button className="quiosque-sair-btn" onClick={tentarSair}>
          <Lock size={14} />
          Sair
        </button>
      </div>

      {/* CARDÁPIO */}
      {passo === 'cardapio' && (
        <div className="quiosque-body">
          {/* Categorias */}
          <div className="quiosque-categorias">
            {categorias.map(cat => (
              <button
                key={cat}
                className={`quiosque-cat-btn ${categoriaSelecionada === cat ? 'ativo' : ''}`}
                onClick={() => setCategoriaSelecionada(cat)}
              >
                {cat === 'Lanche' && '🍔'}
                {cat === 'Acompanhamento' && '🍟'}
                {cat === 'Bebida' && '🥤'}
                {cat === 'Combo' && '🎁'}
                {' '}{cat}
              </button>
            ))}
          </div>

          {/* Produtos */}
          <div className="quiosque-produtos">
            {produtosFiltrados.map(p => {
              const qtdNoCarrinho = itens.filter(i => i.produto.id === p.id).reduce((s, i) => s + i.quantidade, 0);
              return (
                <div key={p.id} className="quiosque-produto-card">
                  {p.imagemUrl ? (
                    <div className="quiosque-produto-img" style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={p.imagemUrl} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div className="quiosque-produto-emoji">{p.imagemEmoji || '🍽️'}</div>
                  )}
                  <div className="quiosque-produto-info">
                    <div className="quiosque-produto-nome">{p.nome}</div>
                    {p.descricao && <div className="quiosque-produto-desc">{p.descricao}</div>}
                    <div className="quiosque-produto-preco">R$ {p.preco.toFixed(2).replace('.', ',')}</div>
                  </div>
                  <div className="quiosque-produto-acao">
                    {qtdNoCarrinho > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div className="qty-control">
                          <button className="qty-btn" onClick={() => {
                            // Remove last item of this product
                            const lastIdx = itens.map((it, i) => it.produto.id === p.id ? i : -1).filter(i => i >= 0).pop();
                            if (lastIdx !== undefined) removerItem(lastIdx);
                          }}>−</button>
                          <span style={{ fontWeight: 800, fontSize: 18, minWidth: 28, textAlign: 'center' }}>{qtdNoCarrinho}</span>
                          <button className="qty-btn" style={{ background: 'var(--laranja)', color: 'white', border: 'none' }} onClick={() => adicionarRapido(p)}>+</button>
                        </div>
                        <button
                          onClick={() => adicionarItem(p)}
                          style={{ background: 'none', border: 'none', color: 'var(--laranja)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <MessageSquare size={12} /> Personalizar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                        <button className="btn btn-primary" onClick={() => adicionarRapido(p)}>
                          + Adicionar
                        </button>
                        <button
                          onClick={() => adicionarItem(p)}
                          style={{ background: 'none', border: 'none', color: 'var(--texto-claro)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <MessageSquare size={11} /> Personalizar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carrinho flutuante */}
          {qtdTotal > 0 && (
            <div className="quiosque-carrinho-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingCart size={20} />
                <span>{qtdTotal} {qtdTotal === 1 ? 'item' : 'itens'}</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 18 }}>R$ {total.toFixed(2).replace('.', ',')}</span>
              <button
                className="btn"
                style={{ background: 'white', color: 'var(--laranja)', fontWeight: 800 }}
                onClick={() => setPasso('carrinho')}
              >
                Ver pedido <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* PERSONALIZAR ITEM */}
      {passo === 'personalizar' && produtoPersonalizando && (() => {
        const produto = produtosAtivos.find(p => p.id === produtoPersonalizando);
        if (!produto) return null;
        const pers = personalizacoesComuns[produto.categoria] || { remover: [], adicionar: [] };
        return (
          <div className="quiosque-body" style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
            <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => { setProdutoPersonalizando(null); setPasso('cardapio'); }}>
              <ChevronLeft size={16} /> Voltar ao cardápio
            </button>

            <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: '20px' }}>
              {produto.imagemUrl ? (
                <img src={produto.imagemUrl} alt={produto.nome} style={{ width: 80, height: 80, borderRadius: 'var(--radius)', objectFit: 'cover', marginBottom: 8 }} />
              ) : (
                <div style={{ fontSize: 48, marginBottom: 8 }}>{produto.imagemEmoji || '🍽️'}</div>
              )}
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>{produto.nome}</h2>
              <p style={{ color: 'var(--laranja)', fontWeight: 700, fontSize: 18 }}>R$ {produto.preco.toFixed(2).replace('.', ',')}</p>
            </div>

            {pers.remover.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="chart-title" style={{ marginBottom: 12, color: 'var(--vermelho)' }}>🚫 Remover ingrediente</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {pers.remover.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 20,
                        border: `2px solid ${tagsSelecionadas.includes(tag) ? 'var(--vermelho)' : 'var(--cinza-borda)'}`,
                        background: tagsSelecionadas.includes(tag) ? 'var(--vermelho-claro)' : 'white',
                        color: tagsSelecionadas.includes(tag) ? 'var(--vermelho)' : 'var(--texto-medio)',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {tagsSelecionadas.includes(tag) ? '✕ ' : ''}{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pers.adicionar.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="chart-title" style={{ marginBottom: 12, color: 'var(--verde)' }}>➕ Adicionar</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {pers.adicionar.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 20,
                        border: `2px solid ${tagsSelecionadas.includes(tag) ? 'var(--verde)' : 'var(--cinza-borda)'}`,
                        background: tagsSelecionadas.includes(tag) ? 'var(--verde-claro)' : 'white',
                        color: tagsSelecionadas.includes(tag) ? '#1a8a4a' : 'var(--texto-medio)',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {tagsSelecionadas.includes(tag) ? '✓ ' : ''}{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="chart-title" style={{ marginBottom: 8 }}>📝 Observação adicional</div>
              <input
                className="form-control"
                value={obsTexto}
                onChange={e => setObsTexto(e.target.value)}
                placeholder="Ex: bem passado, ponto da carne..."
                style={{ fontSize: 15 }}
              />
            </div>

            {(tagsSelecionadas.length > 0 || obsTexto.trim()) && (
              <div className="card" style={{ marginBottom: 16, background: 'var(--amarelo-claro)', border: '1px solid var(--amarelo)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Resumo da personalização:</div>
                <p style={{ fontSize: 13, color: 'var(--texto-medio)' }}>
                  {[...tagsSelecionadas, obsTexto.trim()].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={confirmarPersonalizacao}
            >
              Adicionar ao pedido
            </button>
          </div>
        );
      })()}

      {/* CARRINHO / RESUMO */}
      {passo === 'carrinho' && (
        <div className="quiosque-body" style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
          <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setPasso('cardapio')}>
            <ChevronLeft size={16} /> Adicionar mais itens
          </button>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="chart-title" style={{ marginBottom: 12 }}>Seu pedido</div>
            {itens.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: idx < itens.length - 1 ? '1px solid var(--cinza-borda)' : 'none' }}>
                <div className="resumo-item">
                  <span className="resumo-item-nome">
                    {item.produto.imagemEmoji && <span style={{ marginRight: 6 }}>{item.produto.imagemEmoji}</span>}
                    {item.produto.nome}
                  </span>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => removerItem(idx)}>−</button>
                    <span style={{ fontWeight: 800, fontSize: 16, minWidth: 28, textAlign: 'center' }}>{item.quantidade}</span>
                    <button className="qty-btn" style={{ background: 'var(--laranja)', color: 'white', border: 'none' }} onClick={() => adicionarItemIdx(idx)}>+</button>
                  </div>
                  <span className="td-valor">R$ {item.subtotal.toFixed(2).replace('.', ',')}</span>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-claro)', padding: 2 }}
                    onClick={() => excluirItem(idx)}
                  >
                    <X size={14} />
                  </button>
                </div>
                {item.observacao && (
                  <div style={{ fontSize: 12, color: 'var(--laranja)', fontWeight: 600, paddingLeft: 4, marginTop: 4 }}>
                    ⚠️ {item.observacao}
                  </div>
                )}
              </div>
            ))}
            {itens.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--texto-claro)', padding: 16 }}>Carrinho vazio</p>
            )}
            {itens.length > 0 && (
              <div className="resumo-total">
                <span>Total</span>
                <span style={{ color: 'var(--laranja)' }}>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
          </div>

          {itens.length > 0 && (
            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={() => setPasso('pagamento')}
            >
              Finalizar pedido <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* PAGAMENTO */}
      {passo === 'pagamento' && (
        <div className="quiosque-body" style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>
          <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setPasso('carrinho')}>
            <ChevronLeft size={16} /> Voltar ao carrinho
          </button>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="chart-title" style={{ marginBottom: 12 }}>Resumo do pedido</div>
            {itens.map((item, idx) => (
              <div key={idx}>
                <div className="resumo-item">
                  <span className="resumo-item-nome">{item.produto.nome}</span>
                  <span style={{ color: 'var(--texto-claro)' }}>x{item.quantidade}</span>
                  <span className="td-valor">R$ {item.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {item.observacao && (
                  <div style={{ fontSize: 11, color: 'var(--laranja)', fontWeight: 600, paddingLeft: 4, marginBottom: 4 }}>
                    ⚠️ {item.observacao}
                  </div>
                )}
              </div>
            ))}
            <div className="resumo-total">
              <span>Total</span>
              <span style={{ color: 'var(--laranja)' }}>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Seu nome (opcional)</label>
              <input
                className="form-control"
                value={nomeCliente}
                onChange={e => setNomeCliente(e.target.value)}
                placeholder="Para chamar quando ficar pronto"
                style={{ fontSize: 16 }}
              />
            </div>
          </div>

          <div className="card">
            <div className="chart-title" style={{ marginBottom: 12 }}>Forma de pagamento</div>
            <div className="formas-pagamento" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {(['Pix', 'Crédito', 'Débito', 'Dinheiro'] as FormaPagamento[]).map(f => (
                <button
                  key={f}
                  className={`forma-btn ${formaPagamento === f ? 'ativo' : ''}`}
                  style={{ padding: '14px', fontSize: 15 }}
                  onClick={() => setFormaPagamento(f)}
                >
                  {f === 'Pix' && '⚡ '}
                  {f === 'Crédito' && '💳 '}
                  {f === 'Débito' && '💳 '}
                  {f === 'Dinheiro' && '💵 '}
                  {f}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: 16 }}
              onClick={confirmarPedido}
            >
              Confirmar pedido · R$ {total.toFixed(2).replace('.', ',')}
            </button>
          </div>
        </div>
      )}

      {/* Modal de saída com código */}
      {mostrarSair && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 340, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
            <h2 className="modal-title" style={{ marginBottom: 8 }}>Sair do Quiosque</h2>
            <p style={{ color: 'var(--texto-claro)', fontSize: 13, marginBottom: 16 }}>
              Digite o código do operador para sair desta tela.
            </p>
            <input
              className={`form-control ${erroCodigo ? 'input-erro' : ''}`}
              type="password"
              value={codigoDigitado}
              onChange={e => { setCodigoDigitado(e.target.value); setErroCodigo(false); }}
              onKeyDown={e => e.key === 'Enter' && confirmarSaida()}
              placeholder="Código"
              maxLength={6}
              autoFocus
              style={{ textAlign: 'center', fontSize: 20, letterSpacing: 6 }}
            />
            {erroCodigo && <p className="input-erro-msg" style={{ marginTop: 6 }}>Código incorreto.</p>}
            <div className="modal-footer" style={{ justifyContent: 'center', marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setMostrarSair(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmarSaida} disabled={!codigoDigitado}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
