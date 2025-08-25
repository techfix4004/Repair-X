import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { businessMetrics } from '../observability/metrics';

// Enhanced rate limiting with multiple tiers
export class RateLimitService {
  private static requestCounts = new Map<string, { count: number; resetTime: number; blocked: boolean }>();
  private static blockedIPs = new Set<string>();
  
  // Rate limit configurations
  private static readonly LIMITS = {
    // Per IP limits
    global: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
    auth: { requests: 5, window: 15 * 60 * 1000 }, // 5 login attempts per 15 minutes
    api: { requests: 60, window: 60 * 1000 }, // 60 API calls per minute
    
    // Per user limits (authenticated users get higher limits)
    userGlobal: { requests: 300, window: 60 * 1000 }, // 300 requests per minute
    userApi: { requests: 180, window: 60 * 1000 }, // 180 API calls per minute
  };

  static createRateLimitMiddleware(type: keyof typeof RateLimitService.LIMITS = 'global') {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const clientIP = request.ip;
      const userAgent = request.headers['user-agent'] || 'unknown';
      
      // Check if IP is blocked
      if (this.blockedIPs.has(clientIP)) {
        businessMetrics.suspiciousActivity.labels('blocked_ip_access', clientIP).inc();
        
        reply.status(429).send({
          error: 'Too Many Requests',
          message: 'Your IP address has been temporarily blocked due to suspicious activity',
          retryAfter: 3600 // 1 hour
        });
        return;
      }

      const limit = this.LIMITS[type];
      const key = `${type}_${clientIP}`;
      
      const result = this.checkLimit(key, limit.requests, limit.window);
      
      if (!result.allowed) {
        // Track rate limit violations
        businessMetrics.suspiciousActivity.labels('rate_limit_exceeded', clientIP).inc();
        
        // Auto-block IPs that consistently exceed limits
        if (result.violationCount >= 5) {
          this.blockedIPs.add(clientIP);
          setTimeout(() => this.blockedIPs.delete(clientIP), 60 * 60 * 1000); // Unblock after 1 hour
        }
        
        reply.status(429).send({
          error: 'Rate Limit Exceeded',
          message: `Too many requests. Limit: ${limit.requests} per ${limit.window / 1000}s`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          remaining: 0
        });
        return;
      }

      // Add rate limit headers
      reply.header('X-RateLimit-Limit', limit.requests);
      reply.header('X-RateLimit-Remaining', result.remaining);
      reply.header('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    };
  }

  private static checkLimit(key: string, limit: number, windowMs: number): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    violationCount: number;
  } {
    const now = Date.now();
    const current = this.requestCounts.get(key);
    
    if (!current || now > current.resetTime) {
      // Reset window
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs,
        blocked: false
      });
      
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs,
        violationCount: 0
      };
    }
    
    current.count++;
    
    if (current.count > limit) {
      current.blocked = true;
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        violationCount: current.count - limit
      };
    }
    
    return {
      allowed: true,
      remaining: limit - current.count,
      resetTime: current.resetTime,
      violationCount: 0
    };
  }
}

// Input validation and sanitization
export class ValidationService {
  // SQL injection patterns
  private static readonly SQL_PATTERNS = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    /(\bUNION\b|\bJOIN\b)/i,
    /('|(\\x27)|(\\x2D\\x2D)|(\;)|(\|)|(\*)|(%27)|(%2D%2D)|(%7C)|(%2A))/i,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i
  ];

  // XSS patterns
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi
  ];

  // Command injection patterns
  private static readonly COMMAND_PATTERNS = [
    /(\||&|;|\$\(|\`)/,
    /\b(rm|cat|ls|pwd|wget|curl|nc|netcat)\b/i
  ];

  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeString(key)] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  private static sanitizeString(str: string): string {
    // Remove potential XSS
    str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
    str = str.replace(/\//g, '&#x2F;');
    
    // Remove null bytes
    str = str.replace(/\0/g, '');
    
    return str.trim();
  }

  static validateInput(input: any, request?: FastifyRequest): { valid: boolean; threats: string[] } {
    const threats: string[] = [];
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    
    // Check for SQL injection
    for (const pattern of this.SQL_PATTERNS) {
      if (pattern.test(inputStr)) {
        threats.push('sql_injection');
        break;
      }
    }
    
    // Check for XSS
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(inputStr)) {
        threats.push('xss');
        break;
      }
    }
    
    // Check for command injection
    for (const pattern of this.COMMAND_PATTERNS) {
      if (pattern.test(inputStr)) {
        threats.push('command_injection');
        break;
      }
    }
    
    // Log threats
    if (threats.length > 0 && request) {
      threats.forEach(threat => {
        businessMetrics.suspiciousActivity.labels(threat, request.ip).inc();
      });
    }
    
    return {
      valid: threats.length === 0,
      threats
    };
  }
}

// Security headers middleware
export const securityHeadersMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && request.headers['x-forwarded-proto'] !== 'https') {
    return reply.status(426).send({
      error: 'Upgrade Required',
      message: 'HTTPS is required for this service'
    });
  }

  // Set security headers
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // In production, avoid unsafe-inline
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ].join('; ');
  
  reply.header('Content-Security-Policy', csp);
};

// Audit logging for sensitive operations
export class AuditService {
  private static auditLog: Array<{
    timestamp: Date;
    userId?: string;
    ip: string;
    userAgent: string;
    action: string;
    resource: string;
    result: 'success' | 'failure';
    details: any;
  }> = [];

  static logSensitiveAction(
    action: string,
    resource: string,
    result: 'success' | 'failure',
    request: FastifyRequest,
    userId?: string,
    details?: any
  ) {
    const entry = {
      timestamp: new Date(),
      userId,
      ip: request.ip,
      userAgent: request.headers['user-agent'] || 'unknown',
      action,
      resource,
      result,
      details
    };

    this.auditLog.push(entry);
    
    // In production, this should write to a secure, immutable audit log
    console.log('AUDIT:', JSON.stringify(entry));
    
    // Keep only last 10000 entries in memory (in production, persist to database)
    if (this.auditLog.length > 10000) {
      this.auditLog.shift();
    }
  }

  static getAuditLog(): typeof AuditService.auditLog {
    return [...this.auditLog]; // Return copy to prevent tampering
  }
}