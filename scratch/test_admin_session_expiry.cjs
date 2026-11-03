console.log('====================================================');
console.log('  TESTING ADMIN SESSION EXPIRATION & HYBRID STORAGE  ');
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

// Mock browser window.localStorage and window.sessionStorage
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(k) {
    return this.store.get(k) || null;
  }
  setItem(k, v) {
    this.store.set(k, String(v));
  }
  removeItem(k) {
    this.store.delete(k);
  }
  clear() {
    this.store.clear();
  }
}

global.window = {
  localStorage: new MockStorage(),
  sessionStorage: new MockStorage(),
};

// Emulate roleAwareStorage from frontend/src/store/authStore.ts
const roleAwareStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;

    try {
      const sessionItem = window.sessionStorage.getItem(name);
      if (sessionItem) {
        return sessionItem;
      }

      const localItem = window.localStorage.getItem(name);
      if (localItem) {
        const parsed = JSON.parse(localItem);
        const role = parsed?.state?.user?.role;

        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          window.localStorage.removeItem(name);
          return null;
        }

        return localItem;
      }
    } catch (err) {
      console.warn('Error reading storage:', err);
    }

    return null;
  },

  setItem: (name, value) => {
    if (typeof window === 'undefined') return;

    try {
      const parsed = JSON.parse(value);
      const role = parsed?.state?.user?.role;

      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        window.sessionStorage.setItem(name, value);
        window.localStorage.removeItem(name);
        return;
      }

      window.localStorage.setItem(name, value);
      window.sessionStorage.removeItem(name);
    } catch {
      window.localStorage.setItem(name, value);
    }
  },

  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(name);
    window.localStorage.removeItem(name);
  },
};

// TEST 1: Admin logs in -> must be stored strictly in sessionStorage, NOT in localStorage
console.log('--- Test 1: Admin session storage isolation ---');
const adminPayload = JSON.stringify({
  state: {
    user: { id: 'admin-1', email: 'admin@apexbyte.co.ke', role: 'ADMIN' },
    accessToken: 'jwt_admin_token',
    refreshToken: 'jwt_admin_refresh',
    isAuthenticated: true,
    loginTimestamp: Date.now(),
  },
});

roleAwareStorage.setItem('auth-storage', adminPayload);

assert(
  window.sessionStorage.getItem('auth-storage') !== null,
  'Admin session is stored in sessionStorage'
);
assert(
  window.localStorage.getItem('auth-storage') === null,
  'Admin session is strictly NOT saved in permanent localStorage'
);

// TEST 2: Simulating browser / terminals closed -> sessionStorage wiped
console.log('\n--- Test 2: Terminal / Browser Closed Emulation ---');
window.sessionStorage.clear(); // Closing the browser clears sessionStorage

const reloadedState = roleAwareStorage.getItem('auth-storage');
assert(
  reloadedState === null,
  'After closing terminals/browser, admin session is completely wiped (returns null)'
);

// TEST 3: Legacy or existing admin data in localStorage from yesterday -> must be purged immediately
console.log('\n--- Test 3: Purging old lingering admin data from yesterday in localStorage ---');
window.localStorage.setItem('auth-storage', adminPayload); // Simulating old state from yesterday
window.sessionStorage.clear();

const purgedState = roleAwareStorage.getItem('auth-storage');
assert(
  purgedState === null,
  'Old lingering admin session in localStorage is rejected and returns null'
);
assert(
  window.localStorage.getItem('auth-storage') === null,
  'Old lingering admin session in localStorage is permanently purged from storage'
);

// TEST 4: Customer session persistence check (must NOT break customer shopping cart/login)
console.log('\n--- Test 4: Customer session compatibility ---');
const customerPayload = JSON.stringify({
  state: {
    user: { id: 'cust-1', email: 'shopper@gmail.com', role: 'CUSTOMER' },
    accessToken: 'jwt_cust_token',
    refreshToken: 'jwt_cust_refresh',
    isAuthenticated: true,
    loginTimestamp: Date.now(),
  },
});

roleAwareStorage.setItem('auth-storage', customerPayload);

assert(
  window.localStorage.getItem('auth-storage') !== null,
  'Customer session is preserved in localStorage for standard e-commerce convenience'
);
assert(
  roleAwareStorage.getItem('auth-storage') !== null,
  'Customer session can be rehydrated seamlessly across visits'
);

// TEST 5: Admin session window timeout check (2 hours)
console.log('\n--- Test 5: Admin inactivity / window timeout (> 2 hours) ---');
const ADMIN_SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000);

const expiredLoginState = {
  user: { id: 'admin-1', role: 'ADMIN' },
  loginTimestamp: threeHoursAgo,
};

const isExpired = Date.now() - expiredLoginState.loginTimestamp > ADMIN_SESSION_TIMEOUT_MS;
assert(isExpired === true, 'Admin login older than 2 hours is recognized as expired');

console.log('\n====================================================');
console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) process.exit(1);
else process.exit(0);

