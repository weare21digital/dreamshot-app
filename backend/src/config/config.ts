import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  // Server
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string(),

  // JWT
  JWT_SECRET: z.string().default('your-secret-key'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('your-refresh-secret-key'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Email
  RESEND_API_KEY: z.string().default(''),
  EMAIL_FROM: z.string().optional(),
  EMAIL_DEV_MODE: z.string().optional().default('false'),
  EMAIL_HEADER_COLOR: z.string().optional().default('#0d6efd'),
  EMAIL_LOGO_URL: z.string().optional(),

  // App
  APP_NAME: z.string().default('Mobile App'),
  APP_URL: z.string().default('http://localhost:3000'),
  FRONTEND_URL: z.string().default('http://localhost:8081'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),

  // IAP Verification
  APPLE_SHARED_SECRET: z.string().optional(),
  APPLE_BUNDLE_ID: z.string().optional(),
  GOOGLE_PACKAGE_NAME: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT: z.string().optional(),

  // AI / OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_IMAGE_MODEL: z.string().optional(),
  FAL_API_KEY: z.string().optional(),
  FAL_IMAGE_MODEL: z.string().optional(),
  FAL_VIDEO_MODEL: z.string().optional(),
  IMAGE_BACKEND: z.enum(['fal', 'openai', 'rollout']).optional(),
  GPT_IMAGE_PERCENTAGE: z.coerce.number().min(0).max(100).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

const env = parsed.data;

export const environmentConfig = {
  // Server
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',

  // Database
  databaseUrl: env.DATABASE_URL,

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  // Email
  email: {
    apiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM || 'noreply@example.com',
    devMode: env.EMAIL_DEV_MODE === 'true',
    headerColor: env.EMAIL_HEADER_COLOR,
    logoUrl: env.EMAIL_LOGO_URL,
  },

  // App
  app: {
    name: env.APP_NAME,
    url: env.APP_URL,
    frontendUrl: env.FRONTEND_URL,
  },

  // Google OAuth
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
  },

  // IAP Verification
  iap: {
    appleSharedSecret: env.APPLE_SHARED_SECRET,
    appleBundleId: env.APPLE_BUNDLE_ID,
    googlePackageName: env.GOOGLE_PACKAGE_NAME,
    googleServiceAccount: env.GOOGLE_SERVICE_ACCOUNT,
  },

  // AI / OpenAI
  openai: {
    apiKey: env.OPENAI_API_KEY,
    imageModel: env.OPENAI_IMAGE_MODEL,
  },
  fal: {
    apiKey: env.FAL_API_KEY,
    imageModel: env.FAL_IMAGE_MODEL,
    videoModel: env.FAL_VIDEO_MODEL,
  },
  imageRouting: {
    backend: env.IMAGE_BACKEND || 'openai',
    gptImagePercentage: env.GPT_IMAGE_PERCENTAGE ?? 100,
  },
} as const;

export type EnvironmentConfig = typeof environmentConfig;
