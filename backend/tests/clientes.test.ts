import { describe, it, expect, beforeEach } from 'vitest';
import { request, criarUsuarioTeste } from './helpers.js';
import { prisma } from '../src/db.js';

let token: string;
let usuarioId: number;
beforeEach(async () => { const r = await criarUsuarioTeste(); token = r.token; usuarioId = r.usuario.id; });
const auth = () => ({ Authorization: `Bearer ${token}` });

describe('GET /clientes', () => {
  it('lista clientes do usuário', async () => {
    await prisma.cliente.create({ data: { nome: 'Foo', usuarioId } });
    const res = await request().get('/clientes').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('POST /clientes', () => {
  it('cria com totais zerados', async () => {
    const res = await request().post('/clientes').set(auth()).send({ nome: 'Foo', contato: '99', tipo: 'novo' });
    expect(res.status).toBe(201);
    expect(res.body.totalPedidos).toBe(0);
    expect(res.body.totalGasto).toBe(0);
  });

  it('400 sem nome', async () => {
    const res = await request().post('/clientes').set(auth()).send({});
    expect(res.status).toBe(400);
  });
});
