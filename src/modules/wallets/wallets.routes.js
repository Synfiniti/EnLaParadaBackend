import express from 'express';
import { obtenerBilleteraPorUsuario } from './wallets.controller.js';

const router = express.Router();

router.get('/billetera/:id_usuario', obtenerBilleteraPorUsuario);

export default router;
