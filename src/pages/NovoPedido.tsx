import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ItemPedido, FormaPagamento, OrigemPedido, Produto } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export function NovoPedido() {
  const { produtos, criarPedido, pedidos } = useApp();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState('');
  const [origem, setOrigem] = useState<OrigemPedido>('Presencial');
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('Pix');
  const [observacoes, setObservacoes] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const proximoNumero = Math.max(0, ...pedidos.map(p => p.id)) + 1;
  const produtosAtivos = produtos.filter(p => p.ativo);

  const adicionarItem = (produto: Produto) => {
    if (produto.estoqueAtual <= 0) return;
    setItens(prev => {
      const existe = prev.find(i => i.produto.id === produto.id);
      if (existe) {
        return prev.map(i =>
          i.produto.id === produto.id
            ? { ...i, quantidade: i.quantidade + 1, subtotal: (i.quantidade + 1) * produto.preco }
            : i
        );
      }
      return [...prev, { produto, quantidade: 1, subtotal: produto.preco }];
    });
  };

  const alterarQtd = (produtoId: number, delta: number) => {
    setItens(prev => {
      return prev
        .map(i => {
          if (i.produto.id !== produtoId) return i;
          const novaQtd = i.quantidade + delta;
          if (novaQtd <= 0) return null;
          return { ...i, quantidade: novaQtd, subtotal: novaQtd * i.produto.preco };
        })
        .filter(Boolean) as ItemPedido[];
    });
  };

  const total = itens.reduce((sum, i) => sum + i.subtotal, 0);

  const confirmar = () => {
    if (itens.length === 0) return;
    criarPedido({ cliente: cliente.trim() || undefined, origem, itens, formaPagamento, observacoes: observacoes.trim() || undefined });
    setSucesso(true);
    setTimeout(() => navigate('/historico'), 1800);
  };

  const cancelar = () => navigate('/');

  const formas: FormaPagamento[] = ['Pix', 'Crédito', 'Débito', 'Dinheiro'];

  if (sucesso) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
        <div style={{ fontSize: 60 }}>✅</div>
        <h2 style={{ color: 'var(--verde)', fontSize: 22 }}>Pedido confirmado!</h2>
        <p style={{ color: 'var(--texto-claro)' }}>Redirecionando para o histórico...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Registrar novo pedido</h1>
        <span className="badge badge-laranja">Pedido #{String(proximoNumero).padStart(3, '0')}</span>
      </div>

      <div className="novo-pedido-layout">
        {/* Esquerda */}
        <div>
          {/* Cliente e Origem */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
              <input
                className="form-control"
                placeholder="Nome do cliente (opcional)"
                value={cliente}
                onChange={e => setCliente(e.target.value)}
              />
              <select
                className="form-control"
                value={origem}
                onChange={e => setOrigem(e.target.value as OrigemPedido)}
                style={{ width: 'auto' }}
              >
                <option>Presencial</option>
                <option>WhatsApp</option>
              </select>
            </div>
          </div>

          {/* Produtos */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="form-label" style={{ marginBottom: 12 }}>Escolha os produtos</div>
            <div className="produtos-grid">
              {produtosAtivos.map(p => {
                const noCarrinho = itens.find(i => i.produto.id === p.id);
                return (
                  <div
                    key={p.id}
                    className={`produto-card ${noCarrinho ? 'selecionado' : ''} ${p.estoqueAtual <= 0 ? 'sem-estoque' : ''}`}
                    onClick={() => adicionarItem(p)}
                  >
                    <div className="produto-card-nome">{p.nome}</div>
                    <div className="produto-card-preco">R$ {p.preco.toFixed(2).replace('.', ',')}</div>
                    <div className="produto-card-estoque">Estoque: {p.estoqueAtual}</div>
                  </div>
                );
              })}
              <div className="produto-card" style={{ border: '2px dashed var(--cinza-borda)', color: 'var(--texto-claro)', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                onClick={() => navigate('/produtos')}>
                <Plus size={22} color="var(--laranja)" />
                <span style={{ fontSize: 12 }}>Novo produto</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="card">
            <textarea
              className="form-control"
              placeholder="Observações (sem cebola, ponto da carne...)"
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        {/* Direita: Resumo */}
        <div className="resumo-pedido">
          <div className="chart-title" style={{ marginBottom: 12 }}>Resumo do pedido</div>

          {itens.length === 0 && (
            <p style={{ color: 'var(--texto-claro)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
              Selecione produtos ao lado
            </p>
          )}

          {itens.map(item => (
            <div key={item.produto.id} className="resumo-item">
              <span className="resumo-item-nome">{item.produto.nome}</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => alterarQtd(item.produto.id, -1)}>−</button>
                <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantidade}</span>
                <button className="qty-btn" onClick={() => alterarQtd(item.produto.id, 1)}>+</button>
              </div>
              <span style={{ color: 'var(--laranja)', fontWeight: 700, minWidth: 55, textAlign: 'right' }}>
                R$ {item.subtotal.toFixed(2).replace('.', ',')}
              </span>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-claro)', padding: 2 }}
                onClick={() => setItens(prev => prev.filter(i => i.produto.id !== item.produto.id))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {itens.length > 0 && (
            <div className="resumo-total">
              <span>Total</span>
              <span style={{ color: 'var(--laranja)' }}>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          )}

          <div className="form-label" style={{ marginTop: 12, marginBottom: 8 }}>Pagamento</div>
          <div className="formas-pagamento">
            {formas.map(f => (
              <button
                key={f}
                className={`forma-btn ${formaPagamento === f ? 'ativo' : ''}`}
                onClick={() => setFormaPagamento(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary btn-block btn-lg"
            style={{ marginBottom: 8 }}
            onClick={confirmar}
            disabled={itens.length === 0}
          >
            Confirmar Pedido
          </button>
          <button className="btn btn-ghost btn-block" onClick={cancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}
