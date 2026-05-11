import { describe, it, expect } from 'vitest';
import { request, criarUsuarioTeste } from './helpers.js';
import { prisma } from '../src/db.js';

describe('POST /auth/register', () => {
  it('cria usuário e retorna token', async () => {
    const res = await request().post('/auth/register').send({
      email: 'novo@x.com', senha: 'segredo1', nomeFoodTruck: 'X', nomeProprietario: 'Y', cidade: 'Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.email).toBe('novo@x.com');
    const db = await prisma.usuario.findUnique({ where: { email: 'novo@x.com' } });
    expect(db).not.toBeNull();
  });

  it('rejeita email duplicado', async () => {
    await criarUsuarioTeste({ email: 'dup@x.com' });
    const res = await request().post('/auth/register').send({
      email: 'dup@x.com', senha: 'segredo1', nomeFoodTruck: 'X', nomeProprietario: 'Y', cidade: 'Z',
    });
    expect(res.status).toBe(409);
  });

  it('valida campos faltantes', async () => {
    const res = await request().post('/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('autentica com credenciais válidas', async () => {
    await criarUsuarioTeste({ email: 'a@b.com', senha: 'ok123' });
    const res = await request().post('/auth/login').send({ email: 'a@b.com', senha: 'ok123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejeita senha errada', async () => {
    await criarUsuarioTeste({ email: 'a@b.com', senha: 'ok123' });
    const res = await request().post('/auth/login').send({ email: 'a@b.com', senha: 'errada' });
    expect(res.status).toBe(401);
  });
});

describe('GET /auth/me', () => {
  it('retorna o usuário do token', async () => {
    const { token, usuario } = await criarUsuarioTeste();
    const res = await request().get('/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.usuario.id).toBe(usuario.id);
    expect(res.body.usuario.senhaHash).toBeUndefined();
  });

  it('401 sem token', async () => {
    const res = await request().get('/auth/me');
    expect(res.status).toBe(401);
  });
});
