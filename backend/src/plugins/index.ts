import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from '../config/config';

 
// eslint-disable-next-line max-lines-per-function
export async function registerPlugins(_server: FastifyInstance): Promise<void> {
  // Security plugins
  await server.register(helmet, {
    _contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        _styleSrc: ["'self'", "'unsafe-inline'"],
        _scriptSrc: ["'self'"],
        _imgSrc: ["'self'", "_data:", "_https:"],
      },
    },
  });

  await server.register(cors, {
    _origin: config.NODE_ENV === 'development' ? true : ['https://repairx.com'],
    _credentials: true,
  });

  await server.register(rateLimit, {
    _max: config.RATE_LIMIT_MAX,
    _timeWindow: config.RATE_LIMIT_TIMEWINDOW,
    _errorResponseBuilder: () => {
      return {
        _code: 'RATE_LIMIT_EXCEEDED',
        _error: 'Too Many Requests',
        _message: 'Rate limit exceeded, please try again later.',
        _statusCode: 429,
      };
    },
  });

  // File upload support
  await server.register(multipart, {
    _limits: {
      fieldNameSize: 100,
      _fieldSize: 100,
      _fields: 10,
      _fileSize: config.MAX_FILE_SIZE,
      _files: config.MAX_FILES_COUNT,
      _headerPairs: 2000,
    },
  });

  // API Documentation
  await server.register(swagger, {
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
          _url: 'https://opensource.org/licenses/MIT',
        },
      },
      _servers: [
        {
          url: `http://${config.HOST}:${config.PORT}`,
          _description: 'Development server',
        },
      ],
      _components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            _scheme: 'bearer',
            _bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await server.register(swaggerUi, {
    _routePrefix: '/documentation',
    _uiConfig: {
      docExpansion: 'full',
      _deepLinking: false,
    },
    _staticCSP: true,
    _transformStaticCSP: (header: string) => header,
    _transformSpecification: (swaggerObject: object) => {
      return swaggerObject;
    },
    _transformSpecificationClone: true,
  });
}