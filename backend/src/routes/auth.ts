import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { hashSenha, compararSenha } from '../lib/hash.js';
import { assinarToken } from '../lib/jwt.js';
import { parseBody } from '../lib/validate.js';
import { httpError } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(4),
  nomeFoodTruck: z.string().min(1),
  nomeProprietario: z.string().min(1),
  cidade: z.string().min(1),
});

interface PublicUsuario {
  id: number; email: string;
  nomeFoodTruck: string; nomeProprietario: string; cidade: string;
  codigoQuiosque: string; corPrimaria: string;
}

function publicUsuario(u: PublicUsuario): PublicUsuario {
  return {
    id: u.id, email: u.email,
    nomeFoodTruck: u.nomeFoodTruck, nomeProprietario: u.nomeProprietario,
    cidade: u.cidade, codigoQuiosque: u.codigoQuiosque, corPrimaria: u.corPrimaria,
  };
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const dados = parseBody(registerSchema, req.body);
    const existe = await prisma.usuario.findUnique({ where: { email: dados.email } });
    if (existe) throw httpError(409, 'email já cadastrado');
    const usuario = await prisma.usuario.create({
      data: {
        email: dados.email,
        senhaHash: await hashSenha(dados.senha),
        nomeFoodTruck: dados.nomeFoodTruck,
        nomeProprietario: dados.nomeProprietario,
        cidade: dados.cidade,
      },
    });
    const token = assinarToken({ usuarioId: usuario.id });
    res.status(201).json({ token, usuario: publicUsuario(usuario) });
  } catch (e) { next(e); }
});

const loginSchema = z.object({ email: z.string().email(), senha: z.string().min(1) });

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = parseBody(loginSchema, req.body);
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) throw httpError(401, 'credenciais inválidas');
    const ok = await compararSenha(senha, usuario.senhaHash);
    if (!ok) throw httpError(401, 'credenciais inválidas');
    const token = assinarToken({ usuarioId: usuario.id });
    res.json({ token, usuario: publicUsuario(usuario) });
  } catch (e) { next(e); }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId! } });
    if (!usuario) throw httpError(404, 'usuário não encontrado');
    res.json({ usuario: publicUsuario(usuario) });
  } catch (e) { next(e); }
});
