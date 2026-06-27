import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  INTERNAL_API_KEY: Joi.string().min(16).required(),
  CORS_ORIGINS: Joi.string().allow('').default(''),
  TRUST_PROXY_HOPS: Joi.number().default(1),
});
