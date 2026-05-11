import { RequestHandler } from 'express';
import { verificarToken } from '../lib/jwt.js';

declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
    }
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'token ausente' });
    return;
  }
  try {
    const { usuarioId } = verificarToken(header.slice(7));
    req.usuarioId = usuarioId;
    next();
  } catch {
    res.status(401).json({ erro: 'token inválido' });
  }
};
