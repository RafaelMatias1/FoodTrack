import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { parseBody } from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { httpError } from '../middleware/error.js';

export const produtosRouter = Router();

produtosRouter.use(requireAuth);

const categoriaEnum = z.enum(['Lanche', 'Acompanhamento', 'Bebida', 'Combo', 'Insumo']);

const createSchema = z.object({
  nome: z.string().min(1),
  categoria: categoriaEnum,
  preco: z.number().nonnegative(),
  ativo: z.boolean().optional(),
  estoqueAtual: z.number().int().nonnegative().optional(),
  estoqueMinimo: z.number().int().nonnegative().optional(),
  descricao: z.string().optional(),
  imagemEmoji: z.string().optional(),
  imagemUrl: z.string().optional(),
  personalizacoes: z.array(z.object({
    label: z.string(),
    tipo: z.enum(['remover', 'adicionar', 'outro']),
  })).optional(),
});

const updateSchema = createSchema.partial();

function serialize(p: any) {
  return {
    ...p,
    personalizacoes: p.personalizacoes ? JSON.parse(p.personalizacoes) : undefined,
  };
}

produtosRouter.get('/', async (req, res, next) => {
  try {
    const list = await prisma.produto.findMany({
      where: { usuarioId: req.usuarioId! },
      orderBy: { id: 'asc' },
    });
    res.json(list.map(serialize));
  } catch (e) { next(e); }
});

produtosRouter.post('/', async (req, res, next) => {
  try {
    const dados = parseBody(createSchema, req.body);
    const criado = await prisma.produto.create({
      data: {
        ...dados,
        personalizacoes: dados.personalizacoes ? JSON.stringify(dados.personalizacoes) : null,
        usuarioId: req.usuarioId!,
      },
    });
    res.status(201).json(serialize(criado));
  } catch (e) { next(e); }
});

async function findOwn(id: number, usuarioId: number) {
  const p = await prisma.produto.findFirst({ where: { id, usuarioId } });
  if (!p) throw httpError(404, 'produto não encontrado');
  return p;
}

produtosRouter.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await findOwn(id, req.usuarioId!);
    const dados = parseBody(updateSchema, req.body);
    const atualizado = await prisma.produto.update({
      where: { id },
      data: {
        ...dados,
        personalizacoes: dados.personalizacoes ? JSON.stringify(dados.personalizacoes) : undefined,
      },
    });
    res.json(serialize(atualizado));
  } catch (e) { next(e); }
});

produtosRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await findOwn(id, req.usuarioId!);
    await prisma.produto.delete({ where: { id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

const reporSchema = z.object({ quantidade: z.number().int().positive() });

produtosRouter.post('/:id/repor-estoque', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await findOwn(id, req.usuarioId!);
    const { quantidade } = parseBody(reporSchema, req.body);
    const atualizado = await prisma.produto.update({
      where: { id },
      data: { estoqueAtual: { increment: quantidade } },
    });
    res.json(serialize(atualizado));
  } catch (e) { next(e); }
});
