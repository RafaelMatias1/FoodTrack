import { beforeEach, afterAll } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db.js';
import { hashSenha } from '../src/lib/hash.js';
import { assinarToken } from '../src/lib/jwt.js';

export const app = createApp();
export const request = () => supertest(app);

beforeEach(async () => {
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.usuario.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export async function criarUsuarioTeste(over: Partial<{ email: string; senha: string }> = {}) {
  const senha = over.senha ?? 'senha123';
  const usuario = await prisma.usuario.create({
    data: {
      email: over.email ?? 'teste@foodtrack.dev',
      senhaHash: await hashSenha(senha),
      nomeFoodTruck: 'FT Teste',
      nomeProprietario: 'Teste',
      cidade: 'Teste - SC',
      codigoQuiosque: '0000',
    },
  });
  const token = assinarToken({ usuarioId: usuario.id });
  return { usuario, token, senha };
}
