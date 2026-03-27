export type Categoria = 'Lanche' | 'Acompanhamento' | 'Bebida' | 'Combo' | 'Insumo';

export type FormaPagamento = 'Pix' | 'Crédito' | 'Débito' | 'Dinheiro';

export type StatusPedido = 'Em preparo' | 'Concluído' | 'Cancelado';

export type OrigemPedido = 'Presencial' | 'WhatsApp';

export interface Produto {
  id: number;
  nome: string;
  categoria: Categoria;
  preco: number;
  ativo: boolean;
  estoqueAtual: number;
  estoqueMinimo: number;
  descricao?: string;
}

export interface ItemPedido {
  produto: Produto;
  quantidade: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  numero: string;
  cliente?: string;
  origem: OrigemPedido;
  itens: ItemPedido[];
  total: number;
  formaPagamento: FormaPagamento;
  status: StatusPedido;
  observacoes?: string;
  data: Date;
}

export interface Cliente {
  id: number;
  nome: string;
  contato?: string;
  totalPedidos: number;
  totalGasto: number;
  ultimoPedido?: Date;
  preferencia?: string;
  tipo: 'frequente' | 'recorrente' | 'familiar' | 'WhatsApp' | 'novo';
}
