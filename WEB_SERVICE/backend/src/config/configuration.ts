import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface CorsConfig {
  origin: string[] | boolean | string;
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

export interface MicrosoftConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
  microsoft: MicrosoftConfig;
  cloudinary: CloudinaryConfig;
}

export default registerAs('app', (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ??
      (() => {
        throw new Error('JWT_SECRET is required');
      })(),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '30d',
  },
  cors: {
    origin: '*', // 👈 Permite cualquier origen
    credentials: false, // 👈 Deshabilita credenciales (necesario si usas '*')
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 horas en segundos (cache de preflight)
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },

  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID ?? '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
    tenantId: process.env.MICROSOFT_TENANT_ID ?? '',
  },
}));
