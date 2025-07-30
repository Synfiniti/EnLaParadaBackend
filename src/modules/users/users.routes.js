import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ErrorWithStatus } from '../../utils/errorTypes.js';
import {
  createPassengerSchema,
  createDriverSchema,
  loginUserRouteSchema,
  updateDriverExtraDataSchema,
} from './users.routes.schemas.js';
import usersRepository from './users.repository.js';
import { upload } from '../../middlewares/uploadMiddleware.js';
import db from '../../db/index.js';
import { sendVerificationEmail } from '../../utils/emailService.js';

const usersRouter = express.Router();

// Registro de pasajero POST
usersRouter.post('/signup/passenger', async (req, res, next) => {
  try {
    const body = createPassengerSchema.body.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 10);

    const newUser = await usersRepository.addOne({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      passwordHash,
      rol: 'pasajero',
    });

    res.status(201).json({
      message: 'Pasajero registrado correctamente.',
      user: {
        id: newUser.id_usuario,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Registro de conductor POST
usersRouter.post('/signup/driver', async (req, res, next) => {
  try {
    const body = createDriverSchema.body.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 10);

    const newUser = await usersRepository.addOne({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      passwordHash,
      rol: 'conductor',
      cedula: body.cedula,
      telefono: body.telefono,
      placa_vehiculo: body.placa_vehiculo,
      carnet_circulacion: body.carnet_circulacion,
      foto_perfil: body.foto_perfil,
    });

    res.status(201).json({
      message: 'Conductor registrado correctamente.',
      user: {
        id: newUser.id_usuario,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    next(error);
  }
});

//Informacion extra del conductor PATCH, segunda parte del form de conductor

usersRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = updateDriverExtraDataSchema.body.parse(req.body);

    const updatedUser = await usersRepository.updateDriverExtraData(Number(id), {
      cedula: body.cedula,
      telefono: body.telefono,
      placa_vehiculo: body.placa_vehiculo,
      carnet_circulacion: body.carnet_circulacion,
      foto_perfil: body.foto_perfil ?? null,
    });

    res.status(200).json({
      message: 'Datos del conductor actualizados.',
      user: {
        id: updatedUser.id_usuario,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        rol: updatedUser.rol,
        cedula: updatedUser.cedula,
        telefono: updatedUser.telefono,
        placa_vehiculo: updatedUser.placa_vehiculo,
        carnet_circulacion: updatedUser.carnet_circulacion,
        foto_perfil: updatedUser.foto_perfil,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login POST
usersRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginUserRouteSchema.body.parse(req.body);
    const user = await usersRepository.findByEmail(body.email);

    if (!user) {
      return next(new ErrorWithStatus('Contrasena o correo incorrectos', 401));
    }

    const passwordMatch = await bcrypt.compare(body.password, user.password);
    if (!passwordMatch) {
      return next(new ErrorWithStatus('Contrasena o correo incorrectos', 401));
    }

    const token = jwt.sign(
      { userId: user.id_usuario, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id_usuario,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/wallet
usersRouter.get('/:id/wallet', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const result = await usersRepository.findUserWithWallet(id);

    res.status(200).json({
      user: {
        first_name: result.first_name,
        saldo: result.saldo,
        foto_perfil: result.foto_perfil,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET profile
usersRouter.get('/:id/profile', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const user = await usersRepository.findUserProfileById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

// PATCH perfil

usersRouter.patch('/:id/profile', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { first_name, last_name, cedula, telefono, foto_perfil } = req.body;

    const updatedUser = await usersRepository.updateUserProfileById(id, {
      first_name,
      last_name,
      cedula,
      telefono,
      foto_perfil,
    });

    res.status(200).json({
      message: 'Perfil actualizado correctamente',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id
usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const deletedUser = await usersRepository.deleteById(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado o ya eliminado' });
    }

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

// POST para subir foto
usersRouter.post('/:id/upload-profile', upload.single('foto'), async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió ninguna imagen.' });
    }

    const imageUrl = `https://enlaparadabackend.onrender.com/uploads/${req.file.filename}`;

    // Solo actualiza foto_perfil
    await db.query('UPDATE users SET foto_perfil = $1 WHERE id_usuario = $2', [imageUrl, userId]);

    res.status(200).json({ message: 'Foto de perfil actualizada', url: imageUrl });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ message: 'Error al subir imagen.' });
  }
});

// POST para enviar el codigo de verificacion
usersRouter.post('/:id/send-verification-code', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // código aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar el código en la base de datos
    await usersRepository.updateUserVerificationCode(id, code);

    // Obtener el correo del usuario
    const user = await usersRepository.findUserById(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Enviar el correo
    await sendVerificationEmail(user.email, code);

    res.status(200).json({ message: 'Código enviado por correo' });
  } catch (error) {
    next(error);
  }
});

// POST para verificar
usersRouter.post('/verify', async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await usersRepository.findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.verification_code !== code) {
      return res.status(400).json({ message: 'Código incorrecto' });
    }

    const now = new Date();
    if (new Date(user.verification_code_expires) < now) {
      return res.status(400).json({ message: 'El código ha expirado' });
    }

    await usersRepository.verifyUser(user.id_usuario);

    res.status(200).json({ message: 'Correo verificado correctamente' });
  } catch (error) {
    next(error);
  }
});

// POST para subir carnet de circulación
usersRouter.post('/:id/upload-carnet', upload.single('carnet'), async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió ninguna imagen.' });
    }

    const imageUrl = `https://enlaparadabackend.onrender.com/uploads/uploads/${req.file.filename}`;

    // Opcional: guardar directamente en la DB
    await db.query('UPDATE users SET carnet_circulacion = $1 WHERE id_usuario = $2', [
      imageUrl,
      userId,
    ]);

    res.status(200).json({ message: 'Carnet de circulación subido', url: imageUrl });
  } catch (error) {
    console.error('Error al subir carnet:', error);
    res.status(500).json({ message: 'Error al subir carnet.' });
  }
});

export default usersRouter;
