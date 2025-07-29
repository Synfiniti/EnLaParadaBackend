import express from 'express';
import { buscarRutas, geocodificarDireccion } from './bus.controller.js';

const router = express.Router();

router.post('/buscar', buscarRutas);
router.post('/geocode', geocodificarDireccion);

export default router;
