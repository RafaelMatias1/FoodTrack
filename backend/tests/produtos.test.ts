import { describe, it, expect, beforeEach } from 'vitest';
import { request, criarUsuarioTeste } from './helpers.js';
import { prisma } from '../src/db.js';

let token: string;
let usuarioId: number;

beforeEach(async () => {
  const r = await criarUsuarioTeste();
  token = r.token;
  usuarioId = r.usuario.id;
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe('GET /produtos', () => {
  it('lista apenas produtos do usuário autenticado', async () => {
    await prisma.produto.create({ data: { nome: 'A', categoria: 'Lanche', preco: 10, usuarioId } });
    const outro = await criarUsuarioTeste({ email: 'outro@x.com' });
    await prisma.produto.create({ data: { nome: 'B', categoria: 'Lanche', preco: 10, usuarioId: outro.usuario.id } });
    const res = await request().get('/produtos').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nome).toBe('A');
  });
});

describe('POST /produtos', () => {
  it('cria e retorna 201', async () => {
    const res = await request().post('/produtos').set(auth()).send({
      nome: 'Hamburguer', categoria: 'Lanche', preco: 15.5, estoqueAtual: 10, estoqueMinimo: 5,
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.nome).toBe('Hamburguer');
  });

  it('400 com body inválido', async () => {
    const res = await request().post('/produtos').set(auth()).send({ nome: '' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /produtos/:id', () => {
  it('atualiza campos', async () => {
    const p = await prisma.produto.create({ data: { nome: 'A', categoria: 'Lanche', preco: 10, usuarioId } });
    const res = await request().patch(`/produtos/${p.id}`).set(auth()).send({ preco: 20, ativo: false });
    expect(res.status).toBe(200);
    expect(res.body.preco).toBe(20);
    expect(res.body.ativo).toBe(false);
  });

  it('404 produto de outro usuário', async () => {
    const outro = await criarUsuarioTeste({ email: 'outro@x.com' });
    const p = await prisma.produto.create({ data: { nome: 'A', categoria: 'Lanche', preco: 10, usuarioId: outro.usuario.id } });
    const res = await request().patch(`/produtos/${p.id}`).set(auth()).send({ preco: 99 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /produtos/:id', () => {
  it('remove', async () => {
    const p = await prisma.produto.create({ data: { nome: 'A', categoria: 'Lanche', preco: 10, usuarioId } });
    const res = await request().delete(`/produtos/${p.id}`).set(auth());
    expect(res.status).toBe(204);
    expect(await prisma.produto.findUnique({ where: { id: p.id } })).toBeNull();
  });
});

describe('POST /produtos/:id/repor-estoque', () => {
  it('soma quantidade no estoqueAtual', async () => {
    const p = await prisma.produto.create({ data: { nome: 'A', categoria: 'Lanche', preco: 10, estoqueAtual: 5, usuarioId } });
    const res = await request().post(`/produtos/${p.id}/repor-estoque`).set(auth()).send({ quantidade: 10 });
    expect(res.status).toBe(200);
    expect(res.body.estoqueAtual).toBe(15);
  });

  it('rejeita quantidade <= 0', async () => {
    const p = await prisma.produto.create({ data: { nome: 'A', categoria: 'Lanche', preco: 10, usuarioId } });
    const res = await request().post(`/produtos/${p.id}/repor-estoque`).set(auth()).send({ quantidade: 0 });
    expect(res.status).toBe(400);
  });
});
