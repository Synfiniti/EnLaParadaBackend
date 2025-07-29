import { z } from 'zod/v4';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

// Validacion pasajero
export const createPassengerSchema = {
  body: z.object({
    first_name: z.string().min(1, 'Nombre requerido'),
    last_name: z.string().min(1, 'Apellido requerido'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .regex(PASSWORD_REGEX, 'Mínimo 6 caracteres, 1 letra, 1 número y 1 símbolo'),
  }),
};

// Validacion conductor
export const createDriverSchema = {
  body: z.object({
    first_name: z.string().min(1, 'Nombre requerido'),
    last_name: z.string().min(1, 'Apellido requerido'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .regex(PASSWORD_REGEX, 'Mínimo 6 caracteres, 1 letra, 1 número y 1 símbolo'),
  }),
};

// Validacion para la info extra del condcutor
export const updateDriverExtraDataSchema = {
  body: z.object({
    cedula: z.string().min(1, 'La cédula es obligatoria.'),
    telefono: z.string().min(1, 'El teléfono es obligatorio.'),
    placa_vehiculo: z.string().min(1, 'La placa es obligatoria.'),
    carnet_circulacion: z.string().min(1, 'El carnet de circulación es obligatorio.'),
    foto_perfil: z.string().optional(), // opcional
  }),
};

// Validacion para el login
export const loginUserRouteSchema = {
  body: z.object({
    email: z.string().email('Email inválido.').min(1, 'Email es requerido.'),
    password: z.string().min(1, 'Contraseña es requerida.'),
  }),
};
