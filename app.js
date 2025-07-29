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

app.use(cors());

app.use('/api/stripe', paymentsWebhookRouter);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ hola: 'mundo' });
});

// Routers normales
app.use('/api/users', usersRouter);
app.use('/uploads', express.static('uploads'));
app.use('/api/payments', paymentsRouter);
app.use('/api/wallets', walletRoutes);
app.use('/api/bus', busRoutes);

// Middleware de errores
app.use((err, req, res, _next) => {
  console.log(err);

  if (err instanceof ZodError) {
    const messages = err.issues.map((zodError) => zodError.message);
    const message = messages.join(',\n');
    return res.status(400).json({ error: message });
  }

  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof DatabaseError) {
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'Hubo un error. Contacte al administrador' });
    }
  }

  res.json({ error: 'HUBO UN ERROR' });
});

export default app;
