import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Produto, Pedido, Cliente, ItemPedido, FormaPagamento, OrigemPedido, Configuracoes } from '../types';

interface AppContextType {
  produtos: Produto[];
  pedidos: Pedido[];
  clientes: Cliente[];
  configuracoes: Configuracoes;
  logado: boolean;
  login: (senha: string) => boolean;
  logout: () => void;
  cadastrar: (dados: { nomeFoodTruck: string; nomeProprietario: string; cidade: string; senha: string }) => void;
  primeiroAcesso: boolean;
  adicionarProduto: (produto: Omit<Produto, 'id'>) => void;
  editarProduto: (id: number, produto: Partial<Produto>) => void;
  excluirProduto: (id: number) => void;
  reporEstoque: (id: number, quantidade: number) => void;
  criarPedido: (dados: {
    cliente?: string;
    origem: OrigemPedido;
    itens: ItemPedido[];
    formaPagamento: FormaPagamento;
    observacoes?: string;
  }) => Pedido;
  atualizarStatusPedido: (id: number, status: Pedido['status']) => void;
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'totalPedidos' | 'totalGasto'>) => void;
  salvarConfiguracoes: (cfg: Partial<Configuracoes>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const configPadrao: Configuracoes = {
  nomeFoodTruck: 'Food Truck do Elpidio',
  nomeProprietario: 'Elpidio',
  cidade: 'Guaramirim - SC',
  senha: '1234',
  codigoQuiosque: '0000',
  corPrimaria: '#e07b20',
};

const produtosIniciais: Produto[] = [
  { id: 1, nome: 'X-Burguer', categoria: 'Lanche', preco: 18, ativo: true, estoqueAtual: 15, estoqueMinimo: 10, imagemEmoji: '🍔' },
  { id: 2, nome: 'X-Bacon', categoria: 'Lanche', preco: 22, ativo: true, estoqueAtual: 8, estoqueMinimo: 10, imagemEmoji: '🥓' },
  { id: 3, nome: 'Cachorro-Quente', categoria: 'Lanche', preco: 14, ativo: true, estoqueAtual: 20, estoqueMinimo: 10, imagemEmoji: '🌭' },
  { id: 4, nome: 'Fritas Pequena', categoria: 'Acompanhamento', preco: 8, ativo: true, estoqueAtual: 30, estoqueMinimo: 15, imagemEmoji: '🍟' },
  { id: 5, nome: 'Fritas Grande', categoria: 'Acompanhamento', preco: 14, ativo: true, estoqueAtual: 25, estoqueMinimo: 10, imagemEmoji: '🍟' },
  { id: 6, nome: 'Refrigerante', categoria: 'Bebida', preco: 6, ativo: true, estoqueAtual: 3, estoqueMinimo: 10, imagemEmoji: '🥤' },
  { id: 7, nome: 'Suco Natural', categoria: 'Bebida', preco: 8, ativo: false, estoqueAtual: 0, estoqueMinimo: 5, imagemEmoji: '🧃' },
  { id: 8, nome: 'Combo Família', categoria: 'Combo', preco: 65, ativo: true, estoqueAtual: 5, estoqueMinimo: 3, imagemEmoji: '🎁' },
  { id: 9, nome: 'Pão de Hot Dog', categoria: 'Insumo', preco: 2, ativo: true, estoqueAtual: 4, estoqueMinimo: 10, imagemEmoji: '🍞' },
];

const hoje = new Date();
const pedidosIniciais: Pedido[] = [
  {
    id: 21, numero: '#021', cliente: 'Elpidio Jr.', origem: 'WhatsApp',
    itens: [{ produto: produtosIniciais[7], quantidade: 1, subtotal: 65 }],
    total: 65, formaPagamento: 'Débito', status: 'Em preparo',
    data: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 17, 58),
  },
  {
    id: 22, numero: '#022', cliente: 'Ana L.', origem: 'Presencial',
    itens: [{ produto: produtosIniciais[2], quantidade: 2, subtotal: 28 }],
    total: 28, formaPagamento: 'Crédito', status: 'Concluído',
    data: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 18, 15),
  },
  {
    id: 23, numero: '#023', cliente: 'Carlos M.', origem: 'Presencial',
    itens: [
      { produto: produtosIniciais[0], quantidade: 1, subtotal: 18 },
      { produto: produtosIniciais[3], quantidade: 1, subtotal: 8 },
    ],
    total: 32, formaPagamento: 'Pix', status: 'Concluído',
    data: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 18, 42),
  },
  {
    id: 20, numero: '#020', cliente: 'Fernanda S.', origem: 'WhatsApp',
    itens: [
      { produto: produtosIniciais[1], quantidade: 1, subtotal: 22 },
      { produto: produtosIniciais[5], quantidade: 1, subtotal: 6 },
    ],
    total: 28, formaPagamento: 'Pix', status: 'Concluído',
    data: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 17, 33),
  },
  {
    id: 19, numero: '#019', cliente: undefined, origem: 'Presencial',
    itens: [
      { produto: produtosIniciais[3], quantidade: 1, subtotal: 8 },
      { produto: produtosIniciais[6], quantidade: 1, subtotal: 8 },
    ],
    total: 16, formaPagamento: 'Dinheiro', status: 'Concluído',
    data: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 17, 10),
  },
];

