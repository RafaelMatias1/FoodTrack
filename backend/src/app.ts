import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { errorHandler } from './middleware/error.js';
import { authRouter } from './routes/auth.js';
import { produtosRouter } from './routes/produtos.js';
import { clientesRouter } from './routes/clientes.js';
import { pedidosRouter } from './routes/pedidos.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/auth', authRouter);
  app.use('/produtos', produtosRouter);
  app.use('/clientes', clientesRouter);
  app.use('/pedidos', pedidosRouter);

  app.use(errorHandler);
  return app;
}
