import { describe, it, expect, beforeEach } from 'vitest';
import { request, criarUsuarioTeste } from './helpers.js';
import { prisma } from '../src/db.js';

let token: string;
let usuarioId: number;
beforeEach(async () => { const r = await criarUsuarioTeste(); token = r.token; usuarioId = r.usuario.id; });
const auth = () => ({ Authorization: `Bearer ${token}` });

async function criarProduto(nome: string, preco: number, estoque = 10) {
  return prisma.produto.create({ data: { nome, categoria: 'Lanche', preco, estoqueAtual: estoque, usuarioId } });
}

describe('POST /pedidos', () => {
  it('cria pedido, decrementa estoque e calcula total', async () => {
    const p1 = await criarProduto('A', 10, 5);
    const p2 = await criarProduto('B', 8, 5);
    const res = await request().post('/pedidos').set(auth()).send({
      origem: 'Presencial',
      formaPagamento: 'Pix',
      itens: [{ produtoId: p1.id, quantidade: 2 }, { produtoId: p2.id, quantidade: 1 }],
    });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(28);
    expect(res.body.numero).toMatch(/^#\d{3}$/);
    expect(res.body.status).toBe('Em preparo');
    const p1d = await prisma.produto.findUnique({ where: { id: p1.id } });
    expect(p1d!.estoqueAtual).toBe(3);
  });

  it('vincula a cliente existente por nome (case-insensitive) e incrementa contadores', async () => {
    await prisma.cliente.create({ data: { nome: 'Carlos Mendes', totalPedidos: 1, totalGasto: 10, usuarioId } });
    const prod = await criarProduto('X', 15);
    const res = await request().post('/pedidos').set(auth()).send({
      cliente: 'carlos mendes',
      origem: 'Presencial', formaPagamento: 'Pix',
      itens: [{ produtoId: prod.id, quantidade: 1 }],
    });
    expect(res.status).toBe(201);
    const c = await prisma.cliente.findFirst({ where: { usuarioId } });
    expect(c!.totalPedidos).toBe(2);
    expect(c!.totalGasto).toBe(25);
  });

  it('rejeita estoque insuficiente sem decrementar', async () => {
    const p = await criarProduto('A', 10, 1);
    const res = await request().post('/pedidos').set(auth()).send({
      origem: 'Presencial', formaPagamento: 'Pix',
      itens: [{ produtoId: p.id, quantidade: 5 }],
    });
    expect(res.status).toBe(409);
    const dbp = await prisma.produto.findUnique({ where: { id: p.id } });
    expect(dbp!.estoqueAtual).toBe(1);
  });

  it('rejeita itens vazios', async () => {
    const res = await request().post('/pedidos').set(auth()).send({
      origem: 'Presencial', formaPagamento: 'Pix', itens: [],
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /pedidos', () => {
  it('lista com itens incluídos, mais recentes primeiro', async () => {
    const p = await criarProduto('A', 10);
    await request().post('/pedidos').set(auth()).send({
      origem: 'Presencial', formaPagamento: 'Pix',
      itens: [{ produtoId: p.id, quantidade: 1 }],
    });
    const res = await request().get('/pedidos').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].itens[0].produto.nome).toBe('A');
  });
});

describe('PATCH /pedidos/:id/status', () => {
  it('atualiza status', async () => {
    const p = await criarProduto('A', 10);
    const criar = await request().post('/pedidos').set(auth()).send({
      origem: 'Presencial', formaPagamento: 'Pix',
      itens: [{ produtoId: p.id, quantidade: 1 }],
    });
    const res = await request().patch(`/pedidos/${criar.body.id}/status`).set(auth()).send({ status: 'Concluído' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Concluído');
  });

  it('rejeita status inválido', async () => {
    const p = await criarProduto('A', 10);
    const criar = await request().post('/pedidos').set(auth()).send({
      origem: 'Presencial', formaPagamento: 'Pix',
      itens: [{ produtoId: p.id, quantidade: 1 }],
    });
    const res = await request().patch(`/pedidos/${criar.body.id}/status`).set(auth()).send({ status: 'Whatever' });
    expect(res.status).toBe(400);
  });
});
