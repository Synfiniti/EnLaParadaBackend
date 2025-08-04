import express from 'express';
import * as paymentsController from './payments.controller.js';

const router = express.Router();

router.post('/create-payment-intent', paymentsController.createPaymentIntent);
router.get('/movements/:userId', paymentsController.getMovements);
router.post('/pagar-pasaje', paymentsController.transferToDriver);
router.post('/retirar-saldo', paymentsController.simulateWithdraw);
router.post('/simular-deposito', paymentsController.simulateDeposit);
router.post('/recargar-saldo', paymentsController.simulateTopUp);

export default router;
