import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { parseBody } from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { httpError } from '../middleware/error.js';
import { criarPedido } from '../services/pedido.service.js';

export const pedidosRouter = Router();
pedidosRouter.use(requireAuth);

const origemEnum = z.enum(['Presencial', 'WhatsApp', 'Quiosque']);
const formaEnum = z.enum(['Pix', 'Crédito', 'Débito', 'Dinheiro']);
const statusEnum = z.enum(['Em preparo', 'Concluído', 'Cancelado']);

const createSchema = z.object({
  cliente: z.string().optional(),
  origem: origemEnum,
  formaPagamento: formaEnum,
  observacoes: z.string().optional(),
  itens: z.array(z.object({
    produtoId: z.number().int().positive(),
    quantidade: z.number().int().positive(),
    observacao: z.string().optional(),
  })).min(1),
});

pedidosRouter.get('/', async (req, res, next) => {
  try {
    const list = await prisma.pedido.findMany({
      where: { usuarioId: req.usuarioId! },
      include: { itens: { include: { produto: true } } },
      orderBy: { data: 'desc' },
    });
    res.json(list);
  } catch (e) { next(e); }
});

pedidosRouter.post('/', async (req, res, next) => {
  try {
    const dados = parseBody(createSchema, req.body);
    const pedido = await criarPedido({ ...dados, usuarioId: req.usuarioId! });
    res.status(201).json(pedido);
  } catch (e) { next(e); }
});

pedidosRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = parseBody(z.object({ status: statusEnum }), req.body);
    const pedido = await prisma.pedido.findFirst({ where: { id, usuarioId: req.usuarioId! } });
    if (!pedido) throw httpError(404, 'pedido não encontrado');
    const atualizado = await prisma.pedido.update({
      where: { id },
      data: { status },
      include: { itens: { include: { produto: true } } },
    });
    res.json(atualizado);
  } catch (e) { next(e); }
});
