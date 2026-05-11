import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export interface TokenPayload { usuarioId: number; }

export const assinarToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });

export const verificarToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;
