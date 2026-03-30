import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ItemPedido, FormaPagamento, Produto } from '../types';
import { ShoppingCart, X, ChevronRight, Lock } from 'lucide-react';

type Passo = 'cardapio' | 'pagamento' | 'confirmado' | 'sair';

const categoriasOrdem = ['Lanche', 'Acompanhamento', 'Bebida', 'Combo'];

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

  const produtosAtivos = produtos.filter(p => p.ativo && p.estoqueAtual > 0);
  const categorias = categoriasOrdem.filter(cat => produtosAtivos.some(p => p.categoria === cat));
  const produtosFiltrados = produtosAtivos.filter(p => p.categoria === categoriaSelecionada);

  const total = itens.reduce((s, i) => s + i.subtotal, 0);
  const qtdTotal = itens.reduce((s, i) => s + i.quantidade, 0);

  const adicionarItem = (produto: Produto) => {
    setItens(prev => {
      const existe = prev.find(i => i.produto.id === produto.id);
      if (existe) {
        if (existe.quantidade >= produto.estoqueAtual) return prev;
        return prev.map(i =>
          i.produto.id === produto.id
            ? { ...i, quantidade: i.quantidade + 1, subtotal: (i.quantidade + 1) * produto.preco }
            : i
        );
      }
      return [...prev, { produto, quantidade: 1, subtotal: produto.preco }];
    });
  };

  const removerItem = (produtoId: number) => {
    setItens(prev => {
      const item = prev.find(i => i.produto.id === produtoId);
      if (!item) return prev;
      if (item.quantidade === 1) return prev.filter(i => i.produto.id !== produtoId);
      return prev.map(i =>
        i.produto.id === produtoId
          ? { ...i, quantidade: i.quantidade - 1, subtotal: (i.quantidade - 1) * i.produto.preco }
          : i
      );
    });
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
              const noCarrinho = itens.find(i => i.produto.id === p.id);
              return (
                <div key={p.id} className="quiosque-produto-card">
                  <div className="quiosque-produto-emoji">{p.imagemEmoji || '🍽️'}</div>
                  <div className="quiosque-produto-info">
                    <div className="quiosque-produto-nome">{p.nome}</div>
                    {p.descricao && <div className="quiosque-produto-desc">{p.descricao}</div>}
                    <div className="quiosque-produto-preco">R$ {p.preco.toFixed(2).replace('.', ',')}</div>
                  </div>
                  <div className="quiosque-produto-acao">
                    {noCarrinho ? (
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => removerItem(p.id)}>−</button>
                        <span style={{ fontWeight: 800, fontSize: 18, minWidth: 28, textAlign: 'center' }}>{noCarrinho.quantidade}</span>
                        <button className="qty-btn" style={{ background: 'var(--laranja)', color: 'white', border: 'none' }} onClick={() => adicionarItem(p)}>+</button>
                      </div>
                    ) : (
                      <button className="btn btn-primary" onClick={() => adicionarItem(p)}>
                        + Adicionar
                      </button>
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
                onClick={() => setPasso('pagamento')}
              >
                Ver pedido <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {passo === 'pagamento' && (
        <div className="quiosque-body" style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>
          <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setPasso('cardapio')}>
            ← Voltar ao cardápio
          </button>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="chart-title" style={{ marginBottom: 12 }}>Resumo do pedido</div>
            {itens.map(item => (
              <div key={item.produto.id} className="resumo-item">
                <span className="resumo-item-nome">{item.produto.nome}</span>
                <span style={{ color: 'var(--texto-claro)' }}>x{item.quantidade}</span>
                <span className="td-valor">R$ {item.subtotal.toFixed(2).replace('.', ',')}</span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-claro)', padding: 2 }}
                  onClick={() => {
                    if (item.quantidade === 1 && itens.length === 1) {
                      setItens([]);
                      setPasso('cardapio');
                    } else {
                      removerItem(item.produto.id);
                    }
                  }}
                >
                  <X size={14} />
                </button>
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
