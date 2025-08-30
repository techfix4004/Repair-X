/**
 * Production Error Handling
 * 
 * Comprehensive error handling middleware for production environments.
 * Provides structured error responses, logging, and security.
 */

import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { env } from '../config/environment';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    timestamp: string;
    requestId?: string;
    details?: unknown;
  };
}

export class ErrorHandler {
  private static errorCounts = new Map<string, number>();

  static async register(fastify: FastifyInstance) {
    // Global error handler
    fastify.setErrorHandler(this.handleError);

    // 404 handler
    fastify.setNotFoundHandler(this.handleNotFound);

    // Request ID generation for error tracking
    fastify.addHook('onRequest', async (request) => {
      if (!request.headers['x-request-id']) {
        request.headers['x-request-id'] = this.generateRequestId();
      }
    });
  }

  private static async handleError(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const requestId = request.headers['x-request-id'] as string;
    const timestamp = new Date().toISOString();

    // Track error frequencies
    const errorKey = `${error.name}:${error.statusCode}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Log error details (but not in response in production)
    const logEntry = {
      requestId,
      timestamp,
      error: {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack
      },
      request: {
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent']
      }
    };

    if (env.NODE_ENV === 'production') {
      console.error('ERROR:', JSON.stringify({
        ...logEntry,
        error: { ...logEntry.error, stack: undefined } // Don't log stack in production
      }));
    } else {
      console.error('ERROR:', logEntry);
    }

    // Determine appropriate response
    const statusCode = error.statusCode || 500;
    const errorResponse = this.createErrorResponse(error, requestId, timestamp);

    reply.status(statusCode).send(errorResponse);
  }

  private static async handleNotFound(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const requestId = request.headers['x-request-id'] as string;
    const timestamp = new Date().toISOString();

    console.warn('404:', {
      requestId,
      timestamp,
      method: request.method,
      url: request.url,
      ip: request.ip
    });

    const errorResponse: ErrorResponse = {
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested resource was not found',
        timestamp,
        requestId
      }
    };

    reply.status(404).send(errorResponse);
  }

  private static createErrorResponse(
    error: FastifyError,
    requestId: string,
    timestamp: string
  ): ErrorResponse {
    // Default error response
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An internal server error occurred';
    let statusCode = 500;

    // Map common errors to user-friendly messages
    if (error.statusCode) {
      statusCode = error.statusCode;
      
      switch (statusCode) {
        case 400:
          code = 'BAD_REQUEST';
          message = 'The request is invalid';
          break;
        case 401:
          code = 'UNAUTHORIZED';
          message = 'Authentication is required';
          break;
        case 403:
          code = 'FORBIDDEN';
          message = 'Access to this resource is forbidden';
          break;
        case 404:
          code = 'NOT_FOUND';
          message = 'The requested resource was not found';
          break;
        case 409:
          code = 'CONFLICT';
          message = 'The request conflicts with the current state';
          break;
        case 422:
          code = 'VALIDATION_ERROR';
          message = 'The request data is invalid';
          break;
        case 429:
          code = 'RATE_LIMIT_EXCEEDED';
          message = 'Too many requests';
          break;
        case 500:
          code = 'INTERNAL_SERVER_ERROR';
          message = 'An internal server error occurred';
          break;
        case 502:
          code = 'BAD_GATEWAY';
          message = 'Service temporarily unavailable';
          break;
        case 503:
          code = 'SERVICE_UNAVAILABLE';
          message = 'Service temporarily unavailable';
          break;
      }
    }

    // Handle validation errors specially
    if (error.validation) {
      code = 'VALIDATION_ERROR';
      message = 'Request validation failed';
    }

    const response: ErrorResponse = {
      error: {
        code,
        message,
        timestamp,
        requestId
      }
    };

    // Include error details in development
    if (env.NODE_ENV === 'development') {
      response.error.details = {
        originalMessage: error.message,
        validation: error.validation,
        statusCode: error.statusCode
      };
    }

    return response;
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  static resetErrorStats(): void {
    this.errorCounts.clear();
  }
}

// Async error wrapper for route handlers
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Let Fastify's error handler deal with it
      throw error;
    }
  };
}

// Input validation helpers
export class ValidationError extends Error {
  statusCode = 422;
  validation = true;

  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateRequired(value: unknown, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}

export function validateLength(value: string, fieldName: string, min: number, max: number): void {
  if (value.length < min || value.length > max) {
    throw new ValidationError(`${fieldName} must be between ${min} and ${max} characters`);
  }
}