import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Security testing metrics
const securityFailures = new Rate('security_failures');
const rateLimitHits = new Counter('rate_limit_hits');
const suspiciousActivity = new Counter('suspicious_activity');

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Warm up
    { duration: '3m', target: 50 },   // Moderate attack simulation
    { duration: '5m', target: 100 },  // High intensity attack
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_failed': ['rate<0.95'], // Expect most attacks to be blocked
    'security_failures': ['rate<0.1'], // Security should hold
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  // Test 1: Brute force attack simulation
  testBruteForceProtection();
  
  // Test 2: Rate limiting validation
  testRateLimiting();
  
  // Test 3: Input validation testing
  testInputValidation();
  
  // Test 4: SQL injection attempts
  testSQLInjectionProtection();
  
  // Test 5: XSS protection
  testXSSProtection();
  
  // Test 6: 2FA bypass attempts
  test2FAProtection();

  sleep(1);
}

function testBruteForceProtection() {
  const attackEmail = 'admin@repairx.com';
  const wrongPasswords = [
    'password123', 'admin', '123456', 'password', 'admin123',
    'qwerty', 'letmein', 'welcome', 'monkey', 'dragon'
  ];

  // Simulate multiple failed login attempts
  for (let i = 0; i < 10; i++) {
    const loginData = {
      email: attackEmail,
      password: wrongPasswords[i % wrongPasswords.length]
    };

    const response = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify(loginData), {
      headers: { 'Content-Type': 'application/json' },
    });

    const blocked = check(response, {
      'brute force attempt blocked': (r) => [401, 429].includes(r.status),
      'account lockout triggered': (r) => r.status === 429 && r.body.includes('locked'),
    });

    if (!blocked) {
      securityFailures.add(1);
    }

    if (response.status === 429) {
      rateLimitHits.add(1);
    }
  }
}

function testRateLimiting() {
  // Rapid API requests to trigger rate limiting
  const requests = [];
  
  for (let i = 0; i < 150; i++) { // Exceed the 100/minute limit
    requests.push(http.get(`${BASE_URL}/api/health/live`));
  }

  // Check if rate limiting kicked in
  const rateLimited = requests.some(response => response.status === 429);
  
  check(rateLimited, {
    'rate limiting active': (blocked) => blocked === true,
  });

  if (rateLimited) {
    rateLimitHits.add(1);
  } else {
    securityFailures.add(1);
  }
}

function testInputValidation() {
  const maliciousPayloads = [
    // SQL injection payloads
    { email: "admin'--", password: "password" },
    { email: "admin@example.com'; DROP TABLE users; --", password: "test" },
    { email: "1' OR '1'='1", password: "1' OR '1'='1" },
    
    // Command injection
    { email: "admin@test.com; cat /etc/passwd", password: "test" },
    { email: "admin@test.com`whoami`", password: "test" },
    
    // XSS payloads
    { email: "<script>alert('xss')</script>", password: "test" },
    { email: "admin@test.com", password: "<img src=x onerror=alert(1)>" },
    
    // Path traversal
    { email: "../../../etc/passwd", password: "test" },
    
    // Null bytes
    { email: "admin@test.com\0", password: "test\0" },
  ];

  maliciousPayloads.forEach(payload => {
    const response = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
    });

    const blocked = check(response, {
      'malicious input blocked': (r) => [400, 401, 403].includes(r.status),
      'no error details leaked': (r) => !r.body.includes('Error:') && !r.body.includes('SQL'),
    });

    if (!blocked) {
      securityFailures.add(1);
      suspiciousActivity.add(1);
    }
  });
}

