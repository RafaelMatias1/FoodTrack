import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Produto, Pedido, Cliente, ItemPedido, FormaPagamento, OrigemPedido, Configuracoes } from '../types';
import { api } from '../services/api';

// ─── Tipos da API ────────────────────────────────────────────────────────────

interface UsuarioAPI {
  id: number;
  email: string;
  nomeFoodTruck: string;
  nomeProprietario: string;
  cidade: string;
  codigoQuiosque: string;
  corPrimaria: string;
}

interface ProdutoAPI {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  ativo: boolean;
  estoqueAtual: number;
  estoqueMinimo: number;
  descricao?: string;
  imagemEmoji?: string;
  imagemUrl?: string;
  personalizacoes?: { label: string; tipo: 'remover' | 'adicionar' | 'outro' }[];
}

interface ClienteAPI {
  id: number;
  nome: string;
  contato?: string;
  totalPedidos: number;
  totalGasto: number;
  ultimoPedido?: string;
  preferencia?: string;
  tipo: string;
}

interface ItemPedidoAPI {
  id: number;
  produtoId: number;
  produto: ProdutoAPI;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
  observacao?: string;
}

interface PedidoAPI {
  id: number;
  numero: string;
  clienteNome?: string;
  origem: string;
  total: number;
  formaPagamento: string;
  status: string;
  observacoes?: string;
  data: string;
  itens: ItemPedidoAPI[];
}

// ─── Context Type ─────────────────────────────────────────────────────────────

