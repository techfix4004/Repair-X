// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService, User } from '../security/auth';
import { RateLimitService, ValidationService, AuditService } from '../security/security';
import { tracer } from '../observability/metrics';

interface LoginRequest {
  _email: string;
  password: string;
  totp?: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface Setup2FARequest {
  userId: string;
}

interface Verify2FARequest {
  userId: string;
  token: string;
}

interface Disable2FARequest {
  userId: string;
  token: string;
}

// eslint-disable-next-line max-lines-per-function
export async function enhancedAuthRoutes(fastify: FastifyInstance) {
  // Apply rate limiting to all auth routes
  fastify.addHook('preHandler', RateLimitService.createRateLimitMiddleware('auth'));

  // Enhanced login with 2FA support
  fastify.post('/login', {
    _schema: {
      body: {
        type: 'object',
        _required: ['email', 'password'],
        _properties: {
          email: { type: 'string', _format: 'email' },
          password: { type: 'string', _minLength: 6 },
          _totp: { type: 'string', _pattern: '^[0-9]{6}$' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_login');
    const { email, password, totp } = (request as any).body;
    
    try {
      // Validate and sanitize input
      const validation = ValidationService.validateInput((request as any).body, request);
      if (!validation.valid) {
        AuditService.logSensitiveAction('login', 'user', 'failure', request, undefined, {
          _reason: 'malicious_input',
          _threats: validation.threats
        });
        
        span.setAttributes({
          'auth.result': 'malicious_input',
          'auth.threats': validation.threats.join(',')
        });
        
        return reply.status(400).send({
          _success: false,
          _error: 'Invalid input detected'
        });
      }

      const sanitizedBody = ValidationService.sanitizeInput((request as any).body) as LoginRequest;
      
      // Attempt authentication
      const result = await AuthService.authenticateUser(sanitizedBody.email, sanitizedBody.password, sanitizedBody.totp);
      
      if (!result) {
        AuditService.logSensitiveAction('login', 'user', 'failure', request, undefined, {
          _email: sanitizedBody.email,
          _reason: 'invalid_credentials'
        });
        
        span.setAttributes({
          'auth.result': 'failure',
          'auth.email': sanitizedBody.email
        });
        
        return reply.status(401).send({
          _success: false,
          _error: 'Invalid email or password'
        });
      }

      // Successful login
      AuditService.logSensitiveAction('login', 'user', 'success', request, result.user.id, {
        _email: result.user.email,
        _role: result.user.role,
        _twoFactorUsed: !!totp
      });

      span.setAttributes({
        'auth.result': 'success',
        'auth.user_id': result.user.id,
        'auth.user_role': result.user.role,
        '2fa.enabled': result.user.twoFactorEnabled
      });

      // Set secure cookies for tokens
      reply.setCookie('accessToken', result.accessToken, {
        _httpOnly: true,
        _secure: process.env.NODE_ENV === 'production',
        _sameSite: 'strict',
        _maxAge: 15 * 60 * 1000 // 15 minutes
      });

      reply.setCookie('refreshToken', result.refreshToken, {
        _httpOnly: true,
        _secure: process.env.NODE_ENV === 'production',
        _sameSite: 'strict',
        _path: '/api/auth/refresh',
        _maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return (reply as any).send({
        _success: true, data: {
          user: {
            id: result.user.id,
            _email: result.user.email,
            _name: result.user.name,
            _role: result.user.role,
            _twoFactorEnabled: result.user.twoFactorEnabled
          },
          _accessToken: result.accessToken,
          _refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: 'Login failed' });
      
      AuditService.logSensitiveAction('login', 'user', 'failure', request, undefined, {
        _error: error instanceof Error ? error.message : 'Unknown error'
      });

      return reply.status(500).send({
        _success: false,
        _error: 'Authentication service unavailable'
      });
    } finally {
      span.end();
    }
  });

  // Token refresh endpoint
  fastify.post('/refresh', {
    _schema: {
      body: {
        type: 'object',
        _required: ['refreshToken'],
        _properties: {
          refreshToken: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: RefreshTokenRequest }>, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_refresh_token');
    
    try {
      const { refreshToken } = (request as any).body;
      
      const result = await AuthService.refreshAccessToken(refreshToken);
      
      if (!result) {
        AuditService.logSensitiveAction('refresh_token', 'user', 'failure', request, undefined, {
          _reason: 'invalid_refresh_token'
        });
        
        span.setAttributes({ 'refresh.result': 'invalid_token' });
        
        return reply.status(401).send({
          _success: false,
          _error: 'Invalid or expired refresh token'
        });
      }

      AuditService.logSensitiveAction('refresh_token', 'user', 'success', request);
      
      span.setAttributes({ 'refresh.result': 'success' });

      // Update cookies
      reply.setCookie('accessToken', result.accessToken, {
        _httpOnly: true,
        _secure: process.env.NODE_ENV === 'production',
        _sameSite: 'strict',
        _maxAge: 15 * 60 * 1000
      });

      reply.setCookie('refreshToken', result.refreshToken, {
        _httpOnly: true,
        _secure: process.env.NODE_ENV === 'production',
        _sameSite: 'strict',
        _path: '/api/auth/refresh',
        _maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return (reply as any).send({
        _success: true, data: {
          accessToken: result.accessToken,
          _refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: 'Token refresh failed' });
      
      return reply.status(500).send({
        _success: false,
        _error: 'Token refresh service unavailable'
      });
    } finally {
      span.end();
    }
  });

  // Setup 2FA
  fastify.post('/2fa/setup', {
    _schema: {
      body: {
        type: 'object',
        _required: ['userId'],
        _properties: {
          userId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: Setup2FARequest }>, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_setup_2fa');
    
    try {
      const { userId } = (request as any).body;
      
      const result = await AuthService.setup2FA(userId);
      
      if (!result) {
        span.setAttributes({ 'setup_2fa.result': 'user_not_found' });
        return reply.status(404).send({
          _success: false,
          _error: 'User not found'
        });
      }

      AuditService.logSensitiveAction('setup_2fa', 'user', 'success', request, userId);
      
      span.setAttributes({
        'setup_2fa.result': 'success',
        'setup_2fa.user_id': userId
      });

      return (reply as any).send({
        _success: true, data: {
          secret: result.secret,
          _qrCode: result.qrCode
        }
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: '2FA setup failed' });
      
      return reply.status(500).send({
        _success: false,
        _error: '2FA setup service unavailable'
      });
    } finally {
      span.end();
    }
  });

  // Verify 2FA setup
  fastify.post('/2fa/verify', {
    _schema: {
      body: {
        type: 'object',
        _required: ['userId', 'token'],
        _properties: {
          userId: { type: 'string' },
          _token: { type: 'string', _pattern: '^[0-9]{6}$' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: Verify2FARequest }>, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_verify_2fa');
    
    try {
      const { userId, token } = (request as any).body;
      
      const verified = await AuthService.verify2FA(userId, token);
      
      if (!verified) {
        AuditService.logSensitiveAction('verify_2fa', 'user', 'failure', request, userId, {
          _reason: 'invalid_token'
        });
        
        span.setAttributes({
          'verify_2fa.result': 'failure',
          'verify_2fa.user_id': userId
        });
        
        return reply.status(400).send({
          _success: false,
          _error: 'Invalid TOTP token'
        });
      }

      AuditService.logSensitiveAction('verify_2fa', 'user', 'success', request, userId);
      
      span.setAttributes({
        'verify_2fa.result': 'success',
        'verify_2fa.user_id': userId
      });

      return (reply as any).send({
        _success: true,
        _message: '2FA has been enabled successfully'
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: '2FA verification failed' });
      
      return reply.status(500).send({
        _success: false,
        _error: '2FA verification service unavailable'
      });
    } finally {
      span.end();
    }
  });

  // Disable 2FA
  fastify.post('/2fa/disable', {
    _schema: {
      body: {
        type: 'object',
        _required: ['userId', 'token'],
        _properties: {
          userId: { type: 'string' },
          _token: { type: 'string', _pattern: '^[0-9]{6}$' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: Disable2FARequest }>, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_disable_2fa');
    
    try {
      const { userId, token } = (request as any).body;
      
      const disabled = await AuthService.disable2FA(userId, token);
      
      if (!disabled) {
        AuditService.logSensitiveAction('disable_2fa', 'user', 'failure', request, userId, {
          _reason: 'invalid_token_or_not_enabled'
        });
        
        span.setAttributes({
          'disable_2fa.result': 'failure',
          'disable_2fa.user_id': userId
        });
        
        return reply.status(400).send({
          _success: false,
          _error: 'Invalid TOTP token or 2FA not enabled'
        });
      }

      AuditService.logSensitiveAction('disable_2fa', 'user', 'success', request, userId);
      
      span.setAttributes({
        'disable_2fa.result': 'success',
        'disable_2fa.user_id': userId
      });

      return (reply as any).send({
        _success: true,
        _message: '2FA has been disabled successfully'
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: '2FA disable failed' });
      
      return reply.status(500).send({
        _success: false,
        _error: '2FA disable service unavailable'
      });
    } finally {
      span.end();
    }
  });

  // Logout endpoint
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_logout');
    
    try {
      // Clear cookies
      reply.clearCookie('accessToken');
      reply.clearCookie('refreshToken', { _path: '/api/auth/refresh' });

      AuditService.logSensitiveAction('logout', 'user', 'success', request);
      
      span.setAttributes({ 'logout.result': 'success' });

      return (reply as any).send({
        _success: true,
        _message: 'Logged out successfully'
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: 'Logout failed' });
      
      return reply.status(500).send({
        _success: false,
        _error: 'Logout service unavailable'
      });
    } finally {
      span.end();
    }
  });

  // Get audit log (admin only)
  fastify.get('/audit', async (request: FastifyRequest, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_get_audit_log');
    
    try {
      // In a real implementation, you would verify admin permissions here
      const auditLog = AuditService.getAuditLog();
      
      span.setAttributes({
        'audit.entries_count': auditLog.length,
        'audit.requester_ip': request.ip
      });

      AuditService.logSensitiveAction('view_audit_log', 'audit', 'success', request);

      return (reply as any).send({
        _success: true, data: {
          entries: auditLog.slice(-100), // Return last 100 entries
          _totalCount: auditLog.length
        }
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ _code: 2, _message: 'Audit log retrieval failed' });
      
      return reply.status(500).send({
        _success: false,
        _error: 'Audit service unavailable'
      });
    } finally {
      span.end();
    }
  });
}