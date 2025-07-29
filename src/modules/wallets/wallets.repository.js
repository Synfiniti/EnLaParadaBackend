import db from '../../db/index.js';

export const getWalletByUserId = async (idUsuario) => {
  const { rows } = await db.query('SELECT id_billetera FROM wallets WHERE id_usuario = $1', [
    idUsuario,
  ]);
  return rows[0]; // undefined si no existe
};
