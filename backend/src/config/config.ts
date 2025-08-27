import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  PORT: parseInt(process.env['PORT'] || '3001', 10),
  HOST: process.env['HOST'] || '0.0.0.0',

  // Database
  DATABASE_URL: process.env['DATABASE_URL'] || 'postgresql://repairx_user:repairxpassword@localhost:5432/repairx_db?schema=public',

  // JWT
  JWT_SECRET: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] || '24h',

  // SaaS Admin Security
  SAAS_ADMIN_KEY: process.env['SAAS_ADMIN_KEY'] || 'change-this-saas-admin-key-in-production',
  MASTER_INIT_KEY: process.env['MASTER_INIT_KEY'] || 'change-this-master-init-key-in-production',

  // Redis
  REDIS_URL: process.env['REDIS_URL'] || 'redis://localhost:6379',

  // Local Storage Configuration
  LOCAL_STORAGE_PATH: process.env['LOCAL_STORAGE_PATH'] || '/app/uploads',
  LOCAL_STORAGE_BASE_URL: process.env['LOCAL_STORAGE_BASE_URL'] || 'http://localhost:3001/uploads',
  LOCAL_STORAGE_MAX_SIZE: parseInt(process.env['LOCAL_STORAGE_MAX_SIZE'] || '104857600', 10), // 100MB default
  LOCAL_STORAGE_ALLOWED_TYPES: process.env['LOCAL_STORAGE_ALLOWED_TYPES'] || 'image/*,application/pdf,text/*',

  // Stripe
  STRIPE_SECRET_KEY: process.env['STRIPE_SECRET_KEY'] || '',
  STRIPE_WEBHOOK_SECRET: process.env['STRIPE_WEBHOOK_SECRET'] || '',

  // Email
  SMTP_HOST: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env['SMTP_PORT'] || '587', 10),
  SMTP_USER: process.env['SMTP_USER'] || '',
  SMTP_PASS: process.env['SMTP_PASS'] || '',

  // Frontend URL for invitation links
  FRONTEND_URL: process.env['FRONTEND_URL'] || 'http://localhost:3000',

  // Logging
  LOG_LEVEL: process.env['LOG_LEVEL'] || 'info',

  // Rate Limiting
  RATE_LIMIT_MAX: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10),
  RATE_LIMIT_TIMEWINDOW: parseInt(process.env['RATE_LIMIT_TIMEWINDOW'] || '60000', 10),

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env['MAX_FILE_SIZE'] || '10485760', 10), // 10MB
  MAX_FILES_COUNT: parseInt(process.env['MAX_FILES_COUNT'] || '5', 10),

  // Six Sigma Quality Metrics
  QUALITY_DEFECT_RATE_TARGET: 3.4, // DPMO
  QUALITY_CP_TARGET: 1.33,
  QUALITY_CPK_TARGET: 1.33,
  QUALITY_CSAT_TARGET: 95, // percentage
  QUALITY_NPS_TARGET: 70,
} as const;