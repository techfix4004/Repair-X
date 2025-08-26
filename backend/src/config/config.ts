import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  _NODE_ENV: process.env['NODE_ENV'] || 'development',
  _PORT: parseInt(process.env['PORT'] || '3001', 10),
  _HOST: process.env['HOST'] || '0.0.0.0',

  // Database
  _DATABASE_URL: process.env['DATABASE_URL'] || 'postgresql://repairx_user:repairxpassword@localhost:5432/repairx_db?schema=public',

  // JWT
  _JWT_SECRET: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production',
  _JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '24h',

  // Redis
  _REDIS_URL: process.env['REDIS_URL'] || 'redis://localhost:6379',

  // AWS (DISABLED - Using local storage instead)
  // _AWS_REGION: process.env['AWS_REGION'] || 'us-east-1',
  // _AWS_ACCESS_KEY_ID: process.env['AWS_ACCESS_KEY_ID'] || '',
  // _AWS_SECRET_ACCESS_KEY: process.env['AWS_SECRET_ACCESS_KEY'] || '',
  // _AWS_S3_BUCKET: process.env['AWS_S3_BUCKET'] || 'repairx-uploads',

  // Local Storage Configuration
  _LOCAL_STORAGE_PATH: process.env['LOCAL_STORAGE_PATH'] || '/app/uploads',
  _LOCAL_STORAGE_BASE_URL: process.env['LOCAL_STORAGE_BASE_URL'] || 'http://localhost:3001/uploads',
  _LOCAL_STORAGE_MAX_SIZE: parseInt(process.env['LOCAL_STORAGE_MAX_SIZE'] || '104857600', 10), // 100MB default
  _LOCAL_STORAGE_ALLOWED_TYPES: process.env['LOCAL_STORAGE_ALLOWED_TYPES'] || 'image/*,application/pdf,text/*',

  // Stripe
  _STRIPE_SECRET_KEY: process.env['STRIPE_SECRET_KEY'] || '',
  _STRIPE_WEBHOOK_SECRET: process.env['STRIPE_WEBHOOK_SECRET'] || '',

  // Email
  _SMTP_HOST: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  _SMTP_PORT: parseInt(process.env['SMTP_PORT'] || '587', 10),
  _SMTP_USER: process.env['SMTP_USER'] || '',
  _SMTP_PASS: process.env['SMTP_PASS'] || '',

  // Logging
  _LOG_LEVEL: process.env['LOG_LEVEL'] || 'info',

  // Rate Limiting
  _RATE_LIMIT_MAX: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10),
  _RATE_LIMIT_TIMEWINDOW: parseInt(process.env['RATE_LIMIT_TIMEWINDOW'] || '60000', 10),

  // File Upload
  _MAX_FILE_SIZE: parseInt(process.env['MAX_FILE_SIZE'] || '10485760', 10), // 10MB
  _MAX_FILES_COUNT: parseInt(process.env['MAX_FILES_COUNT'] || '5', 10),

  // Six Sigma Quality Metrics
  _QUALITY_DEFECT_RATE_TARGET: 3.4, // DPMO
  _QUALITY_CP_TARGET: 1.33,
  _QUALITY_CPK_TARGET: 1.33,
  _QUALITY_CSAT_TARGET: 95, // percentage
  _QUALITY_NPS_TARGET: 70,
} as const;