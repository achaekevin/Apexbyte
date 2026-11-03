const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36 SecurityAudit/1.0',
    };
    options.headers = { ...defaultHeaders, ...options.headers };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      if (typeof postData === 'string' || Buffer.isBuffer(postData)) {
        req.write(postData);
      } else {
        req.write(JSON.stringify(postData));
      }
    }
    req.end();
  });
}

async function runSecurityAuditTests() {
  console.log('====================================================');
  console.log('   COMPREHENSIVE AUTOMATED SECURITY AUDIT SUITE     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Security Headers (Req 18 & 19)
  // ----------------------------------------------------
  console.log('\n--- 1. Testing Security Headers & Server Hardening ---');
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/health',
      method: 'GET',
    });

    assert(res.statusCode === 200, 'Health endpoint responds 200 OK');
    assert(res.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options is nosniff');
    assert(res.headers['x-frame-options'] === 'DENY', 'X-Frame-Options is DENY');
    assert(res.headers['permissions-policy'] !== undefined, 'Permissions-Policy is configured');
    assert(!res.headers['x-powered-by'], 'X-Powered-By is masked/removed');
  } catch (err) {
    assert(false, 'Security Headers Test', err.message);
  }

  // ----------------------------------------------------
  // TEST 2: User Enumeration Protection (Req 11.13)
  // ----------------------------------------------------
  console.log('\n--- 2. Testing User Enumeration Protection ---');
  try {
    // A: Forgot Password
    const forgotRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/auth/forgot-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'totally_nonexistent_user_xyz@test.com' }
    );

    assert(
      forgotRes.statusCode === 200 && forgotRes.data.success === true,
      'Forgot password does NOT leak user non-existence (returns generic 200 success)',
      JSON.stringify(forgotRes.data)
    );

    // B: Resend Verification
    const resendRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/auth/resend-verification',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'nonexistent_account_12345@test.com' }
    );

    assert(
      resendRes.statusCode === 200 && resendRes.data.success === true,
      'Resend verification does NOT leak 404 for non-existent users (returns generic 200 success)',
      JSON.stringify(resendRes.data)
    );
  } catch (err) {
    assert(false, 'User Enumeration Test', err.message);
  }

  // ----------------------------------------------------
  // TEST 3: Mass Assignment & Public Role Elevation (Req 8)
  // ----------------------------------------------------
  console.log('\n--- 3. Testing Field Tampering & Role Elevation Prevention ---');
  try {
    const testEmail = `cust_sec_test_${Date.now()}@example.com`;
    const regRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: testEmail,
        password: 'Password123!@#',
        firstName: 'Sec',
        lastName: 'Tester',
        role: 'SUPER_ADMIN', // Attacker attempts to elevate privileges to SUPER_ADMIN!
        isVerified: true,
      }
    );

    assert(
      regRes.statusCode === 201 && regRes.data.data.user.role === 'CUSTOMER',
      'Public registration ignores role parameter and strictly forces CUSTOMER role',
      `Assigned role: ${regRes.data?.data?.user?.role}`
    );
  } catch (err) {
    assert(false, 'Mass Assignment Test', err.message);
  }

  // ----------------------------------------------------
  // TEST 4: IDOR Protection & Unauthenticated Access Block (Req 4, 6, 7)
  // ----------------------------------------------------
  console.log('\n--- 4. Testing IDOR & Record Access Controls ---');
  try {
    // Unauthenticated access to protected user profile
    const unauthProfileRes = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/users/profile',
      method: 'GET',
    });

    assert(
      unauthProfileRes.statusCode === 401,
      'Unauthenticated profile access rejected with 401',
      `Status: ${unauthProfileRes.statusCode}`
    );

    // Unauthenticated access to admin team endpoints
    const unauthAdminRes = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/admin/team',
      method: 'GET',
    });

    assert(
      unauthAdminRes.statusCode === 401,
      'Unauthenticated admin team access rejected with 401',
      `Status: ${unauthAdminRes.statusCode}`
    );
  } catch (err) {
    assert(false, 'IDOR & Access Control Test', err.message);
  }

  // ----------------------------------------------------
  // TEST 5: File Upload Security & Magic Bytes (Req 16)
  // ----------------------------------------------------
  console.log('\n--- 5. Testing File Upload Validation & Signature Checks ---');
  try {
    // 5A: Extension validation - attempt to upload a PHP script
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const fakePhpPayload = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="images"; filename="backdoor.php"',
      'Content-Type: application/x-php',
      '',
      '<?php echo "malicious code"; ?>',
      `--${boundary}--`,
    ].join('\r\n');

    const extRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/products/upload-images',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(fakePhpPayload),
        },
      },
      fakePhpPayload
    );

    // Should be rejected by auth or fileFilter
    assert(
      extRes.statusCode === 401 || extRes.statusCode === 400,
      'Malicious .php file upload rejected (unauthorized or invalid extension)',
      `Status: ${extRes.statusCode}`
    );

    // 5B: Direct magic bytes function check
    const { isValidImageSignature } = require('../backend/dist/middleware/upload');
    const validJpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const validPngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const fakeScriptHeader = Buffer.from('<?php system($_GET["cmd"]); ?>');

    assert(isValidImageSignature(validJpegHeader) === true, 'Magic bytes correctly recognizes JPEG');
    assert(isValidImageSignature(validPngHeader) === true, 'Magic bytes correctly recognizes PNG');
    assert(isValidImageSignature(fakeScriptHeader) === false, 'Magic bytes strictly rejects PHP/text executable content');
  } catch (err) {
    assert(false, 'File Upload Security Test', err.message);
  }

  // ----------------------------------------------------
  // TEST 6: Mandatory Requirement 11: Authentication Rate Limiter
  // Exactly 5 attempts allowed in 15 mins across auth routes; 6th rejected with 429
  // ----------------------------------------------------
  console.log('\n--- 6. Testing Mandatory Req 11: 5 Attempts / 15 Mins Across All Auth Routes ---');
  try {
    const rateLimitIP = '198.51.100.99'; // Dedicated test IP via X-Forwarded-For
    const responses = [];

    // Make 5 authentication attempts across different auth endpoints to test SHARED quota
    const testEndpoints = [
      { path: '/api/auth/login', body: { email: 'test@example.com', password: 'wrong' } },
      { path: '/api/auth/resend-verification', body: { email: 'test@example.com' } },
      { path: '/api/auth/forgot-password', body: { email: 'test@example.com' } },
      { path: '/api/auth/refresh-token', body: { refreshToken: 'fake_token' } },
      { path: '/api/auth/verify-email', body: { token: 'fake_token' } },
    ];

    for (let i = 0; i < testEndpoints.length; i++) {
      const ep = testEndpoints[i];
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: 4000,
          path: ep.path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-For': rateLimitIP,
          },
        },
        ep.body
      );
      responses.push(res);
      console.log(`   Attempt ${i + 1} (${ep.path}): HTTP ${res.statusCode}, Remaining: ${res.headers['ratelimit-remaining']}`);
    }

    // Verify first 5 attempts were allowed through the rate limiter (not 429)
    const allAllowed = responses.every((r) => r.statusCode !== 429);
    assert(allAllowed, 'Attempts 1 through 5 permitted through authentication rate limiter');

    // Attempt 6: MUST be blocked with HTTP 429 Too Many Requests
    const attempt6 = await makeRequest(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': rateLimitIP,
        },
      },
      { email: 'test@example.com', password: 'wrong' }
    );

    console.log(`   Attempt 6 (/api/auth/login): HTTP ${attempt6.statusCode}, Retry-After: ${attempt6.headers['retry-after']}`);

    assert(
      attempt6.statusCode === 429,
      'Attempt 6 strictly blocked with HTTP 429 Too Many Requests',
      `Received status: ${attempt6.statusCode}`
    );

    assert(
      attempt6.headers['retry-after'] !== undefined,
      'HTTP 429 response includes Retry-After header',
      `Retry-After: ${attempt6.headers['retry-after']}`
    );

    assert(
      attempt6.data.error?.code === 'RATE_LIMIT_EXCEEDED',
      'HTTP 429 response returns clear user-friendly error code RATE_LIMIT_EXCEEDED',
      JSON.stringify(attempt6.data)
    );
  } catch (err) {
    assert(false, 'Rate Limiter Test', err.message);
  }

  // ----------------------------------------------------
  // TEST 7: CORS Restriction & Handling (Req 12)
  // ----------------------------------------------------
  console.log('\n--- 7. Testing CORS Security ---');
  try {
    const corsRes = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/products',
      method: 'GET',
      headers: {
        Origin: 'https://malicious-attacker-site.com',
      },
    });

    assert(
      corsRes.statusCode === 403,
      'Unauthorized cross-origin request rejected with HTTP 403',
      `Status: ${corsRes.statusCode}`
    );
  } catch (err) {
    assert(false, 'CORS Test', err.message);
  }

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`   AUDIT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
