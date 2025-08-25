import client from 'prom-client';

// Create a Registry for custom metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom business metrics
export const businessMetrics = {
  // Revenue metrics
  revenue: new client.Counter({
    name: 'repairx_revenue_total',
    help: 'Total revenue generated',
    labelNames: ['category', 'organization'],
    registers: [register],
  }),

  revenueByCategory: new client.Counter({
    name: 'repairx_revenue_by_category_total',
    help: 'Revenue by service category',
    labelNames: ['category', 'organization'],
    registers: [register],
  }),

  // Customer metrics
  activeCustomers: new client.Gauge({
    name: 'repairx_active_customers_total',
    help: 'Number of active customers',
    labelNames: ['organization'],
    registers: [register],
  }),

  customerChurn: new client.Counter({
    name: 'repairx_customer_churn_total',
    help: 'Customer churn count',
    labelNames: ['organization'],
    registers: [register],
  }),

  customerSatisfaction: new client.Histogram({
    name: 'repairx_customer_satisfaction_score',
    help: 'Customer satisfaction scores',
    buckets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    labelNames: ['organization'],
    registers: [register],
  }),

  // Job metrics
  jobsCreated: new client.Counter({
    name: 'repairx_jobs_created_total',
    help: 'Total jobs created',
    labelNames: ['status', 'category', 'organization'],
    registers: [register],
  }),

  jobsCompleted: new client.Counter({
    name: 'repairx_jobs_completed_total',
    help: 'Total jobs completed',
    labelNames: ['category', 'organization'],
    registers: [register],
  }),

  jobDuration: new client.Histogram({
    name: 'repairx_job_duration_seconds',
    help: 'Job completion time in seconds',
    buckets: [300, 600, 1200, 1800, 3600, 7200, 14400], // 5min to 4hours
    labelNames: ['category', 'organization'],
    registers: [register],
  }),

  // Technician metrics
  technicianUtilization: new client.Gauge({
    name: 'repairx_technician_active_jobs',
    help: 'Number of active jobs per technician',
    labelNames: ['technician', 'organization'],
    registers: [register],
  }),

  technicianCapacity: new client.Gauge({
    name: 'repairx_technician_capacity',
    help: 'Maximum capacity per technician',
    labelNames: ['technician', 'organization'],
    registers: [register],
  }),

  // Geographic metrics
  customersByRegion: new client.Gauge({
    name: 'repairx_customers_by_region_total',
    help: 'Customer count by region',
    labelNames: ['region', 'organization'],
    registers: [register],
  }),

  // System metrics
  httpRequests: new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'status', 'route'],
    registers: [register],
  }),

  httpDuration: new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    buckets: [0.1, 0.2, 0.5, 1, 2, 5, 10],
    labelNames: ['method', 'route'],
    registers: [register],
  }),

  // Security metrics
  failedLogins: new client.Counter({
    name: 'repairx_failed_login_attempts_total',
    help: 'Failed login attempts',
    labelNames: ['source_ip', 'user_agent'],
    registers: [register],
  }),

  suspiciousActivity: new client.Counter({
    name: 'repairx_suspicious_activity_total',
    help: 'Suspicious security events',
    labelNames: ['event_type', 'source_ip'],
    registers: [register],
  }),

  // Database metrics
  dbQueries: new client.Counter({
    name: 'repairx_db_queries_total',
    help: 'Database queries executed',
    labelNames: ['operation', 'table'],
    registers: [register],
  }),

  dbQueryDuration: new client.Histogram({
    name: 'repairx_db_query_duration_seconds',
    help: 'Database query duration in seconds',
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    labelNames: ['operation', 'table'],
    registers: [register],
  }),
};

// Health check metrics
export const healthMetrics = {
  uptime: new client.Gauge({
    name: 'repairx_uptime_seconds',
    help: 'Application uptime in seconds',
    registers: [register],
  }),

  healthStatus: new client.Gauge({
    name: 'repairx_health_status',
    help: 'Health status (1 = healthy, 0 = unhealthy)',
    labelNames: ['component'],
    registers: [register],
  }),
};

// Start uptime tracking
const startTime = Date.now();
setInterval(() => {
  healthMetrics.uptime.set((Date.now() - startTime) / 1000);
}, 10000);

// HTTP middleware for request metrics
export const metricsMiddleware = (req: any, reply: any, done: any) => {
  const start = Date.now();
  
  reply.addHook('onSend', () => {
    const duration = (Date.now() - start) / 1000;
    
    businessMetrics.httpRequests
      .labels(req.method, reply.statusCode.toString(), req.routerPath || req.url)
      .inc();
      
    businessMetrics.httpDuration
      .labels(req.method, req.routerPath || req.url)
      .observe(duration);
  });
  
  done();
};

// Mock tracing for now - in production, use proper OpenTelemetry
export const tracer = {
  startSpan: (name: string) => ({
    setAttributes: (attrs: any) => {},
    recordException: (error: Error) => {},
    setStatus: (status: any) => {},
    end: () => {}
  })
};

export const meter = {
  createCounter: (name: string, options?: any) => ({
    add: (value: number, labels?: any) => {}
  }),
  createGauge: (name: string, options?: any) => ({
    record: (value: number, labels?: any) => {}
  })
};

// Export the registry for /metrics endpoint
export { register };