const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const REQUIRED_KEYS = [
  'META_APP_ID',
  'META_APP_SECRET',
  'META_ACCESS_TOKEN',
  'INSTAGRAM_BUSINESS_ACCOUNT_ID',
  'ANTHROPIC_API_KEY',
];

const OPTIONAL_KEYS = [
  'PORT',
  'NODE_ENV',
  'CORS_ORIGIN',
  'CACHE_TTL_MINUTES',
  'DB_PATH',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'GRAPH_API_VERSION',
  'GRAPH_API_BASE_URL',
  'APIFY_API_TOKEN',
];

function maskValue(value) {
  if (!value) return '(not set)';
  if (value.length <= 8) return '****';
  return value.slice(0, 4) + '****' + value.slice(-4);
}

function validateEnv() {
  const missing = [];
  const present = [];
  const isDemo = [];

  for (const key of REQUIRED_KEYS) {
    const val = process.env[key];
    if (!val || val.startsWith('YOUR_') || val.startsWith('sk-ant-YOUR')) {
      isDemo.push(key);
    } else {
      present.push(key);
    }
  }

  console.log('\n─── Environment Config ──────────────────────────────────');
  for (const key of REQUIRED_KEYS) {
    const val = process.env[key];
    const status = present.includes(key) ? '✓' : '⚠ DEMO';
    console.log(`  ${status}  ${key}: ${maskValue(val)}`);
  }
  for (const key of OPTIONAL_KEYS) {
    const val = process.env[key];
    if (val) console.log(`  ✓  ${key}: ${maskValue(val)}`);
  }
  console.log('─────────────────────────────────────────────────────────\n');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Return whether we're in demo mode (placeholder values)
  return isDemo.length > 0;
}

const DEMO_MODE = validateEnv();

const config = Object.freeze({
  meta: {
    appId: process.env.META_APP_ID,
    appSecret: process.env.META_APP_SECRET,
    accessToken: process.env.META_ACCESS_TOKEN,
    igAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
    apiVersion: process.env.GRAPH_API_VERSION || 'v21.0',
    baseUrl: process.env.GRAPH_API_BASE_URL || 'https://graph.facebook.com',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  cache: {
    ttlMinutes: parseInt(process.env.CACHE_TTL_MINUTES || '60', 10),
    dbPath: process.env.DB_PATH || './server/db/cache.sqlite',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  apify: {
    apiToken: process.env.APIFY_API_TOKEN || null,
  },
  demoMode: DEMO_MODE,
});

module.exports = config;
