const fastify = require('fastify')({ logger: true });

// Import the job workflow routes
const { jobSheetLifecycleRoutes } = require('./dist/routes/job-sheet-lifecycle.js');

// Register CORS
fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true,
});

// Register job workflow routes
fastify.register(jobSheetLifecycleRoutes, { prefix: '/api' });

// Health check
fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', service: 'RepairX Backend Test Server' };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log('🚀 Test server running on port 3002');
    console.log('📊 Health check: http://localhost:3002/api/health');
    console.log('🔧 Job workflow endpoints:');
    console.log('  - POST /api/jobs (create job)');
    console.log('  - GET /api/jobs/:jobId (get job)');
    console.log('  - POST /api/jobs/:jobId/transition (transition state)');
    console.log('  - GET /api/jobs/analytics/dashboard (analytics)');
    console.log('  - GET /api/jobs/workflow/config (workflow config)');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