const clientesIniciais: Cliente[] = [
  { id: 1, nome: 'Carlos Mendes', contato: '(47) 98123-4567', totalPedidos: 14, totalGasto: 378, ultimoPedido: hoje, preferencia: 'X-Burguer', tipo: 'frequente' },
  { id: 2, nome: 'Ana Lima', contato: '(47) 98765-1234', totalPedidos: 8, totalGasto: 196, ultimoPedido: hoje, preferencia: 'Cachorro-Quente', tipo: 'recorrente' },
  { id: 3, nome: 'Fernanda Santos', contato: '(47) 99456-7890', totalPedidos: 5, totalGasto: 143, ultimoPedido: hoje, preferencia: 'X-Bacon', tipo: 'WhatsApp' },
  { id: 4, nome: 'Elpidio Jr.', contato: '(47) 99321-6548', totalPedidos: 3, totalGasto: 205, ultimoPedido: hoje, preferencia: 'Combo Família', tipo: 'familiar' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>(() => {
    const saved = localStorage.getItem('ft_config');
    return saved ? JSON.parse(saved) : configPadrao;
  });
  const [primeiroAcesso, setPrimeiroAcesso] = useState<boolean>(() => !localStorage.getItem('ft_config'));
  const [logado, setLogado] = useState<boolean>(() => sessionStorage.getItem('ft_logado') === 'true');

  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const saved = localStorage.getItem('ft_produtos');
    return saved ? JSON.parse(saved) : produtosIniciais;
  });
  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    const saved = localStorage.getItem('ft_pedidos');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((p: Pedido) => ({ ...p, data: new Date(p.data) }));
    }
    return pedidosIniciais;
  });
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('ft_clientes');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((c: Cliente) => ({ ...c, ultimoPedido: c.ultimoPedido ? new Date(c.ultimoPedido) : undefined }));
    }
    return clientesIniciais;
  });

  useEffect(() => { localStorage.setItem('ft_config', JSON.stringify(configuracoes)); }, [configuracoes]);
  useEffect(() => { localStorage.setItem('ft_produtos', JSON.stringify(produtos)); }, [produtos]);
  useEffect(() => { localStorage.setItem('ft_pedidos', JSON.stringify(pedidos)); }, [pedidos]);
  useEffect(() => { localStorage.setItem('ft_clientes', JSON.stringify(clientes)); }, [clientes]);

  const login = (senha: string): boolean => {
    if (senha === configuracoes.senha) {
      setLogado(true);
      sessionStorage.setItem('ft_logado', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setLogado(false);
    sessionStorage.removeItem('ft_logado');
  };

  const cadastrar = (dados: { nomeFoodTruck: string; nomeProprietario: string; cidade: string; senha: string }) => {
    const novaCfg = { ...configPadrao, ...dados };
    setConfiguracoes(novaCfg);
    localStorage.setItem('ft_config', JSON.stringify(novaCfg));
    setPrimeiroAcesso(false);
    setLogado(true);
    sessionStorage.setItem('ft_logado', 'true');
  };

  const salvarConfiguracoes = (cfg: Partial<Configuracoes>) => {
    setConfiguracoes(prev => ({ ...prev, ...cfg }));
  };

  const adicionarProduto = (produto: Omit<Produto, 'id'>) => {
    const id = Math.max(0, ...produtos.map(p => p.id)) + 1;
    setProdutos(prev => [...prev, { ...produto, id }]);
  };

  const editarProduto = (id: number, dados: Partial<Produto>) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...dados } : p));
  };

  const excluirProduto = (id: number) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  const reporEstoque = (id: number, quantidade: number) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, estoqueAtual: p.estoqueAtual + quantidade } : p));
  };

  const criarPedido = (dados: {
    cliente?: string;
    origem: OrigemPedido;
    itens: ItemPedido[];
    formaPagamento: FormaPagamento;
    observacoes?: string;
  }): Pedido => {
    const id = Math.max(0, ...pedidos.map(p => p.id)) + 1;
    const numero = `#${String(id).padStart(3, '0')}`;
    const total = dados.itens.reduce((sum, item) => sum + item.subtotal, 0);
    const novoPedido: Pedido = { id, numero, ...dados, total, status: 'Em preparo', data: new Date() };

    setProdutos(prev => prev.map(p => {
      const item = dados.itens.find(i => i.produto.id === p.id);
      if (item) return { ...p, estoqueAtual: Math.max(0, p.estoqueAtual - item.quantidade) };
      return p;
    }));

    if (dados.cliente) {
      setClientes(prev => {
        const existe = prev.find(c => c.nome.toLowerCase().startsWith(dados.cliente!.toLowerCase().split(' ')[0].toLowerCase()));
        if (existe) {
          return prev.map(c => c.id === existe.id
            ? { ...c, totalPedidos: c.totalPedidos + 1, totalGasto: c.totalGasto + total, ultimoPedido: new Date() }
            : c
          );
        }
        return prev;
      });
    }

    setPedidos(prev => [novoPedido, ...prev]);
    return novoPedido;
  };

  const atualizarStatusPedido = (id: number, status: Pedido['status']) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const adicionarCliente = (cliente: Omit<Cliente, 'id' | 'totalPedidos' | 'totalGasto'>) => {
    const id = Math.max(0, ...clientes.map(c => c.id)) + 1;
    setClientes(prev => [...prev, { ...cliente, id, totalPedidos: 0, totalGasto: 0 }]);
  };

  return (
    <AppContext.Provider value={{
      produtos, pedidos, clientes, configuracoes, logado, primeiroAcesso,
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
