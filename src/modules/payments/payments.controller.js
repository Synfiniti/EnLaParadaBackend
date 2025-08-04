import stripe from '../../utils/stripe.js';
import {
  getWalletMovements,
  simulateWithdrawFromWallet,
  transferToDriverWallet,
  addFundsToWallet,
} from './payments.repository.js';

//intento de pago
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: 'userId y amount son requeridos' });
    }

    // Crear PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe trabaja en centavos
      currency: 'usd',
      metadata: {
        userId: userId.toString(),
      }, //metadata para guardar info extra
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error al crear PaymentIntent:', error);
    next(error);
  }
};

//obtener info de motion_wallets
export const getMovements = async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  if (!userId) return res.status(400).json({ error: 'ID de usuario inválido' });

  try {
    const movements = await getWalletMovements(userId);
    res.json(movements);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

//transferencia pasajero - conductor
export const transferToDriver = async (req, res) => {
  const { id_pasajero, id_billetera_conductor } = req.body;

  if (!id_pasajero || !id_billetera_conductor) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const MONTO_PASAJE = 0.5;

  try {
    const resultado = await transferToDriverWallet(
      id_pasajero,
      id_billetera_conductor,
      MONTO_PASAJE,
    );

    res.status(200).json({
      message: 'Transferencia realizada con éxito',
      monto: resultado.monto,
      nombre_conductor: resultado.nombreConductor,
      fecha_pago: resultado.fechaPago,
    });
    console.log('✅ Resultado:', resultado);
  } catch (error) {
    console.error('Error en la transferencia:', error);
    res.status(500).json({ error: 'Error al realizar la transferencia' });
  }
};

// Simular retiro de saldo de un conductor
export const simulateWithdraw = async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ error: 'userId y amount son requeridos' });
  }

  try {
    const resultado = await simulateWithdrawFromWallet(userId, amount);
    res.status(200).json({
      message: 'Retiro simulado exitosamente',
      saldo_restante: resultado.saldo_restante,
    });
  } catch (error) {
    console.error('Error al simular retiro:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const simulateDeposit = async (req, res) => {
  const { userId, referencia, banco, cedula, monto } = req.body;

  if (!userId || !referencia || !banco || !cedula || !monto) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const descripcion = `Depósito simulado: Ref ${referencia}, Banco ${banco}, Cédula ${cedula}`;
    await addFundsToWallet(userId, monto, descripcion);
    res.status(200).json({ message: 'Depósito simulado exitosamente' });
  } catch (error) {
    console.error('Error al simular depósito:', error);
    res.status(500).json({ error: 'Error al simular el depósito' });
  }
};

export const simulateTopUp = async (req, res) => {
  const { userId, amount, bank, cedula, referencia } = req.body;

  if (!userId || !amount || !bank || !cedula || !referencia) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const descripcion = `Recarga - Banco: ${bank}, Ref: ${referencia}, Cédula: ${cedula}`;
    await addFundsToWallet(userId, amount, descripcion);

    res.status(200).json({ message: 'Recarga exitosa' });
  } catch (error) {
    console.error('Error al recargar saldo:', error.message);
    res.status(500).json({ error: 'Error al recargar saldo' });
  }
};
