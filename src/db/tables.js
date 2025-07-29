import db from './index.js';

const createUsersTable = async () => {
  await db.query('DROP TABLE IF EXISTS users');

  await db.query(`
  CREATE TABLE users (
      id_usuario SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rol TEXT NOT NULL CHECK (rol IN ('pasajero', 'conductor')),
      cedula TEXT,
      telefono TEXT,
      placa_vehiculo TEXT,
      carnet_circulacion TEXT, -- URL de imagen
      foto_perfil TEXT,        -- URL de imagen
      verification_code TEXT,                          -- Código de verificación
      verification_code_expires TIMESTAMP,             -- Expiración del código
      is_verified BOOLEAN DEFAULT false,               -- ¿Correo verificado?
      fecha_creacion TIMESTAMP DEFAULT NOW()
    )
`);

  console.log('Tabla users creada');
};

const createWalletsTable = async () => {
  await db.query('DROP TABLE IF EXISTS wallets');

  await db.query(`
    CREATE TABLE wallets (
      id_billetera SERIAL PRIMARY KEY,
      id_usuario INT NOT NULL REFERENCES users(id_usuario) ON DELETE CASCADE,
      saldo NUMERIC DEFAULT 0 NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('Tabla wallets creada');
};

const createMotionWalletsTable = async () => {
  await db.query('DROP TABLE IF EXISTS motion_wallets');

  await db.query(`
    CREATE TABLE motion_wallets (
      id_movimiento SERIAL PRIMARY KEY,
      id_billetera INT NOT NULL REFERENCES wallets(id_billetera) ON DELETE CASCADE,
      tipo_movimiento TEXT NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida')),
      monto NUMERIC NOT NULL,
      descripcion TEXT,
      fecha TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('Tabla motion_wallets creada');
};

const createRutasTable = async () => {
  await db.query('DROP TABLE IF EXISTS rutas');

  await db.query(`
    CREATE TABLE rutas (
      id_ruta SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      color TEXT DEFAULT '#0c4899',
      sentido TEXT DEFAULT 'ida-vuelta',
      activa BOOLEAN DEFAULT true
    )
  `);

  console.log('Tabla rutas creada');
};

const createPuntosRutaTable = async () => {
  await db.query('DROP TABLE IF EXISTS puntos_ruta');

  await db.query(`
    CREATE TABLE puntos_ruta (
      id SERIAL PRIMARY KEY,
      id_ruta INT NOT NULL REFERENCES rutas(id_ruta) ON DELETE CASCADE,
      orden INT NOT NULL,
      latitud DOUBLE PRECISION NOT NULL,
      longitud DOUBLE PRECISION NOT NULL
    )
  `);

  console.log('Tabla puntos_ruta creada');
};

const createTables = async () => {
  await createUsersTable();
  await createWalletsTable();
  await createMotionWalletsTable();
  await createRutasTable();
  await createPuntosRutaTable();
  console.log('Todas las tablas fueron creadas correctamente');
  process.exit();
};

createTables();
