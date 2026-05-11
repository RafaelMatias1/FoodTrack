import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { parseBody } from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';

export const clientesRouter = Router();
clientesRouter.use(requireAuth);

const tipoEnum = z.enum(['frequente', 'recorrente', 'familiar', 'WhatsApp', 'novo']);

const createSchema = z.object({
  nome: z.string().min(1),
  contato: z.string().optional(),
  preferencia: z.string().optional(),
  tipo: tipoEnum.optional(),
});

clientesRouter.get('/', async (req, res, next) => {
  try {
    const list = await prisma.cliente.findMany({
      where: { usuarioId: req.usuarioId! },
      orderBy: { id: 'asc' },
    });
    res.json(list);
  } catch (e) { next(e); }
});

clientesRouter.post('/', async (req, res, next) => {
  try {
    const dados = parseBody(createSchema, req.body);
    const criado = await prisma.cliente.create({
      data: { ...dados, tipo: dados.tipo ?? 'novo', usuarioId: req.usuarioId! },
    });
    res.status(201).json(criado);
  } catch (e) { next(e); }
});
