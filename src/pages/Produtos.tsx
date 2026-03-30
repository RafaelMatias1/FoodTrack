import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { Produto, Categoria } from '../types';
import { Search, Plus, Pencil, Trash2, Image, X } from 'lucide-react';

type FormState = {
  nome: string;
  categoria: string;
  preco: string;
  estoqueAtual: string;
  estoqueMinimo: string;
  ativo: boolean;
  imagemEmoji: string;
  descricao: string;
  imagemUrl: string;
};

const formVazio: FormState = { nome: '', categoria: 'Lanche', preco: '', estoqueAtual: '', estoqueMinimo: '', ativo: true, imagemEmoji: '', descricao: '', imagemUrl: '' };

export function Produtos() {
  const { produtos, adicionarProduto, editarProduto, excluirProduto } = useApp();
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirNovo = () => {
    setEditandoId(null);
    setForm(formVazio);
    setModal(true);
  };

  const abrirEditar = (p: Produto) => {
    setEditandoId(p.id);
    setForm({
      nome: p.nome,
      categoria: p.categoria,
      preco: p.preco.toString(),
      estoqueAtual: p.estoqueAtual.toString(),
      estoqueMinimo: p.estoqueMinimo.toString(),
      ativo: p.ativo,
      imagemEmoji: p.imagemEmoji || '',
      descricao: p.descricao || '',
      imagemUrl: p.imagemUrl || '',
    });
    setModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Imagem muito grande. Máximo 500KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, imagemUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removerImagem = () => {
    setForm(f => ({ ...f, imagemUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const salvar = () => {
    if (!form.nome || !form.preco) return;
    const dados: Omit<Produto, 'id'> = {
      nome: form.nome,
      categoria: form.categoria as Categoria,
      preco: parseFloat(form.preco),
      estoqueAtual: parseInt(form.estoqueAtual) || 0,
      estoqueMinimo: parseInt(form.estoqueMinimo) || 5,
      ativo: form.ativo,
      imagemEmoji: form.imagemEmoji.trim() || undefined,
      descricao: form.descricao.trim() || undefined,
      imagemUrl: form.imagemUrl || undefined,
    };
    if (editandoId) {
      editarProduto(editandoId, dados);
    } else {
      adicionarProduto(dados);
    }
    setModal(false);
  };

  const confirmarExcluir = () => {
    if (confirmDelete) excluirProduto(confirmDelete);
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Cadastro de Produtos</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>
          <Plus size={15} /> Novo produto
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Produtos cadastrados</span>
          <div className="search-input">
            <Search size={14} />
            <input
              placeholder="Buscar..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Ativo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id}>
                  <td style={{ width: 50 }}>
                    {p.imagemUrl ? (
                      <img src={p.imagemUrl} alt={p.nome} style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 24 }}>{p.imagemEmoji || '🍽️'}</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.nome}</td>
                  <td style={{ color: 'var(--texto-claro)' }}>{p.categoria}</td>
                  <td className="td-valor">R$ {p.preco.toFixed(2).replace('.', ',')}</td>
                  <td style={{ color: p.estoqueAtual === 0 ? 'var(--vermelho)' : p.estoqueAtual <= p.estoqueMinimo ? 'var(--amarelo)' : 'var(--verde)', fontWeight: 700 }}>
                    {p.estoqueAtual}
                  </td>
                  <td>
                    <span className={p.ativo ? 'badge badge-verde' : 'badge badge-vermelho'}>
                      {p.ativo ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => abrirEditar(p)}>
                        <Pencil size={12} /> Editar
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(p.id)}>
                        <Trash2 size={12} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--texto-claro)', padding: 24 }}>Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Editar / Criar */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editandoId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            {/* Imagem do produto */}
            <div className="form-group">
              <label className="form-label">
                <Image size={13} style={{ marginRight: 4 }} />
                Foto do produto
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {form.imagemUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={form.imagemUrl}
                      alt="Preview"
                      style={{ width: 80, height: 80, borderRadius: 'var(--radius)', objectFit: 'cover', border: '2px solid var(--cinza-borda)' }}
                    />
                    <button
                      onClick={removerImagem}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'var(--vermelho)', color: 'white',
                        border: 'none', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: 12,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 80, height: 80, borderRadius: 'var(--radius)',
                      border: '2px dashed var(--cinza-borda)', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--texto-claro)', gap: 4,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <Image size={20} />
                    <span style={{ fontSize: 10 }}>Upload</span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image size={12} /> {form.imagemUrl ? 'Trocar foto' : 'Escolher foto'}
                  </button>
                  <p style={{ fontSize: 11, color: 'var(--texto-claro)', marginTop: 4 }}>JPG, PNG. Máximo 500KB.</p>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-control" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: X-Burguer" autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select className="form-control" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                  <option>Lanche</option>
                  <option>Acompanhamento</option>
                  <option>Bebida</option>
                  <option>Combo</option>
                  <option>Insumo</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preço (R$) *</label>
                <input type="number" step="0.01" min="0" className="form-control" value={form.preco} onChange={e => setForm(f => ({ ...f, preco: e.target.value }))} placeholder="0,00" />
              </div>
              <div className="form-group">
                <label className="form-label">Estoque atual</label>
                <input type="number" min="0" className="form-control" value={form.estoqueAtual} onChange={e => setForm(f => ({ ...f, estoqueAtual: e.target.value }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Estoque mínimo</label>
                <input type="number" min="1" className="form-control" value={form.estoqueMinimo} onChange={e => setForm(f => ({ ...f, estoqueMinimo: e.target.value }))} placeholder="5" />
              </div>
              <div className="form-group">
                <label className="form-label">Emoji (ícone alternativo)</label>
                <input className="form-control" value={form.imagemEmoji} onChange={e => setForm(f => ({ ...f, imagemEmoji: e.target.value }))} placeholder="Ex: 🍔" maxLength={4} style={{ fontSize: 22 }} />
                <p style={{ fontSize: 11, color: 'var(--texto-claro)', marginTop: 2 }}>Usado quando não há foto</p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descrição (opcional)</label>
              <input className="form-control" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Hambúrguer artesanal com queijo e alface" />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>Ativo</label>
              <label className="toggle">
                <input type="checkbox" checked={form.ativo} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 13, color: 'var(--texto-claro)' }}>{form.ativo ? 'Visível no cardápio' : 'Oculto'}</span>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={!form.nome || !form.preco}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Excluir Produto</h2>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <p style={{ color: 'var(--texto-medio)', marginBottom: 4 }}>
              Tem certeza que deseja excluir <strong>{produtos.find(p => p.id === confirmDelete)?.nome}</strong>?
            </p>
            <p style={{ color: 'var(--vermelho)', fontSize: 12 }}>Esta ação não pode ser desfeita.</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmarExcluir}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
