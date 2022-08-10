import * as Joi from 'joi';

// Validamos nuestras variables de entorno
export const JoiValidationSchema = Joi.object({
  MONGODB: Joi.required(), // Es obligatorio mongo sino lanzara un error
  PORT: Joi.number().default(3005), // Si no me facilitan el port entonces apuntara al 3005
  DEFAULT_LIMIT: Joi.number().default(6),
});
