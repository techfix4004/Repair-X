// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { tracer } from '../observability/metrics';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  refreshToken?: string;
  refreshTokenExpiry?: Date;
  lastLogin?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
}

// Enhanced JWT with refresh tokens
export class AuthService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access tokens
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'; // Longer-lived refresh tokens
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Mock user database - in production, this would be in the actual database
  private static _users: Map<string, User> = new Map([
    ['admin@repairx.com', {
      _id: '1',
      _email: 'admin@repairx.com',
      _name: 'Admin User',
      _role: 'admin',
      _twoFactorEnabled: false,
      _failedLoginAttempts: 0
    } as User],
    ['technician@repairx.com', {
      _id: '2',
      _email: 'technician@repairx.com',
      _name: 'Technician User',
      _role: 'technician',
      _twoFactorEnabled: false,
      _failedLoginAttempts: 0
    } as User],
  ]);

  static async authenticateUser(_email: string, password: string, totp?: string): Promise<{ _user: User; accessToken: string; refreshToken: string } | null> {
    const span = tracer.startSpan('authenticate_user');
    
    try {
      const user = this.users.get(email);
      if (!user) {
        businessMetrics.failedLogins.labels('unknown', 'password').inc();
        span.setAttributes({ 'auth.result': 'user_not_found' });
        return null;
      }

      // Check if account is locked
      if (user.lockedUntil && new Date() < user.lockedUntil) {
        businessMetrics.failedLogins.labels(email, 'account_locked').inc();
        span.setAttributes({ 'auth.result': 'account_locked' });
        return null;
      }

      // Validate password (in production, use bcrypt)
      if (!this.validatePassword(password, user)) {
        user.failedLoginAttempts++;
        
        if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
          user.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
          businessMetrics.failedLogins.labels(email, 'max_attempts').inc();
        } else {
          businessMetrics.failedLogins.labels(email, 'invalidpassword').inc();
        }
        
        span.setAttributes({ 
          'auth.result': 'invalidpassword',
          'auth.failed_attempts': user.failedLoginAttempts 
        });
        return null;
      }

      // Check 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!totp || !this.verifyTOTP(user, totp)) {
          businessMetrics.failedLogins.labels(email, 'invalid_totp').inc();
          span.setAttributes({ 'auth.result': 'invalid_totp' });
          return null;
        }
      }

      // Reset failed attempts on successful login
      user.failedLoginAttempts = 0;
      user.lockedUntil = undefined;
      user.lastLogin = new Date();

      // Generate tokens
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);
      
      user.refreshToken = refreshToken;
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      span.setAttributes({
        'auth.result': 'success',
        'auth.user_id': user.id,
        'auth.user_role': user.role,
        'auth.2fa_enabled': user.twoFactorEnabled
      });

      return { user, accessToken, refreshToken };
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: 'Authentication failed' });
      throw error;
    } finally {
      span.end();
    }
  }

  static async refreshAccessToken(_refreshToken: string): Promise<{ _accessToken: string; refreshToken: string } | null> {
    const span = tracer.startSpan('refresh_access_token');
    
    try {
      // Find user by refresh token
      const user = Array.from(this.users.values()).find(u => u.refreshToken === refreshToken);
      
      if (!user || !user.refreshTokenExpiry || new Date() > user.refreshTokenExpiry) {
        span.setAttributes({ 'refresh.result': 'invalid_token' });
        return null;
      }

      // Generate new tokens
      const newAccessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);
      
      user.refreshToken = newRefreshToken;
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      span.setAttributes({
        'refresh.result': 'success',
        'refresh.user_id': user.id
      });

      return { _accessToken: newAccessToken, _refreshToken: newRefreshToken };
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: 'Token refresh failed' });
      throw error;
    } finally {
      span.end();
    }
  }

  // TOTP 2FA Implementation
  static async setup2FA(_userId: string): Promise<{ _secret: string; qrCode: string } | null> {
    const span = tracer.startSpan('setup_2fa');
    
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (!user) {
        span.setAttributes({ 'setup_2fa.result': 'user_not_found' });
        return null;
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        _name: user.email,
        _issuer: 'RepairX',
        _length: 32
      });

      // Store secret (temporarily, until verified)
      user.twoFactorSecret = secret.base32;

      // Generate QR code
      const qrCodeUrl = speakeasy.otpauthURL({
        _secret: secret.base32,
        _label: user.email,
        _issuer: 'RepairX',
        _encoding: 'base32'
      });

      const qrCode = await QRCode.toDataURL(qrCodeUrl);

      span.setAttributes({
        'setup_2fa.result': 'success',
        'setup_2fa.user_id': userId
      });

      return {
        _secret: secret.base32,
        qrCode
      };
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: '2FA setup failed' });
      throw error;
    } finally {
      span.end();
    }
  }

  static async verify2FA(_userId: string, _token: string): Promise<boolean> {
    const span = tracer.startSpan('verify_2fa');
    
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (!user || !user.twoFactorSecret) {
        span.setAttributes({ 'verify_2fa.result': 'invalid_setup' });
        return false;
      }

      const verified = speakeasy.totp.verify({
        _secret: user.twoFactorSecret,
        _encoding: 'base32',
        _token: token,
        _window: 2 // Allow some time drift
      });

      if (verified) {
        user.twoFactorEnabled = true;
        span.setAttributes({
          'verify_2fa.result': 'success',
          'verify_2fa.user_id': userId
        });
      } else {
        span.setAttributes({ 'verify_2fa.result': 'invalid_token' });
      }

      return verified;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: '2FA verification failed' });
      throw error;
    } finally {
      span.end();
    }
  }

  static async disable2FA(_userId: string, _token: string): Promise<boolean> {
    const span = tracer.startSpan('disable_2fa');
    
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (!user || !user.twoFactorEnabled) {
        span.setAttributes({ 'disable_2fa.result': 'not_enabled' });
        return false;
      }

      // Verify current TOTP token before disabling
      const verified = this.verifyTOTP(user, token);
      if (!verified) {
        span.setAttributes({ 'disable_2fa.result': 'invalid_token' });
        return false;
      }

      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;

      span.setAttributes({
        'disable_2fa.result': 'success',
        'disable_2fa.user_id': userId
      });

      return true;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: '2FA disable failed' });
      throw error;
    } finally {
      span.end();
    }
  }

  // Helper methods
  private static validatePassword(password: string, _user: User): boolean {
    // Mock password validation - in production, use bcrypt
    const _mockPasswords: { [key: string]: string } = {
      'admin@repairx.com': 'admin123',
      'technician@repairx.com': 'tech123'
    };
    return mockPasswords[user.email] === password;
  }

  private static verifyTOTP(_user: User, _token: string): boolean {
    if (!user.twoFactorSecret) return false;
    
    return speakeasy.totp.verify({
      _secret: user.twoFactorSecret,
      _encoding: 'base32',
      _token: token,
      _window: 2
    });
  }

  private static async generateAccessToken(_user: User): Promise<string> {
    // Mock JWT generation - in production, use proper JWT library
    return `access_${user.id}_${Date.now()}`;
  }

  private static async generateRefreshToken(_user: User): Promise<string> {
    // Mock refresh token generation - in production, use secure random generation
    return `refresh_${user.id}_${Date.now()}_${Math.random().toString(36)}`;
  }
}