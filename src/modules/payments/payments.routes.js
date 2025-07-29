import express from 'express';
import * as paymentsController from './payments.controller.js';

const router = express.Router();

router.post('/create-payment-intent', paymentsController.createPaymentIntent);
router.get('/movements/:userId', paymentsController.getMovements);
router.post('/pagar-pasaje', paymentsController.transferToDriver);
router.post('/retirar-saldo', paymentsController.simulateWithdraw);

export default router;
