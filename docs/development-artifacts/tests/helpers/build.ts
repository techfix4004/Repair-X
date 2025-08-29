import Fastify from 'fastify';
import { registerPlugins } from '../../src/plugins/index';
import { registerRoutes } from '../../src/routes/index';

export async function build(): Promise<any> {
  const server = Fastify({
    logger: false, // Disable logging in tests
  });

  await registerPlugins(server);
  await registerRoutes(server);

  return server;
}