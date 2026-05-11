import { ErrorRequestHandler } from 'express';
import { ValidationError } from '../lib/validate.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({ erro: 'validação falhou', detalhes: err.issues });
    return;
  }
  if (err?.status && err?.message) {
    res.status(err.status).json({ erro: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ erro: 'erro interno' });
};

export const httpError = (status: number, message: string) => {
  const e: any = new Error(message);
  e.status = status;
  return e;
};
