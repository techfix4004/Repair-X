/**
 * Production Environment Configuration
 * 
 * Validates and provides type-safe access to environment variables
 * Essential for production deployment and security.
 */

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  RATE_LIMIT_ENABLED: boolean;
  SECURITY_HEADERS_ENABLED: boolean;
  HTTPS_ONLY: boolean;
}

class EnvironmentValidator {
  private static config: EnvironmentConfig | null = null;

  static validate(): EnvironmentConfig {
    if (this.config) {
      return this.config;
    }

    const errors: string[] = [];

    // Required environment variables
    const NODE_ENV = process.env.NODE_ENV || 'development';
    if (!['development', 'production', 'test'].includes(NODE_ENV)) {
      errors.push('NODE_ENV must be development, production, or test');
    }

    const PORT = parseInt(process.env.PORT || '3001');
    if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
      errors.push('PORT must be a valid port number (1-65535)');
    }

    const HOST = process.env.HOST || '0.0.0.0';

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      errors.push('JWT_SECRET is required');
    } else if (JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }

    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

    const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

    const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'warn' : 'info');
    if (!['error', 'warn', 'info', 'debug'].includes(LOG_LEVEL)) {
      errors.push('LOG_LEVEL must be error, warn, info, or debug');
    }

    const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED !== 'false';
    const SECURITY_HEADERS_ENABLED = process.env.SECURITY_HEADERS_ENABLED !== 'false';
    const HTTPS_ONLY = process.env.HTTPS_ONLY === 'true' || NODE_ENV === 'production';

    // Production-specific validations
    if (NODE_ENV === 'production') {
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'repairx-production-secret-key-2024') {
        errors.push('JWT_SECRET must be changed from default value in production');
      }

      if (CORS_ORIGIN === '*') {
        errors.push('CORS_ORIGIN should not be * in production');
      }

      if (!HTTPS_ONLY) {
        errors.push('HTTPS_ONLY should be enabled in production');
      }
    }

    if (errors.length > 0) {
      console.error('❌ Environment configuration errors:');
      errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    this.config = {
      NODE_ENV: NODE_ENV as EnvironmentConfig['NODE_ENV'],
      PORT,
      HOST,
      JWT_SECRET: JWT_SECRET!,
      JWT_EXPIRES_IN,
      CORS_ORIGIN,
      LOG_LEVEL: LOG_LEVEL as EnvironmentConfig['LOG_LEVEL'],
      RATE_LIMIT_ENABLED,
      SECURITY_HEADERS_ENABLED,
      HTTPS_ONLY
    };

    console.log('✅ Environment configuration validated successfully');
    if (NODE_ENV === 'development') {
      console.log('🔧 Development mode - some security features relaxed');
    }

    return this.config;
  }

  static get(): EnvironmentConfig {
    if (!this.config) {
      return this.validate();
    }
    return this.config;
  }
}

export const env = EnvironmentValidator.validate();
export { EnvironmentValidator };