import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService, User } from '../security/auth';
import { RateLimitService, ValidationService, AuditService } from '../security/security';
import { tracer } from '../observability/metrics';

interface LoginRequest {
  email: string;
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

export async function enhancedAuthRoutes(fastify: FastifyInstance) {
  // Apply rate limiting to all auth routes
  fastify.addHook('preHandler', RateLimitService.createRateLimitMiddleware('auth'));

  // Enhanced login with 2FA support
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          totp: { type: 'string', pattern: '^[0-9]{6}$' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_login');
    const { email, password, totp } = request.body;
    
    try {
      // Validate and sanitize input
      const validation = ValidationService.validateInput(request.body, request);
      if (!validation.valid) {
        AuditService.logSensitiveAction('login', 'user', 'failure', request, undefined, {
          reason: 'malicious_input',
          threats: validation.threats
        });
        
        span.setAttributes({
          'auth.result': 'malicious_input',
          'auth.threats': validation.threats.join(',')
        });
        
        return reply.status(400).send({
          success: false,
          error: 'Invalid input detected'
        });
      }

      const sanitizedBody = ValidationService.sanitizeInput(request.body) as LoginRequest;
      
      // Attempt authentication
      const result = await AuthService.authenticateUser(sanitizedBody.email, sanitizedBody.password, sanitizedBody.totp);
      
      if (!result) {
        AuditService.logSensitiveAction('login', 'user', 'failure', request, undefined, {
          email: sanitizedBody.email,
          reason: 'invalid_credentials'
        });
        
        span.setAttributes({
          'auth.result': 'failure',
          'auth.email': sanitizedBody.email
        });
        
        return reply.status(401).send({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Successful login
      AuditService.logSensitiveAction('login', 'user', 'success', request, result.user.id, {
        email: result.user.email,
        role: result.user.role,
        twoFactorUsed: !!totp
      });

      span.setAttributes({
        'auth.result': 'success',
        'auth.user_id': result.user.id,
        'auth.user_role': result.user.role,
        '2fa.enabled': result.user.twoFactorEnabled
      });

      // Set secure cookies for tokens
      reply.setCookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      reply.setCookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            twoFactorEnabled: result.user.twoFactorEnabled
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: 'Login failed' });
      
      AuditService.logSensitiveAction('login', 'user', 'failure', request, undefined, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return reply.status(500).send({
        success: false,
        error: 'Authentication service unavailable'
      });
    } finally {
      span.end();
    }
  });

  // Token refresh endpoint
  fastify.post('/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: RefreshTokenRequest }>, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_refresh_token');
    
    try {
      const { refreshToken } = request.body;
      
      const result = await AuthService.refreshAccessToken(refreshToken);
      
      if (!result) {
        AuditService.logSensitiveAction('refresh_token', 'user', 'failure', request, undefined, {
          reason: 'invalid_refresh_token'
        });
        
        span.setAttributes({ 'refresh.result': 'invalid_token' });
        
        return reply.status(401).send({
          success: false,
          error: 'Invalid or expired refresh token'
        });
      }

      AuditService.logSensitiveAction('refresh_token', 'user', 'success', request);
      
      span.setAttributes({ 'refresh.result': 'success' });

      // Update cookies
      reply.setCookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });

      reply.setCookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return reply.send({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: 'Token refresh failed' });
      
      return reply.status(500).send({
        success: false,
        error: 'Token refresh service unavailable'
      });
    } finally {
      span.end();
    }
  });

  // Setup 2FA
  fastify.post('/2fa/setup', {
    schema: {
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: Setup2FARequest }>, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_setup_2fa');
    
    try {
      const { userId } = request.body;
      
      const result = await AuthService.setup2FA(userId);
      
      if (!result) {
        span.setAttributes({ 'setup_2fa.result': 'user_not_found' });
        return reply.status(404).send({
          success: false,
          error: 'User not found'
        });
      }

      AuditService.logSensitiveAction('setup_2fa', 'user', 'success', request, userId);
      
      span.setAttributes({
        'setup_2fa.result': 'success',
        'setup_2fa.user_id': userId
      });

      return reply.send({
        success: true,
        data: {
          secret: result.secret,
          qrCode: result.qrCode
        }
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: '2FA setup failed' });
      
      return reply.status(500).send({
        success: false,
        error: '2FA setup service unavailable'
      });
    } finally {
      span.end();
    }
  });

  // Verify 2FA setup
  fastify.post('/2fa/verify', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'token'],
        properties: {
          userId: { type: 'string' },
          token: { type: 'string', pattern: '^[0-9]{6}$' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: Verify2FARequest }>, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_verify_2fa');
    
    try {
      const { userId, token } = request.body;
      
      const verified = await AuthService.verify2FA(userId, token);
      
      if (!verified) {
        AuditService.logSensitiveAction('verify_2fa', 'user', 'failure', request, userId, {
          reason: 'invalid_token'
        });
        
        span.setAttributes({
          'verify_2fa.result': 'failure',
          'verify_2fa.user_id': userId
        });
        
        return reply.status(400).send({
          success: false,
          error: 'Invalid TOTP token'
        });
      }

      AuditService.logSensitiveAction('verify_2fa', 'user', 'success', request, userId);
      
      span.setAttributes({
        'verify_2fa.result': 'success',
        'verify_2fa.user_id': userId
      });

      return reply.send({
        success: true,
        message: '2FA has been enabled successfully'
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: '2FA verification failed' });
      
      return reply.status(500).send({
        success: false,
        error: '2FA verification service unavailable'
      });
    } finally {
      span.end();
    }
  });

  // Disable 2FA
  fastify.post('/2fa/disable', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'token'],
        properties: {
          userId: { type: 'string' },
          token: { type: 'string', pattern: '^[0-9]{6}$' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: Disable2FARequest }>, reply: FastifyReply) => {
    const span = tracer.startSpan('auth_disable_2fa');
    
    try {
      const { userId, token } = request.body;
      
      const disabled = await AuthService.disable2FA(userId, token);
      
      if (!disabled) {
        AuditService.logSensitiveAction('disable_2fa', 'user', 'failure', request, userId, {
          reason: 'invalid_token_or_not_enabled'
        });
        
        span.setAttributes({
          'disable_2fa.result': 'failure',
          'disable_2fa.user_id': userId
        });
        
        return reply.status(400).send({
          success: false,
          error: 'Invalid TOTP token or 2FA not enabled'
        });
      }

      AuditService.logSensitiveAction('disable_2fa', 'user', 'success', request, userId);
      
      span.setAttributes({
        'disable_2fa.result': 'success',
        'disable_2fa.user_id': userId
      });

      return reply.send({
        success: true,
        message: '2FA has been disabled successfully'
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: '2FA disable failed' });
      
      return reply.status(500).send({
        success: false,
        error: '2FA disable service unavailable'
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
      reply.clearCookie('refreshToken', { path: '/api/auth/refresh' });

      AuditService.logSensitiveAction('logout', 'user', 'success', request);
      
      span.setAttributes({ 'logout.result': 'success' });

      return reply.send({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: 'Logout failed' });
      
      return reply.status(500).send({
        success: false,
        error: 'Logout service unavailable'
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

      return reply.send({
        success: true,
        data: {
          entries: auditLog.slice(-100), // Return last 100 entries
          totalCount: auditLog.length
        }
      });
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: 'Audit log retrieval failed' });
      
      return reply.status(500).send({
        success: false,
        error: 'Audit service unavailable'
      });
    } finally {
      span.end();
    }
  });
}