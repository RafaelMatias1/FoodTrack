export type Categoria = 'Lanche' | 'Acompanhamento' | 'Bebida' | 'Combo' | 'Insumo';

export type FormaPagamento = 'Pix' | 'Crédito' | 'Débito' | 'Dinheiro';

export type StatusPedido = 'Em preparo' | 'Concluído' | 'Cancelado';

export type OrigemPedido = 'Presencial' | 'WhatsApp' | 'Quiosque';

export interface Produto {
  id: number;
  nome: string;
  categoria: Categoria;
  preco: number;
  ativo: boolean;
  estoqueAtual: number;
  estoqueMinimo: number;
  descricao?: string;
  imagemEmoji?: string;
}

export interface ItemPedido {
  produto: Produto;
  quantidade: number;
  subtotal: number;
  observacao?: string;
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

export interface Configuracoes {
  nomeFoodTruck: string;
  nomeProprietario: string;
  cidade: string;
  senha: string;
  codigoQuiosque: string;
  corPrimaria: string;
}
