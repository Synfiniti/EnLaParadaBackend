import express from 'express';
import usersRouter from './src/modules/users/users.routes.js';
import walletRoutes from './src/modules/wallets/wallets.routes.js';
import busRoutes from './src/modules/bus/bus.routes.js';
import { ZodError } from 'zod/v4';
import { ErrorWithStatus } from './src/utils/errorTypes.js';
import { DatabaseError } from 'pg';
import paymentsRouter from './src/modules/payments/payments.routes.js';
import paymentsWebhookRouter from './src/modules/payments/payments.webhook.js';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// Habilita CORS
app.use(cors());

// Webhooks deben ir antes de express.json
app.use('/api/stripe', paymentsWebhookRouter);

// JSON Body Parser
app.use(express.json());

// Endpoint base
app.get('/', (req, res) => {
  res.json({ hola: 'mundo' });
});

// Rutas API
app.use('/api/users', usersRouter);
app.use('/uploads', express.static('uploads'));
app.use('/api/payments', paymentsRouter);
app.use('/api/wallets', walletRoutes);
app.use('/api/bus', busRoutes);

// Middleware de errores
app.use((err, req, res, _next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err); // log solo en dev
  }

  if (err instanceof ZodError) {
    const messages = err.issues.map((zodError) => zodError.message);
    const message = messages.join(',\n');
    return res.status(400).json({ error: message });
  }

  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof DatabaseError && err.code === '22P02') {
    return res.status(400).json({ error: 'Hubo un error. Contacte al administrador' });
  }

  return res.status(500).json({ error: 'HUBO UN ERROR' });
});

export default app;
