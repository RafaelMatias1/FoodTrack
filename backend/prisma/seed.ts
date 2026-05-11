import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('1234', 10);

  const usuario = await prisma.usuario.upsert({
    where: { email: 'elpidio@foodtrack.dev' },
    update: {},
    create: {
      email: 'elpidio@foodtrack.dev',
      senhaHash,
      nomeFoodTruck: 'Food Truck do Elpidio',
      nomeProprietario: 'Elpidio',
      cidade: 'Guaramirim - SC',
      codigoQuiosque: '0000',
    },
  });

  const existeProduto = await prisma.produto.findFirst({ where: { usuarioId: usuario.id } });
  if (!existeProduto) {
    const produtosBase: Array<{
      nome: string; categoria: string; preco: number;
      estoqueAtual: number; estoqueMinimo: number;
      imagemEmoji: string; ativo?: boolean;
    }> = [
      { nome: 'X-Burguer', categoria: 'Lanche', preco: 18, estoqueAtual: 15, estoqueMinimo: 10, imagemEmoji: '🍔' },
      { nome: 'X-Bacon', categoria: 'Lanche', preco: 22, estoqueAtual: 8, estoqueMinimo: 10, imagemEmoji: '🥓' },
      { nome: 'Cachorro-Quente', categoria: 'Lanche', preco: 14, estoqueAtual: 20, estoqueMinimo: 10, imagemEmoji: '🌭' },
      { nome: 'Fritas Pequena', categoria: 'Acompanhamento', preco: 8, estoqueAtual: 30, estoqueMinimo: 15, imagemEmoji: '🍟' },
      { nome: 'Fritas Grande', categoria: 'Acompanhamento', preco: 14, estoqueAtual: 25, estoqueMinimo: 10, imagemEmoji: '🍟' },
      { nome: 'Refrigerante', categoria: 'Bebida', preco: 6, estoqueAtual: 3, estoqueMinimo: 10, imagemEmoji: '🥤' },
      { nome: 'Suco Natural', categoria: 'Bebida', preco: 8, ativo: false, estoqueAtual: 0, estoqueMinimo: 5, imagemEmoji: '🧃' },
      { nome: 'Combo Família', categoria: 'Combo', preco: 65, estoqueAtual: 5, estoqueMinimo: 3, imagemEmoji: '🎁' },
      { nome: 'Pão de Hot Dog', categoria: 'Insumo', preco: 2, estoqueAtual: 4, estoqueMinimo: 10, imagemEmoji: '🍞' },
    ];

    for (const p of produtosBase) {
      await prisma.produto.create({ data: { ...p, ativo: p.ativo ?? true, usuarioId: usuario.id } });
    }

    const clientes = [
      { nome: 'Carlos Mendes', contato: '(47) 98123-4567', totalPedidos: 14, totalGasto: 378, preferencia: 'X-Burguer', tipo: 'frequente' },
      { nome: 'Ana Lima', contato: '(47) 98765-1234', totalPedidos: 8, totalGasto: 196, preferencia: 'Cachorro-Quente', tipo: 'recorrente' },
      { nome: 'Fernanda Santos', contato: '(47) 99456-7890', totalPedidos: 5, totalGasto: 143, preferencia: 'X-Bacon', tipo: 'WhatsApp' },
      { nome: 'Elpidio Jr.', contato: '(47) 99321-6548', totalPedidos: 3, totalGasto: 205, preferencia: 'Combo Família', tipo: 'familiar' },
    ];
    for (const c of clientes) {
      await prisma.cliente.create({ data: { ...c, ultimoPedido: new Date(), usuarioId: usuario.id } });
    }
  }

  console.log('Seed pronto. Login: elpidio@foodtrack.dev / 1234');
}

main().finally(() => prisma.$disconnect());
