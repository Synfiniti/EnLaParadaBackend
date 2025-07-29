import db from '../../db/index.js';

const addOne = async (payload) => {
  // inserta al usuario según el rol
  const userResponse = await db.query(
    `
    INSERT INTO users (
      first_name, last_name, email, password,
      rol, cedula, telefono, placa_vehiculo,
      carnet_circulacion, foto_perfil
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
    `,
    [
      payload.first_name,
      payload.last_name,
      payload.email,
      payload.passwordHash,
      payload.rol, // 'pasajero' o 'conductor'
      payload.cedula || null,
      payload.telefono || null,
      payload.placa_vehiculo || null,
      payload.carnet_circulacion || null,
      payload.foto_perfil || null,
    ],
  );

  const newUser = userResponse.rows[0];
  const userId = newUser.id_usuario;

  // la billetera
  const walletResponse = await db.query(
    `
    INSERT INTO wallets (id_usuario, saldo)
    VALUES ($1, $2)
    RETURNING *
    `,
    [userId, 0],
  );

  const newWallet = walletResponse.rows[0];

  // movimiento inicial
  await db.query(
    `
    INSERT INTO motion_wallets (id_billetera, tipo_movimiento, monto, descripcion)
    VALUES ($1, $2, $3, $4)
    `,
    [newWallet.id_billetera, 'entrada', 0, 'Billetera creada'],
  );

  return {
    ...newUser,
    wallet: newWallet,
  };
};

const findByEmail = async (email) => {
  const response = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return response.rows[0];
};

const updateDriverExtraData = async (id, data) => {
  const result = await db.query(
    `UPDATE users
     SET cedula = $1,
         telefono = $2,
         placa_vehiculo = $3,
         carnet_circulacion = $4,
         foto_perfil = $5
     WHERE id_usuario = $6
     RETURNING *`,
    [
      data.cedula,
      data.telefono,
      data.placa_vehiculo,
      data.carnet_circulacion,
      data.foto_perfil,
      id,
    ],
  );
  return result;
};

const findUserWithWallet = async (id_usuario) => {
  const query = `
    SELECT u.first_name, u.foto_perfil, w.saldo
    FROM users u
    JOIN wallets w ON u.id_usuario = w.id_usuario
    WHERE u.id_usuario = $1
  `;
  const { rows } = await db.query(query, [id_usuario]);
  return rows[0];
};

const findUserProfileById = async (id_usuario) => {
  const query = `
    SELECT first_name, last_name, email, cedula, telefono, foto_perfil
    FROM users
    WHERE id_usuario = $1
  `;
  const { rows } = await db.query(query, [id_usuario]);
  return rows[0];
};

const updateUserProfileById = async (id_usuario, data) => {
  const fields = [];
  const values = [];

  let index = 1;

  for (const key in data) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(data[key]);
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No se enviaron datos para actualizar');
  }

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id_usuario = $${index}
    RETURNING *;
  `;

  values.push(id_usuario);

  const { rows } = await db.query(query, values);
  return rows[0];
};

const deleteById = async (id_usuario) => {
  // eliminar movimientos
  await db.query(
    'DELETE FROM motion_wallets WHERE id_billetera IN (SELECT id_billetera FROM wallets WHERE id_usuario = $1)',
    [id_usuario],
  );

  // Eliminar billetera
  await db.query('DELETE FROM wallets WHERE id_usuario = $1', [id_usuario]);

  // Eliminar usuario
  const result = await db.query('DELETE FROM users WHERE id_usuario = $1 RETURNING *', [
    id_usuario,
  ]);
  return result.rows[0];
};

const updateUserVerificationCode = async (id_usuario, code) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos desde ahora

  const query = `
    UPDATE users
    SET verification_code = $1,
        verification_code_expires = $2
    WHERE id_usuario = $3
  `;
  await db.query(query, [code, expiresAt, id_usuario]);
};

const findUserById = async (id_usuario) => {
  const { rows } = await db.query(`SELECT * FROM users WHERE id_usuario = $1`, [id_usuario]);
  return rows[0];
};

const verifyUser = async (id_usuario) => {
  const query = `
    UPDATE users
    SET is_verified = true,
        verification_code = null,
        verification_code_expires = null
    WHERE id_usuario = $1
  `;
  await db.query(query, [id_usuario]);
};

const findUserByEmail = async (email) => {
  const { rows } = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return rows[0];
};

const usersRepository = {
  addOne,
  findByEmail,
  updateDriverExtraData,
  findUserWithWallet,
  findUserProfileById,
  updateUserProfileById,
  deleteById,
  updateUserVerificationCode,
  findUserById,
  verifyUser,
  findUserByEmail,
};

export default usersRepository;
