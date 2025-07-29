import stripe from '../../utils/stripe.js';
import { addFundsToWallet } from './payments.repository.js';
import express from 'express';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const router = express.Router();

// Middleware para leer el body sin modificarlo
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('Webhook recibido en backend');
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // si el pago fue exitoso
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const amount = paymentIntent.amount / 100; // de centavos a dólares
    const userId = paymentIntent.metadata.userId;

    try {
      await addFundsToWallet(userId, amount, 'Recarga con Stripe');
      console.log(`Saldo recargado para el usuario ${userId}`);
    } catch (error) {
      console.error('Error al actualizar saldo:', error);
      return res.status(500).send('Error al actualizar saldo');
    }
  }

  res.status(200).send('Webhook recibido');
});

export default router;