function testSQLInjectionProtection() {
  const sqlPayloads = [
    "1' UNION SELECT * FROM users--",
    "'; INSERT INTO users VALUES ('hacker', 'hacked')--",
    "admin'/**/OR/**/1=1#",
    "1' AND 1=2 UNION SELECT user, password FROM admin--",
    "1'; EXEC sp_configure 'show advanced options', 1--"
  ];

  sqlPayloads.forEach(payload => {
    const params = new URLSearchParams({ search: payload });
    const response = http.get(`${BASE_URL}/api/v1/search?${params}`);

    const protected = check(response, {
      'SQL injection blocked': (r) => [400, 403, 404].includes(r.status),
      'no database errors': (r) => !r.body.toLowerCase().includes('sql') && !r.body.toLowerCase().includes('mysql'),
    });

    if (!protected) {
      securityFailures.add(1);
    }
  });
}

function testXSSProtection() {
  const xssPayloads = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
    "javascript:alert('XSS')",
    "<iframe src='javascript:alert(1)'></iframe>",
    "<body onload=alert('XSS')>",
    "';alert('XSS');//"
  ];

  xssPayloads.forEach(payload => {
    const response = http.post(`${BASE_URL}/api/v1/feedback`, JSON.stringify({
      message: payload,
      rating: 5
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    const sanitized = check(response, {
      'XSS payload sanitized': (r) => !r.body.includes('<script>') && !r.body.includes('javascript:'),
      'proper content type': (r) => r.headers['Content-Type']?.includes('application/json'),
    });

    if (!sanitized) {
      securityFailures.add(1);
    }
  });
}

function test2FAProtection() {
  // First, try to login with valid credentials
  const loginResponse = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: 'admin@repairx.com',
    password: 'admin123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginResponse.status === 200) {
    const authData = loginResponse.json();
    
    // If 2FA is required, try to bypass it
    if (authData.data?.user?.twoFactorEnabled) {
      const bypassAttempts = [
        { totp: '000000' },
        { totp: '123456' },
        { totp: '111111' },
        { totp: '' },
        {}, // Missing TOTP
      ];

      bypassAttempts.forEach(attempt => {
        const response = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
          email: 'admin@repairx.com',
          password: 'admin123',
          ...attempt
        }), {
          headers: { 'Content-Type': 'application/json' },
        });

        const blocked = check(response, {
          '2FA bypass blocked': (r) => r.status !== 200 || (r.status === 200 && r.json().data?.accessToken === undefined),
        });

        if (!blocked) {
          securityFailures.add(1);
        }
      });
    }
  }
}

export function handleSummary(data) {
  return {
    'security-test-report.json': JSON.stringify(data, null, 2),
    stdout: `
🛡️ RepairX Security Test Results

🔒 Security Posture Summary:
   • Total Security Tests: ${data.metrics.http_reqs.values.count}
   • Security Failures: ${data.metrics.security_failures?.values?.rate ? (data.metrics.security_failures.values.rate * 100).toFixed(2) : 0}%
   • Rate Limit Activations: ${data.metrics.rate_limit_hits?.values?.count || 0}
   • Suspicious Activities Detected: ${data.metrics.suspicious_activity?.values?.count || 0}

🚨 Attack Simulations:
   • Brute Force: ${data.metrics.rate_limit_hits?.values?.count > 0 ? '✅ BLOCKED' : '❌ VULNERABLE'}
   • Rate Limiting: ${data.metrics.rate_limit_hits?.values?.count > 0 ? '✅ ACTIVE' : '❌ INACTIVE'}
   • Input Validation: ${data.metrics.security_failures?.values?.rate < 0.1 ? '✅ PROTECTED' : '❌ VULNERABLE'}

🔍 Security Recommendations:
   ${data.metrics.security_failures?.values?.rate > 0.05 ? '• Strengthen input validation and sanitization' : ''}
   ${data.metrics.rate_limit_hits?.values?.count === 0 ? '• Implement or fix rate limiting mechanisms' : ''}
   ${data.metrics.suspicious_activity?.values?.count > 10 ? '• Review and enhance threat detection' : ''}

✅ Overall Security Status: ${data.metrics.security_failures?.values?.rate < 0.1 ? 'SECURE' : 'NEEDS ATTENTION'}
    `,
  };
}