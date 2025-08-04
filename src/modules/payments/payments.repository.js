import db from '../../db/index.js';

//añadir fondos wallet
export const addFundsToWallet = async (userId, amount, description = 'Recarga') => {
  try {
    // Iniciar transacción
    await db.query('BEGIN');

    // Buscar la billetera del usuario
    const { rows: wallets } = await db.query('SELECT * FROM wallets WHERE id_usuario = $1', [
      userId,
    ]);
    if (wallets.length === 0) throw new Error('Billetera no encontrada');

    const wallet = wallets[0];

    // Actualizar el saldo
    const nuevoSaldo = Number(wallet.saldo) + Number(amount);
    await db.query('UPDATE wallets SET saldo = $1 WHERE id_billetera = $2', [
      nuevoSaldo,
      wallet.id_billetera,
    ]);

    // Registrar movimiento
    await db.query(
      `INSERT INTO motion_wallets (id_billetera, tipo_movimiento, monto, descripcion, fecha)
       VALUES ($1, $2, $3, $4, NOW())`,
      [wallet.id_billetera, 'entrada', amount, description],
    );

    // Confirmar transacción
    await db.query('COMMIT');
  } catch (error) {
    // Revertir transacción en caso de error
    await db.query('ROLLBACK');
    throw error;
  }
};

//obtener motion_wallets
export const getWalletMovements = async (userId) => {
  const { rows: wallets } = await db.query(
    'SELECT id_billetera FROM wallets WHERE id_usuario = $1',
    [userId],
  );

  if (wallets.length === 0) throw new Error('Billetera no encontrada');

  const walletId = wallets[0].id_billetera;

  const { rows: movements } = await db.query(
    `SELECT id_movimiento, tipo_movimiento, monto, descripcion, fecha
     FROM motion_wallets
     WHERE id_billetera = $1
     ORDER BY fecha DESC`,
    [walletId],
  );

  return movements;
};

// transferir saldo a conductor
export const transferToDriverWallet = async (idPasajero, idBilleteraConductor, monto) => {
  try {
    await db.query('BEGIN');

    // Obtener billetera del pasajero
    const { rows: pasajeroWalletRows } = await db.query(
      'SELECT * FROM wallets WHERE id_usuario = $1',
      [idPasajero],
    );
    if (pasajeroWalletRows.length === 0) {
      throw new Error('Billetera del pasajero no encontrada');
    }

    const billeteraPasajero = pasajeroWalletRows[0];
    if (parseFloat(billeteraPasajero.saldo) < parseFloat(monto)) {
      throw new Error('Saldo insuficiente del pasajero');
    }

    // Descontar saldo
    const nuevoSaldoPasajero = parseFloat(billeteraPasajero.saldo) - parseFloat(monto);
    await db.query('UPDATE wallets SET saldo = $1 WHERE id_billetera = $2', [
      nuevoSaldoPasajero,
      billeteraPasajero.id_billetera,
    ]);
    await db.query(
      `INSERT INTO motion_wallets (id_billetera, tipo_movimiento, monto, descripcion, fecha)
       VALUES ($1, 'salida', $2, $3, NOW())`,
      [billeteraPasajero.id_billetera, monto, 'Pago de pasaje'],
    );

    // Obtener y actualizar billetera del conductor
    const { rows: conductorWalletRows } = await db.query(
      'SELECT * FROM wallets WHERE id_billetera = $1',
      [idBilleteraConductor],
    );
    if (conductorWalletRows.length === 0) {
      throw new Error('Billetera del conductor no encontrada');
    }

    const billeteraConductor = conductorWalletRows[0];
    const nuevoSaldoConductor = parseFloat(billeteraConductor.saldo) + parseFloat(monto);

    await db.query('UPDATE wallets SET saldo = $1 WHERE id_billetera = $2', [
      nuevoSaldoConductor,
      idBilleteraConductor,
    ]);
    await db.query(
      `INSERT INTO motion_wallets (id_billetera, tipo_movimiento, monto, descripcion, fecha)
       VALUES ($1, 'entrada', $2, $3, NOW())`,
      [idBilleteraConductor, monto, 'Recepción de pasaje'],
    );

    //  Obtener nombre del conductor
    const { rows: conductorInfoRows } = await db.query(
      `SELECT u.first_name
       FROM users u
       JOIN wallets w ON u.id_usuario = w.id_usuario
       WHERE w.id_billetera = $1`,
      [idBilleteraConductor],
    );

    if (conductorInfoRows.length === 0) {
      throw new Error('No se encontró información del conductor');
    }

    const nombreConductor = conductorInfoRows[0].first_name;
    const fechaPago = new Date().toISOString();

    await db.query('COMMIT');
    return { monto, nombreConductor, fechaPago }; //esto se devolverá al controller
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
};

// Simular retiro de saldo de un conductor
export const simulateWithdrawFromWallet = async (userId, amount) => {
  try {
    await db.query('BEGIN');

    // Obtener billetera del conductor
    const { rows: walletRows } = await db.query('SELECT * FROM wallets WHERE id_usuario = $1', [
      userId,
    ]);
    if (walletRows.length === 0) throw new Error('Billetera no encontrada');

    const wallet = walletRows[0];

    if (parseFloat(wallet.saldo) < parseFloat(amount)) {
      throw new Error('Saldo insuficiente');
    }

    // Restar saldo
    const nuevoSaldo = parseFloat(wallet.saldo) - parseFloat(amount);
    await db.query('UPDATE wallets SET saldo = $1 WHERE id_billetera = $2', [
      nuevoSaldo,
      wallet.id_billetera,
    ]);

    // Registrar movimiento de salida
    await db.query(
      `INSERT INTO motion_wallets (id_billetera, tipo_movimiento, monto, descripcion, fecha)
       VALUES ($1, 'salida', $2, $3, NOW())`,
      [wallet.id_billetera, amount, 'Retiro simulado'],
    );

    await db.query('COMMIT');
    return { saldo_restante: nuevoSaldo };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
};
