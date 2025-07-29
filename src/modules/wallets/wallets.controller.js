import { getWalletByUserId } from './wallets.repository.js';

// Obtener id_billetera a partir del id_usuario
export const obtenerBilleteraPorUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  if (!id_usuario) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    const billetera = await getWalletByUserId(id_usuario);

    if (!billetera) {
      return res.status(404).json({ error: 'Billetera no encontrada' });
    }

    res.status(200).json({ id_billetera: billetera.id_billetera });
  } catch (error) {
    console.error('Error al obtener billetera:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
