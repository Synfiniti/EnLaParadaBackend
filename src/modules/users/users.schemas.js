import { z } from 'zod/v4';

export const contactSchema = z.object({
  id: z.number(),
  email: z.email('Tiene que ser un correo valido.'),
  passwordHash: z.string(),
});
