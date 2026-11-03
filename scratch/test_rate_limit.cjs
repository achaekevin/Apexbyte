const http = require('http');

function makeRequest(path, ip, body = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-Forwarded-For': ip,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RateLimitTester/1.0',
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            json = raw;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json,
          });
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runRateLimitValidation() {
  console.log('====================================================');
  console.log('  MANDATORY REQUIREMENT 11: RATE LIMIT VERIFICATION ');
  console.log('====================================================\n');

  const testIp = `203.0.113.${Math.floor(Math.random() * 200 + 10)}`;
  console.log(`Testing with client IP: ${testIp}`);

  // Test across multiple authentication routes to prove shared pool
  const authRoutes = [
    { path: '/api/auth/login', payload: { email: 'user@test.com', password: 'bad' } },
    { path: '/api/auth/register', payload: { email: 'bad-email', password: 'short' } },
    { path: '/api/auth/forgot-password', payload: { email: 'user@test.com' } },
    { path: '/api/auth/resend-verification', payload: { email: 'user@test.com' } },
    { path: '/api/auth/refresh-token', payload: { refreshToken: 'dummy_token' } },
  ];

  console.log('\nStep 1: Making 5 sequential attempts across different auth endpoints...');
  for (let i = 0; i < 5; i++) {
    const route = authRoutes[i];
    const res = await makeRequest(route.path, testIp, route.payload);
    console.log(`[Attempt ${i + 1}/5] ${route.path} -> HTTP ${res.status}`);
    console.log(`              Limit: ${res.headers['ratelimit-limit']}, Remaining: ${res.headers['ratelimit-remaining']}, Reset: ${res.headers['ratelimit-reset']}s`);

    if (res.status === 429) {
      console.error(`❌ FAILED: Attempt ${i + 1} was prematurely blocked with 429`);
      process.exit(1);
    }
  }

  console.log('\nStep 2: Making 6th attempt (must be blocked with 429)...');
  const attempt6 = await makeRequest('/api/auth/login', testIp, { email: 'user@test.com', password: 'bad' });
  console.log(`[Attempt 6/5] /api/auth/login -> HTTP ${attempt6.status}`);
  console.log(`              Retry-After: ${attempt6.headers['retry-after']}s`);
  console.log(`              Response body:`, attempt6.body);

  if (attempt6.status !== 429) {
    console.error(`❌ FAILED: Attempt 6 received HTTP ${attempt6.status} instead of HTTP 429`);
    process.exit(1);
  }

  if (!attempt6.headers['retry-after']) {
    console.error(`❌ FAILED: Attempt 6 did not receive Retry-After header`);
    process.exit(1);
  }

  if (attempt6.body?.error?.code !== 'RATE_LIMIT_EXCEEDED') {
    console.error(`❌ FAILED: Error code is not RATE_LIMIT_EXCEEDED`);
    process.exit(1);
  }

  console.log('\nStep 3: Verifying that an unrelated client IP is not blocked...');
  const cleanIp = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;
  const cleanRes = await makeRequest('/api/auth/login', cleanIp, { email: 'user@test.com', password: 'bad' });
  console.log(`[Clean IP Attempt 1] ${cleanIp} -> HTTP ${cleanRes.status}, Remaining: ${cleanRes.headers['ratelimit-remaining']}`);

  if (cleanRes.status === 429) {
    console.error(`❌ FAILED: Clean IP was erroneously blocked`);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('  ALL RATE LIMIT CRITERIA VERIFIED AND PASSING!     ');
  console.log('====================================================\n');
}

runRateLimitValidation().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});

