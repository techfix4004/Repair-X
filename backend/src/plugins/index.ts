// @ts-nocheck
import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from '../config/config';

 
 
export async function registerPlugins(_server: FastifyInstance): Promise<void> {
  // Security plugins
  await _server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "_data:", "_https:"],
      },
    },
  });

  // await _server.register(cors, {
  //   origin: config._NODE_ENV === 'development' ? true : ['https://repairx.com'],
  //   credentials: true,
  // });

  await _server.register(rateLimit, {
    max: config._RATE_LIMIT_MAX,
    timeWindow: config._RATE_LIMIT_TIMEWINDOW,
    errorResponseBuilder: () => {
      return {
        _code: 'RATE_LIMIT_EXCEEDED',
        _error: 'Too Many Requests',
        _message: 'Rate limit exceeded, please try again later.',
        _statusCode: 429,
      };
    },
  });

  // File upload support (check if already registered)
  if (!_server.hasDecorator('multipartErrors')) {
    await _server.register(multipart, {
      _limits: {
        fieldNameSize: 100,
        _fieldSize: 100,
        _fields: 10,
        fileSize: config._MAX_FILE_SIZE,
        files: config._MAX_FILES_COUNT,
        _headerPairs: 2000,
      },
    });
  }

  // API Documentation (check if already registered)
  if (!_server.hasDecorator('swagger')) {
    await _server.register(swagger, {
      _openapi: {
        openapi: '3.0.0',
        _info: {
          title: 'RepairX API',
          _description: 'Production-ready repair service platform API',
          _version: '1.0.0',
          _contact: {
            name: 'RepairX Support',
            _email: 'support@repairx.com',
          },
          _license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
          },
        },
        _servers: [
          {
            url: `http://${config._HOST}:${config._PORT}`,
            _description: 'Development server',
          },
        ],
        _components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    });
  }

  // Swagger UI (check if already registered)
  if (!_server.hasDecorator('swaggerCSP')) {
    await _server.register(swaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header: string) => header,
      transformSpecification: (swaggerObject: object) => {
        return swaggerObject;
      },
      transformSpecificationClone: true,
    });
  }
}