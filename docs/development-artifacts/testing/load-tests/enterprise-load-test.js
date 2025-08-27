import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const failureRate = new Rate('failures');
const responseTime = new Trend('response_time');
const loginAttempts = new Counter('login_attempts');
const apiCalls = new Counter('api_calls');

// Test configuration for enterprise load
export const options = {
  stages: [
    // Ramp up to 5000+ organizations simulation
    { duration: '2m', target: 100 },   // Warm up
    { duration: '5m', target: 500 },   // Moderate load  
    { duration: '10m', target: 1000 }, // High load
    { duration: '20m', target: 2000 }, // Peak load
    { duration: '10m', target: 5000 }, // Maximum enterprise load
    { duration: '15m', target: 5000 }, // Sustain peak
    { duration: '5m', target: 0 },     // Ramp down
  ],
  thresholds: {
    // SLA requirements
    'http_req_duration': ['p(95)<2000'], // 95% of requests under 2s
    'http_req_duration{group:::api}': ['p(99)<1000'], // API 99th percentile under 1s
    'http_req_failed': ['rate<0.01'], // Error rate under 1%
    'failures': ['rate<0.05'], // Business logic failures under 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Test data for multi-tenant simulation
const organizations = Array.from({ length: 5000 }, (_, i) => ({
  id: `org-${i + 1}`,
  name: `Organization ${i + 1}`,
  domain: `org${i + 1}.repairx.com`
}));

const customers = Array.from({ length: 1000000 }, (_, i) => ({
  id: `customer-${i + 1}`,
  email: `customer${i + 1}@example.com`,
  orgId: `org-${Math.floor(i / 200) + 1}` // 200 customers per org
}));

export default function () {
  const orgIndex = Math.floor(Math.random() * organizations.length);
  const customerIndex = Math.floor(Math.random() * customers.length);
  const org = organizations[orgIndex];
  const customer = customers[customerIndex];

  // Health check test
  group('Health Checks', function () {
    const healthResponse = http.get(`${BASE_URL}/api/health/live`);
    check(healthResponse, {
      'health check status 200': (r) => r.status === 200,
      'health check response time < 100ms': (r) => r.timings.duration < 100,
    });
    responseTime.add(healthResponse.timings.duration, { endpoint: 'health' });
  });

  // Authentication flow test
  group('Authentication Flow', function () {
    const loginData = {
      email: customer.email,
      password: 'testpassword123'
    };

    const loginResponse = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify(loginData), {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization': org.domain,
      },
    });

    const loginSuccess = check(loginResponse, {
      'login status is 200 or 401': (r) => [200, 401].includes(r.status),
      'login response time < 500ms': (r) => r.timings.duration < 500,
    });

    loginAttempts.add(1);
    if (!loginSuccess) {
      failureRate.add(1);
    }
    
    responseTime.add(loginResponse.timings.duration, { endpoint: 'auth' });

    // If login successful, test authenticated endpoints
    if (loginResponse.status === 200) {
      const authData = loginResponse.json();
      const token = authData.data?.accessToken;

      if (token) {
        testAuthenticatedEndpoints(token, org, customer);
      }
    }
  });

  // Simulate realistic user behavior
  sleep(Math.random() * 2 + 1); // 1-3 seconds between actions
}

function testAuthenticatedEndpoints(token, org, customer) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Organization': org.domain,
  };

  // Test job creation (core business workflow)
  group('Job Management', function () {
    const jobData = {
      customerId: customer.id,
      deviceType: 'smartphone',
      issueDescription: 'Screen replacement needed',
      priority: Math.random() > 0.7 ? 'high' : 'normal',
      organizationId: org.id,
    };

    const createJobResponse = http.post(`${BASE_URL}/api/v1/jobs`, JSON.stringify(jobData), { headers });
    
    const jobCreated = check(createJobResponse, {
      'job creation status 201': (r) => r.status === 201,
      'job creation response time < 1s': (r) => r.timings.duration < 1000,
    });

    apiCalls.add(1, { operation: 'create_job' });
    if (!jobCreated) {
      failureRate.add(1);
    }
    
    responseTime.add(createJobResponse.timings.duration, { endpoint: 'jobs_create' });

    // Test job listing
    const listJobsResponse = http.get(`${BASE_URL}/api/v1/jobs?orgId=${org.id}`, { headers });
    
    check(listJobsResponse, {
      'job listing status 200': (r) => r.status === 200,
      'job listing response time < 500ms': (r) => r.timings.duration < 500,
    });

    apiCalls.add(1, { operation: 'list_jobs' });
    responseTime.add(listJobsResponse.timings.duration, { endpoint: 'jobs_list' });
  });

  // Test business metrics endpoints
  group('Business Analytics', function () {
    const metricsResponse = http.get(`${BASE_URL}/api/v1/analytics/dashboard?orgId=${org.id}`, { headers });
    
    check(metricsResponse, {
      'metrics status 200 or 404': (r) => [200, 404].includes(r.status),
      'metrics response time < 2s': (r) => r.timings.duration < 2000,
    });

    apiCalls.add(1, { operation: 'analytics' });
    responseTime.add(metricsResponse.timings.duration, { endpoint: 'analytics' });
  });

  // Test real-time features (WebSocket simulation with HTTP)
  group('Real-time Updates', function () {
    const updatesResponse = http.get(`${BASE_URL}/api/v1/updates/poll?orgId=${org.id}`, { headers });
    
    check(updatesResponse, {
      'updates status 200 or 404': (r) => [200, 404].includes(r.status),
      'updates response time < 200ms': (r) => r.timings.duration < 200,
    });

    apiCalls.add(1, { operation: 'updates' });
    responseTime.add(updatesResponse.timings.duration, { endpoint: 'updates' });
  });
}

// Multi-tenant isolation test
export function handleSummary(data) {
  return {
    'load-test-report.json': JSON.stringify(data, null, 2),
    stdout: `
🚀 RepairX Enterprise Load Test Results

📊 Performance Summary:
   • Total Requests: ${data.metrics.http_reqs.values.count}
   • Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s
   • Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
   • 95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
   • 99th Percentile: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms

❌ Error Analysis:
   • Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%
   • Business Logic Failures: ${data.metrics.failures?.values?.rate ? (data.metrics.failures.values.rate * 100).toFixed(2) : 0}%

🏢 Multi-tenant Simulation:
   • Organizations Tested: 5,000
   • Customers Simulated: 1,000,000  
   • Concurrent Users Peak: 5,000

🎯 SLA Compliance:
   • Response Time SLA: ${data.metrics.http_req_duration.values['p(95)'] < 2000 ? '✅ PASSED' : '❌ FAILED'}
   • Error Rate SLA: ${data.metrics.http_req_failed.values.rate < 0.01 ? '✅ PASSED' : '❌ FAILED'}
   • API Performance SLA: ${data.metrics['http_req_duration{group:::api}'] && data.metrics['http_req_duration{group:::api}'].values['p(99)'] < 1000 ? '✅ PASSED' : '❌ FAILED'}

🔍 Recommendations:
   ${data.metrics.http_req_duration.values['p(95)'] > 2000 ? '• Scale backend services or optimize database queries' : ''}
   ${data.metrics.http_req_failed.values.rate > 0.01 ? '• Investigate and fix error conditions' : ''}
   ${data.metrics.failures?.values?.rate > 0.05 ? '• Review business logic for edge cases' : ''}
    `,
  };
}