interface AppContextType {
  produtos: Produto[];
  pedidos: Pedido[];
  clientes: Cliente[];
  configuracoes: Configuracoes;
  logado: boolean;
  carregando: boolean;
  inicializando: boolean;
  login: (email: string, senha: string) => Promise<string | null>;
  logout: () => void;
  cadastrar: (dados: { nomeFoodTruck: string; nomeProprietario: string; cidade: string; email: string; senha: string }) => Promise<string | null>;
  adicionarProduto: (produto: Omit<Produto, 'id'>) => Promise<void>;
  editarProduto: (id: number, produto: Partial<Produto>) => Promise<void>;
  excluirProduto: (id: number) => Promise<void>;
  reporEstoque: (id: number, quantidade: number) => Promise<void>;
  criarPedido: (dados: {
    cliente?: string;
    origem: OrigemPedido;
    itens: ItemPedido[];
    formaPagamento: FormaPagamento;
    observacoes?: string;
  }) => Promise<Pedido>;
  atualizarStatusPedido: (id: number, status: Pedido['status']) => Promise<void>;
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'totalPedidos' | 'totalGasto'>) => Promise<void>;
  salvarConfiguracoes: (cfg: Partial<Configuracoes>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// ─── Helpers de conversão API → Frontend ─────────────────────────────────────

const configPadrao: Configuracoes = {
  nomeFoodTruck: 'FoodTruck',
  nomeProprietario: '',
  cidade: '',
  email: '',
  senha: '',
  codigoQuiosque: '0000',
  corPrimaria: '#e07b20',
};

function cfgFromUsuario(u: UsuarioAPI, email: string): Configuracoes {
  return { nomeFoodTruck: u.nomeFoodTruck, nomeProprietario: u.nomeProprietario, cidade: u.cidade, email, senha: '', codigoQuiosque: u.codigoQuiosque, corPrimaria: u.corPrimaria };
}

function produtoFromAPI(p: ProdutoAPI): Produto {
  return { ...p, categoria: p.categoria as Produto['categoria'] };
}

function clienteFromAPI(c: ClienteAPI): Cliente {
  return { ...c, tipo: c.tipo as Cliente['tipo'], ultimoPedido: c.ultimoPedido ? new Date(c.ultimoPedido) : undefined };
}

function pedidoFromAPI(p: PedidoAPI): Pedido {
  return {
    id: p.id,
    numero: p.numero,
    cliente: p.clienteNome,
    origem: p.origem as OrigemPedido,
    total: p.total,
    formaPagamento: p.formaPagamento as FormaPagamento,
    status: p.status as Pedido['status'],
    observacoes: p.observacoes,
    data: new Date(p.data),
    itens: p.itens.map(i => ({
      produto: produtoFromAPI(i.produto),
      quantidade: i.quantidade,
      subtotal: i.subtotal,
      observacao: i.observacao,
    })),
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>(configPadrao);
  const [logado, setLogado] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [inicializando, setInicializando] = useState<boolean>(true);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos]   = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Ao montar: verifica se já tem token e carrega os dados
  const carregarDados = useCallback(async () => {
    try {
      const [prods, peds, clis, me] = await Promise.all([
        api.get<ProdutoAPI[]>('/produtos'),
        api.get<PedidoAPI[]>('/pedidos'),
        api.get<ClienteAPI[]>('/clientes'),
        api.get<{ usuario: UsuarioAPI }>('/auth/me'),
      ]);
      setProdutos(prods.map(produtoFromAPI));
      setPedidos(peds.map(pedidoFromAPI));
      setClientes(clis.map(clienteFromAPI));
      const emailSalvo = localStorage.getItem('ft_email') ?? '';
      setConfiguracoes(cfgFromUsuario(me.usuario, emailSalvo));
      setLogado(true);
    } catch {
      // Token inválido ou expirado
      localStorage.removeItem('ft_token');
      localStorage.removeItem('ft_email');
      setLogado(false);
    } finally {
      setInicializando(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('ft_token')) {
      carregarDados();
    } else {
      setInicializando(false);
    }
  }, [carregarDados]);

  // ─── Auth ──────────────────────────────────────────────────────────────────

  const login = async (email: string, senha: string): Promise<string | null> => {
    setCarregando(true);
    try {
      const res = await api.post<{ token: string; usuario: UsuarioAPI }>('/auth/login', { email, senha });
      localStorage.setItem('ft_token', res.token);
      localStorage.setItem('ft_email', email);
      setConfiguracoes(cfgFromUsuario(res.usuario, email));
      await carregarDados();
      return null;
    } catch (e) {
      return (e as Error).message ?? 'Erro ao fazer login.';
    } finally {
      setCarregando(false);
    }
  };

  const logout = () => {
    setLogado(false);
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_email');
    setProdutos([]); setPedidos([]); setClientes([]);
    setConfiguracoes(configPadrao);
  };

  const cadastrar = async (dados: { nomeFoodTruck: string; nomeProprietario: string; cidade: string; email: string; senha: string }): Promise<string | null> => {
    setCarregando(true);
    try {
      const res = await api.post<{ token: string; usuario: UsuarioAPI }>('/auth/register', dados);
      localStorage.setItem('ft_token', res.token);
      localStorage.setItem('ft_email', dados.email);
      setConfiguracoes(cfgFromUsuario(res.usuario, dados.email));
      setLogado(true);
      setProdutos([]); setPedidos([]); setClientes([]);
      return null;
    } catch (e) {
      return (e as Error).message ?? 'Erro ao cadastrar.';
    } finally {
      setCarregando(false);
    }
  };

  const salvarConfiguracoes = (cfg: Partial<Configuracoes>) => {
    setConfiguracoes(prev => ({ ...prev, ...cfg }));
  };

  // ─── Produtos ─────────────────────────────────────────────────────────────

  const adicionarProduto = async (produto: Omit<Produto, 'id'>) => {
    const criado = await api.post<ProdutoAPI>('/produtos', produto);
    setProdutos(prev => [...prev, produtoFromAPI(criado)]);
  };

  const editarProduto = async (id: number, dados: Partial<Produto>) => {
    const atualizado = await api.patch<ProdutoAPI>(`/produtos/${id}`, dados);
    setProdutos(prev => prev.map(p => p.id === id ? produtoFromAPI(atualizado) : p));
  };

  const excluirProduto = async (id: number) => {
    await api.delete(`/produtos/${id}`);
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  const reporEstoque = async (id: number, quantidade: number) => {
    const atualizado = await api.post<ProdutoAPI>(`/produtos/${id}/repor-estoque`, { quantidade });
    setProdutos(prev => prev.map(p => p.id === id ? produtoFromAPI(atualizado) : p));
  };

  // ─── Pedidos ──────────────────────────────────────────────────────────────

  const criarPedido = async (dados: {
    cliente?: string;
    origem: OrigemPedido;
    itens: ItemPedido[];
    formaPagamento: FormaPagamento;
    observacoes?: string;
  }): Promise<Pedido> => {
    const body = {
      cliente: dados.cliente,
      origem: dados.origem,
      formaPagamento: dados.formaPagamento,
      observacoes: dados.observacoes,
      itens: dados.itens.map(i => ({ produtoId: i.produto.id, quantidade: i.quantidade, observacao: i.observacao })),
    };
    const criado = await api.post<PedidoAPI>('/pedidos', body);
    const pedido = pedidoFromAPI(criado);
    setPedidos(prev => [pedido, ...prev]);
    // Atualiza estoques localmente com os valores reais do servidor
    const idsAlterados = dados.itens.map(i => i.produto.id);
    const prodsAtualizados = await api.get<ProdutoAPI[]>('/produtos');
    setProdutos(prodsAtualizados.map(produtoFromAPI).filter(p => idsAlterados.includes(p.id) || true));
    return pedido;
  };

  const atualizarStatusPedido = async (id: number, status: Pedido['status']) => {
    await api.patch<PedidoAPI>(`/pedidos/${id}/status`, { status });
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // ─── Clientes ─────────────────────────────────────────────────────────────

  const adicionarCliente = async (cliente: Omit<Cliente, 'id' | 'totalPedidos' | 'totalGasto'>) => {
    const criado = await api.post<ClienteAPI>('/clientes', cliente);
    setClientes(prev => [...prev, clienteFromAPI(criado)]);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppContext.Provider value={{
      produtos, pedidos, clientes, configuracoes,
      logado, carregando, inicializando,
      login, logout, cadastrar, salvarConfiguracoes,
      adicionarProduto, editarProduto, excluirProduto, reporEstoque,
      criarPedido, atualizarStatusPedido, adicionarCliente,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
