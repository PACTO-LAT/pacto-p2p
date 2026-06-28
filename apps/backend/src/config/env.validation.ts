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
  REPUTATION_W_COMPLETION: Joi.number().default(1.0),
  REPUTATION_W_DISPUTE: Joi.number().default(1.5),
  REPUTATION_SMOOTHING_K: Joi.number().positive().default(8),
  REPUTATION_NEUTRAL: Joi.number().min(0).max(1).default(0.6),
  REPUTATION_RECENCY_DAYS: Joi.number().default(90),
  REPUTATION_DECAY: Joi.number().min(0).max(1).default(0.9),
  REPUTATION_VOLUME_WEIGHT: Joi.number().min(0).max(1).default(0.05),
  REPUTATION_VOLUME_SAT: Joi.number().positive().default(10000),
  CRON_ENABLED: Joi.boolean().default(true),
  RECONCILE_CRON: Joi.string().default('0 3 * * *'),
  DISPUTE_SLA_CRON: Joi.string().default('0 * * * *'),
  DISPUTE_SLA_HOURS: Joi.number().positive().default(48),
  TLW_API_KEY: Joi.string().allow('').default(''),
  TLW_NETWORK: Joi.string().valid('testnet', 'mainnet').default('testnet'),
  PLATFORM_ROLE_ADDRESS: Joi.string().allow('').default(''),
  ESCROW_INDEX_CRON: Joi.string().default('*/2 * * * *'),
  RESEND_API_KEY: Joi.string().allow('').default(''),
  EMAIL_FROM: Joi.string().default('Pacto <no-reply@pacto.app>'),
});
