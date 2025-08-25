import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from '../config/config';

// eslint-disable-next-line max-lines-per-function
export async function registerPlugins(server: FastifyInstance): Promise<void> {
  // Security plugins
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  });

  await server.register(cors, {
    origin: config.NODE_ENV === 'development' ? true : ['https://repairx.com'],
    credentials: true,
  });

  await server.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_TIMEWINDOW,
    errorResponseBuilder: () => {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        error: 'Too Many Requests',
        message: 'Rate limit exceeded, please try again later.',
        statusCode: 429,
      };
    },
  });

  // File upload support
  await server.register(multipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 100,
      fields: 10,
      fileSize: config.MAX_FILE_SIZE,
      files: config.MAX_FILES_COUNT,
      headerPairs: 2000,
    },
  });

  // API Documentation
  await server.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'RepairX API',
        description: 'Production-ready repair service platform API',
        version: '1.0.0',
        contact: {
          name: 'RepairX Support',
          email: 'support@repairx.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: `http://${config.HOST}:${config.PORT}`,
          description: 'Development server',
        },
      ],
      components: {
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

  await server.register(swaggerUi, {
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