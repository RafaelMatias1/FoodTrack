import { prisma } from '../db.js';
import { httpError } from '../middleware/error.js';

export interface CriarPedidoInput {
  usuarioId: number;
  cliente?: string;
  origem: 'Presencial' | 'WhatsApp' | 'Quiosque';
  formaPagamento: 'Pix' | 'Crédito' | 'Débito' | 'Dinheiro';
  observacoes?: string;
  itens: { produtoId: number; quantidade: number; observacao?: string }[];
}

export async function criarPedido(input: CriarPedidoInput) {
  return prisma.$transaction(async (tx) => {
    const ids = input.itens.map(i => i.produtoId);
    const produtos = await tx.produto.findMany({
      where: { id: { in: ids }, usuarioId: input.usuarioId },
    });
    if (produtos.length !== new Set(ids).size) {
      throw httpError(404, 'um ou mais produtos não encontrados');
    }

    let total = 0;
    const linhas = input.itens.map(item => {
      const prod = produtos.find(p => p.id === item.produtoId)!;
      if (prod.estoqueAtual < item.quantidade) {
        throw httpError(409, `estoque insuficiente para ${prod.nome}`);
      }
      const subtotal = prod.preco * item.quantidade;
      total += subtotal;
      return { produto: prod, quantidade: item.quantidade, subtotal, observacao: item.observacao };
    });

    for (const l of linhas) {
      await tx.produto.update({
        where: { id: l.produto.id },
        data: { estoqueAtual: { decrement: l.quantidade } },
      });
    }

    let clienteId: number | null = null;
    if (input.cliente) {
      const nomeNorm = input.cliente.toLowerCase().trim();
      const candidatos = await tx.cliente.findMany({ where: { usuarioId: input.usuarioId } });
      const match = candidatos.find(c => c.nome.toLowerCase() === nomeNorm)
        ?? candidatos.find(c => c.nome.toLowerCase().includes(nomeNorm))
        ?? candidatos.find(c => nomeNorm.includes(c.nome.toLowerCase().split(' ')[0]));
      if (match) {
        clienteId = match.id;
        await tx.cliente.update({
          where: { id: match.id },
          data: {
            totalPedidos: { increment: 1 },
            totalGasto: { increment: total },
            ultimoPedido: new Date(),
          },
        });
      }
    }

    const pedido = await tx.pedido.create({
      data: {
        usuarioId: input.usuarioId,
        numero: '#PENDENTE',
        clienteNome: input.cliente,
        clienteId,
        origem: input.origem,
        total,
        formaPagamento: input.formaPagamento,
        observacoes: input.observacoes,
        itens: {
          create: linhas.map(l => ({
            produtoId: l.produto.id,
            quantidade: l.quantidade,
            precoUnit: l.produto.preco,
            subtotal: l.subtotal,
            observacao: l.observacao,
          })),
        },
      },
    });
    const numero = `#${String(pedido.id).padStart(3, '0')}`;
    return tx.pedido.update({
      where: { id: pedido.id },
      data: { numero },
      include: { itens: { include: { produto: true } } },
    });
  });
}
